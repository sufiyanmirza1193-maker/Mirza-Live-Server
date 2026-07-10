export type ChannelStatus = "ONLINE" | "BACKOFF" | "OFFLINE" | "STALLED" | "STARTING";

export interface ChannelHealth {
  status: ChannelStatus;
  healthScore: number; // 0 - 100
  uptimeSeconds: number;
  lastError?: string;
  consecutiveFailures: number;
}

export interface VideoEncodingStats {
  fps: number;
  targetFps: number;
  bitrateKbps: number;
  targetBitrateKbps: number;
  droppedFrames: number;
  speed: number; // e.g. 1.0x
  resolution: string; // e.g. "1920x1080"
  codec: string; // e.g. "libx264"
}

export interface ChannelQueueItem {
  id: string;
  filename: string;
  filepath: string;
  durationSeconds: number;
  codec: string;
  resolution: string;
  thumbnailUrl?: string;
  isValidated: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  status: ChannelStatus;
  health: ChannelHealth;
  encodingStats: VideoEncodingStats;
  currentMedia?: ChannelQueueItem;
  playlistCount: number;
  viewers: number;
  rtmpUrlMasked: string;
  createdAt: string;
  updatedAt: string;
}
