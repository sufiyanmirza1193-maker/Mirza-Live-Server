"""System hardware monitoring and resource alerting engine.

Samples host CPU utilization percentage and system memory consumption using `psutil`,
evaluating measurements against configurable warning thresholds.
"""

import logging
from typing import Optional
from pydantic import BaseModel, Field
import psutil

from mirza.config.models import MonitoringConfig


class SystemMetrics(BaseModel):
    """Snapshot of system CPU and RAM utilization metrics.

    Attributes:
        cpu_percent: Current host CPU utilization percentage (`0.0` to `100.0`).
        ram_percent: Current system memory utilization percentage.
        ram_used_mb: Total active RAM consumption in Megabytes.
        ram_total_mb: Total physical RAM installed on host in Megabytes.
        is_cpu_overloaded: Whether `cpu_percent` exceeds configured threshold.
        is_ram_overloaded: Whether `ram_percent` exceeds configured threshold.
    """

    cpu_percent: float = Field(..., ge=0.0, le=100.0)
    ram_percent: float = Field(..., ge=0.0, le=100.0)
    ram_used_mb: float = Field(..., ge=0.0)
    ram_total_mb: float = Field(..., gt=0.0)
    is_cpu_overloaded: bool = Field(default=False)
    is_ram_overloaded: bool = Field(default=False)


class SystemHealthMonitor:
    """Monitors host CPU and RAM metrics, logging warnings if limits are crossed.

    Attributes:
        config: `MonitoringConfig` containing threshold limits.
        logger: Dedicated logger for reporting hardware bottlenecks.
    """

    def __init__(
        self,
        config: MonitoringConfig,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        """Initializes the system health monitor.

        Args:
            config: Threshold configuration (`cpu_max_percent`, `ram_max_percent`).
            logger: Optional diagnostic logger instance.
        """
        self.config = config
        self.logger = logger or logging.getLogger("mirza.monitor.system")

    def sample_metrics(self) -> SystemMetrics:
        """Collects current hardware metrics via `psutil` and checks against limits.

        Returns:
            SystemMetrics: Data model containing CPU/RAM metrics and overload status.
        """
        try:
            # interval=None returns immediate non-blocking CPU percentage across all cores
            cpu_pct = psutil.cpu_percent(interval=None)
            memory_info = psutil.virtual_memory()

            ram_pct = float(memory_info.percent)
            ram_used_mb = float(memory_info.used) / (1024.0 * 1024.0)
            ram_total_mb = float(memory_info.total) / (1024.0 * 1024.0)
        except Exception as psutil_error:
            self.logger.error(f"Failed to query system hardware telemetry via psutil: {psutil_error}")
            return SystemMetrics(
                cpu_percent=0.0,
                ram_percent=0.0,
                ram_used_mb=0.0,
                ram_total_mb=1.0,
                is_cpu_overloaded=False,
                is_ram_overloaded=False,
            )

        is_cpu_overloaded = cpu_pct >= self.config.cpu_max_percent
        is_ram_overloaded = ram_pct >= self.config.ram_max_percent

        metrics = SystemMetrics(
            cpu_percent=cpu_pct,
            ram_percent=ram_pct,
            ram_used_mb=round(ram_used_mb, 2),
            ram_total_mb=round(ram_total_mb, 2),
            is_cpu_overloaded=is_cpu_overloaded,
            is_ram_overloaded=is_ram_overloaded,
        )

        if is_cpu_overloaded:
            self.logger.warning(
                f"[SystemMonitor] HIGH CPU ALERT: {cpu_pct:.1f}% "
                f"(Threshold: {self.config.cpu_max_percent:.1f}%)"
            )

        if is_ram_overloaded:
            self.logger.warning(
                f"[SystemMonitor] HIGH RAM ALERT: {ram_pct:.1f}% / {metrics.ram_used_mb:.1f} MB "
                f"(Threshold: {self.config.ram_max_percent:.1f}%)"
            )

        return metrics
