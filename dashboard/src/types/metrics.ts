export interface HostHardwareMetrics {
  cpuPercent: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  memoryPercent: number;
  gpuPercent?: number;
  diskUsedGb: number;
  diskTotalGb: number;
  diskPercent: number;
  networkRxKbps: number;
  networkTxKbps: number;
  timestamp: string;
}

export interface TelemetryDataPoint {
  timestamp: string;
  bitrate: number;
  fps: number;
  droppedFrames: number;
  latencyMs: number;
  cpuPercent: number;
  memoryPercent: number;
}

export interface GlobalDashboardStats {
  channelsOnline: number;
  channelsTotal: number;
  streamsRunning: number;
  totalViewers: number;
  totalBitrateKbps: number;
  hostHardware: HostHardwareMetrics;
  serverUptimeSeconds: number;
}
