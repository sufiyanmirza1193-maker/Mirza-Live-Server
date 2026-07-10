export type PluginStatus = "ACTIVE" | "INACTIVE" | "ERROR" | "UPDATING";

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  status: PluginStatus;
  hooks: string[];
  configSchema: Record<string, unknown>;
  currentConfig: Record<string, unknown>;
  icon?: string;
}

export interface NotificationChannelConfig {
  id: string;
  provider: "DISCORD" | "TELEGRAM" | "SLACK" | "WEBHOOK" | "EMAIL";
  name: string;
  enabled: boolean;
  targetUrl: string;
  events: string[];
}
