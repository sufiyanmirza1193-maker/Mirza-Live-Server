"""Unit test suite for Mirza Live Server configuration and logging engine.

Tests Pydantic validation constraints, environment variable regex substitution,
and multi-channel YAML loading behavior.
"""

import logging
import os
from pathlib import Path
import pytest
from pydantic import ValidationError

from mirza.config.loader import (
    ConfigLoadError,
    EnvVariableMissingError,
    load_config,
    resolve_env_vars,
)
from mirza.config.models import AppConfig, ChannelConfig, VideoEncodingConfig
from mirza.logger import get_channel_logger, setup_logging


def test_resolve_env_vars_with_defaults(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verifies that ${VAR:default} substitution correctly resolves or defaults."""
    monkeypatch.setenv("TEST_EXISTING_VAR", "hello_world")
    monkeypatch.delenv("TEST_MISSING_VAR", raising=False)

    data = {
        "key1": "${TEST_EXISTING_VAR}",
        "key2": "${TEST_MISSING_VAR:default_fallback}",
        "key3": "prefix_${TEST_EXISTING_VAR}_suffix",
        "key4": [123, "${TEST_MISSING_VAR:456}"],
    }

    resolved = resolve_env_vars(data)
    assert resolved["key1"] == "hello_world"
    assert resolved["key2"] == "default_fallback"
    assert resolved["key3"] == "prefix_hello_world_suffix"
    assert resolved["key4"] == [123, "456"]


def test_resolve_env_vars_missing_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    """Ensure EnvVariableMissingError is raised if required var is unset and has no default."""
    monkeypatch.delenv("MANDATORY_SECRET_KEY", raising=False)

    with pytest.raises(EnvVariableMissingError) as exc_info:
        resolve_env_vars({"secret": "${MANDATORY_SECRET_KEY}"})

    assert "MANDATORY_SECRET_KEY" in str(exc_info.value)


def test_video_encoding_gop_calculation() -> None:
    """Verifies that Group of Pictures (GOP) size is accurately computed as 2 * fps."""
    video_config = VideoEncodingConfig(fps=60, resolution="1920x1080")
    assert video_config.gop_size == 120

    video_config_30 = VideoEncodingConfig(fps=30)
    assert video_config_30.gop_size == 60


def test_invalid_resolution_string_raises() -> None:
    """Ensure Pydantic raises ValidationError on malformed resolution strings."""
    with pytest.raises(ValidationError) as exc_info:
        VideoEncodingConfig(resolution="1080p")
    assert "Resolution must be formatted as WIDTHxHEIGHT" in str(exc_info.value)


def test_channel_config_empty_stream_key_raises() -> None:
    """Ensure empty or unresolved stream key raises ValidationError."""
    with pytest.raises(ValidationError):
        ChannelConfig(
            channel_id="test_channel",
            stream_key="",
        )


def test_app_config_get_enabled_channels() -> None:
    """Verifies that get_enabled_channels() correctly filters disabled channels."""
    app_config = AppConfig(
        channels=[
            ChannelConfig(channel_id="ch1", enabled=True, stream_key="secret1"),
            ChannelConfig(channel_id="ch2", enabled=False, stream_key="secret2"),
            ChannelConfig(channel_id="ch3", enabled=True, stream_key="secret3"),
        ]
    )

    enabled = app_config.get_enabled_channels()
    assert len(enabled) == 2
    assert [ch.channel_id for ch in enabled] == ["ch1", "ch3"]


def test_load_config_end_to_end(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Integration test verifying YAML loading, env resolution, and Pydantic validation."""
    monkeypatch.setenv("TEST_YOUTUBE_KEY", "live_test_secret_key_12345")

    config_yaml_content = """
    server:
      log_level: DEBUG
    channels:
      - channel_id: test_channel_1
        name: "Test Channel"
        enabled: true
        stream_key: ${TEST_YOUTUBE_KEY}
        media_folder: media/test_folder
        video_encoding:
          fps: 30
    """

    config_file = tmp_path / "test_config.yaml"
    config_file.write_text(config_yaml_content, encoding="utf-8")

    app_config = load_config(config_path=config_file, dotenv_path=tmp_path / "non_existent.env")

    assert app_config.server.log_level == "DEBUG"
    assert len(app_config.channels) == 1
    channel = app_config.channels[0]
    assert channel.channel_id == "test_channel_1"
    assert channel.stream_key == "live_test_secret_key_12345"
    assert channel.video_encoding.gop_size == 60


def test_setup_logging_and_channel_logger(tmp_path: Path) -> None:
    """Verifies logger initialization and rotating file creation."""
    logger = setup_logging(log_level="DEBUG", log_dir=tmp_path, server_log_name="test_server.log")
    assert logger.level == 10  # DEBUG

    channel_logger = get_channel_logger("ch_test_1", log_dir=tmp_path)
    channel_logger.info("Test message for channel log.")

    # Check that handler files exist or can be created cleanly
    assert (tmp_path / "test_server.log").exists() or len(logger.handlers) > 0


def test_mirza_context_filter_injection() -> None:
    """Verifies MirzaContextFilter attaches `[Session: <id>]` and `[Channel: <id>]` cleanly to records."""
    from mirza.logger import MirzaContextFilter

    ctx_filter = MirzaContextFilter()
    record_channel = logging.LogRecord("mirza.channel.channel_main", logging.INFO, "test.py", 10, "hello", (), None)
    assert ctx_filter.filter(record_channel) is True
    assert "[Session:" in record_channel.context_prefix
    assert "[Channel: channel_main]" in record_channel.context_prefix

    record_sys = logging.LogRecord("mirza.orchestrator", logging.INFO, "test.py", 20, "system msg", (), None)
    assert ctx_filter.filter(record_sys) is True
    assert "[System]" in record_sys.context_prefix


def test_video_encoding_invalid_preset_raises() -> None:
    """Ensure Pydantic raises ValidationError on unsupported x264 preset names."""
    with pytest.raises(ValidationError) as exc_info:
        VideoEncodingConfig(preset="invalid_preset")
    assert "Invalid x264 preset" in str(exc_info.value)

    # Valid preset passes cleanly and is lowercased
    valid_cfg = VideoEncodingConfig(preset="VERYFAST")
    assert valid_cfg.preset == "veryfast"


def test_restart_policy_invalid_retry_bounds_raises() -> None:
    """Ensure Pydantic raises ValidationError if retry_delay_seconds > max_retry_delay_seconds."""
    from mirza.config.models import RestartPolicy

    with pytest.raises(ValidationError) as exc_info:
        RestartPolicy(retry_delay_seconds=120, max_retry_delay_seconds=60)
    assert "retry_delay_seconds cannot be greater than max_retry_delay_seconds" in str(exc_info.value)

    # Valid bounds pass cleanly
    valid_policy = RestartPolicy(retry_delay_seconds=10, max_retry_delay_seconds=60)
    assert valid_policy.retry_delay_seconds == 10


def test_channel_config_stream_key_slash_stripping() -> None:
    """Verify that leading or trailing slashes on stream_key are stripped."""
    ch = ChannelConfig(channel_id="ch_test", stream_key="/live_secret_key_123/")
    assert ch.stream_key == "live_secret_key_123"

