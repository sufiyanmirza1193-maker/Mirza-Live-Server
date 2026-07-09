"""Configuration loading and environment variable resolution engine.

Parses `config.yaml`, recursively resolves `${ENV_VAR}` template strings using
system environment and `.env` files (`python-dotenv`), and validates the result
against strict Pydantic data models.
"""

import os
import re
from pathlib import Path
from typing import Any, Dict

import yaml
from dotenv import load_dotenv

from mirza.config.models import AppConfig


class ConfigLoadError(Exception):
    """Raised when the configuration YAML file cannot be located or parsed."""


class EnvVariableMissingError(Exception):
    """Raised when a required environment variable placeholder is missing and has no default."""


# Regex matching ${VAR_NAME} or ${VAR_NAME:default_value}
_ENV_VAR_REGEX = re.compile(r"\$\{([^}:]+)(?::([^}]*))?\}")


def resolve_env_vars(data: Any) -> Any:
    """Recursively traverses data structures replacing `${VAR_NAME:default}` with env values.

    Args:
        data: Arbitrary data structure (dict, list, string, or primitive) from YAML.

    Returns:
        Any: Data structure with all environment placeholders resolved.

    Raises:
        EnvVariableMissingError: If a `${VAR}` placeholder exists in data but is not set
            in `os.environ` and has no `:default` syntax.
    """
    if isinstance(data, dict):
        return {key: resolve_env_vars(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [resolve_env_vars(item) for item in data]
    elif isinstance(data, str):
        matches = list(_ENV_VAR_REGEX.finditer(data))
        if not matches:
            return data

        # If the entire string is a single ${VAR:default} match, preserve target type (e.g., int/float if digits)
        if len(matches) == 1 and matches[0].group(0) == data:
            var_name = matches[0].group(1).strip()
            default_val = matches[0].group(2)
            env_val = os.getenv(var_name)

            if env_val is not None:
                return env_val
            elif default_val is not None:
                return default_val
            else:
                raise EnvVariableMissingError(
                    f"Required environment variable '{var_name}' is not set and has no default value."
                )

        # Otherwise perform string replacement for embedded placeholders
        resolved_str = data
        for match in matches:
            var_name = match.group(1).strip()
            default_val = match.group(2)
            env_val = os.getenv(var_name)

            if env_val is not None:
                replacement = env_val
            elif default_val is not None:
                replacement = default_val
            else:
                raise EnvVariableMissingError(
                    f"Required environment variable '{var_name}' is not set and has no default value."
                )
            resolved_str = resolved_str.replace(match.group(0), str(replacement))

        return resolved_str
    else:
        return data


def load_config(
    config_path: Path = Path("config.yaml"),
    dotenv_path: Path = Path(".env"),
) -> AppConfig:
    """Loads, resolves, and validates the master server configuration.

    Args:
        config_path: Path to the YAML configuration file.
        dotenv_path: Path to the `.env` secrets file to load into `os.environ`.

    Returns:
        AppConfig: Validated Pydantic master configuration object.

    Raises:
        ConfigLoadError: If `config_path` does not exist or has invalid YAML syntax.
        EnvVariableMissingError: If required environment variable placeholders are undefined.
        pydantic.ValidationError: If resolved configuration fails type or rule validation.
    """
    # Load .env variables into environment if file exists
    if dotenv_path.exists():
        load_dotenv(dotenv_path=dotenv_path, override=True)
    else:
        # Check parent directories or rely on existing os.environ
        load_dotenv(override=False)

    if not config_path.exists():
        raise ConfigLoadError(f"Configuration file not found: {config_path.resolve()}")

    try:
        with open(config_path, "r", encoding="utf-8") as file:
            raw_yaml_data = yaml.safe_load(file)
    except yaml.YAMLError as exc:
        raise ConfigLoadError(f"YAML parsing syntax error in {config_path}: {exc}") from exc
    except Exception as exc:
        raise ConfigLoadError(f"Failed to read configuration file {config_path}: {exc}") from exc

    if not raw_yaml_data or not isinstance(raw_yaml_data, dict):
        raise ConfigLoadError(f"Configuration file {config_path} must contain a valid YAML dictionary.")

    # Substitute environment variables throughout the parsed dictionary
    resolved_data = resolve_env_vars(raw_yaml_data)

    # Validate against strict Pydantic V2 models
    return AppConfig.model_validate(resolved_data)
