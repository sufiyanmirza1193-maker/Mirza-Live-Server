export type AlertSeverity = "CRITICAL" | "WARNING" | "INFO";
export type AlertCategory = "CPU" | "RAM" | "DISK" | "STREAM_OFFLINE" | "RECONNECT" | "SCHEDULER" | "PLUGIN" | "SECURITY";

export interface SystemAlert {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  channelId?: string;
  timestamp: string;
  isResolved: boolean;
  resolvedAt?: string;
  actionRequired?: string;
}
