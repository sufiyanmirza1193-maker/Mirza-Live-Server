export type MediaValidationStatus = "VALID" | "CORRUPT" | "UNTESTED" | "WARNING";

export interface MediaMetadata {
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
  videoCodec: string;
  audioCodec: string;
  audioChannels: number;
  bitrateKbps: number;
}

export interface MediaFile {
  id: string;
  filename: string;
  filepath: string;
  sizeBytes: number;
  folder: string;
  status: MediaValidationStatus;
  metadata?: MediaMetadata;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistScheduleProfile {
  id: string;
  channelId: string;
  name: string;
  cronExpression: string;
  playlistFolder: string;
  shuffle: boolean;
  loop: boolean;
  youtubeTitle?: string;
  youtubeDescription?: string;
  youtubeTags?: string[];
}
