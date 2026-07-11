export type StreamingPlatform = "youtube" | "custom"

export type ConnectionStatus = "idle" | "testing" | "verified" | "error"

export type ResolutionSetting = "1080p60" | "4k" | "720p"
export type FpsSetting = "60" | "30"
export type BitrateSetting = "6000" | "9000" | "4500"
export type AudioSetting = "aac_160" | "aac_320"
export type EncoderSetting = "nvenc" | "x264"
export type ReconnectPolicy = "infinite_exponential" | "fixed_5" | "none"

export interface VideoClip {
  id: string
  filename: string
  durationSec: number
  resolution: string
  codec: string
  fps: number
  size: string
  status: "READY" | "CHECKING" | "WARNING" | "CORRUPT"
  color: string
}

export interface OnboardingWizardState {
  step: number
  platform: StreamingPlatform
  rtmpUrl: string
  streamKey: string
  showStreamKey: boolean
  connectionStatus: ConnectionStatus
  pingLatency: number | null
  playlistName: string
  playlistDesc: string
  thumbnailUrl: string
  repeatForever: boolean
  shuffle: boolean
  autoSkipCorrupt: boolean
  continueOnError: boolean
  videos: VideoClip[]
  isValidating: boolean
  validationDone: boolean
  resolutionSetting: ResolutionSetting
  fpsSetting: FpsSetting
  bitrateSetting: BitrateSetting
  audioSetting: AudioSetting
  encoderSetting: EncoderSetting
  reconnectPolicy: ReconnectPolicy
}

export interface OnboardingWizardContextType {
  state: OnboardingWizardState
  setStep: (step: number) => void
  setPlatform: (platform: StreamingPlatform) => void
  setRtmpUrl: (url: string) => void
  setStreamKey: (key: string) => void
  setShowStreamKey: (show: boolean) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setPingLatency: (latency: number | null) => void
  setPlaylistName: (name: string) => void
  setPlaylistDesc: (desc: string) => void
  setThumbnailUrl: (url: string) => void
  setRepeatForever: (repeat: boolean) => void
  setShuffle: (shuffle: boolean) => void
  setAutoSkipCorrupt: (skip: boolean) => void
  setContinueOnError: (cont: boolean) => void
  setVideos: React.Dispatch<React.SetStateAction<VideoClip[]>>
  setIsValidating: (validating: boolean) => void
  setValidationDone: (done: boolean) => void
  setResolutionSetting: (val: ResolutionSetting) => void
  setFpsSetting: (val: FpsSetting) => void
  setBitrateSetting: (val: BitrateSetting) => void
  setAudioSetting: (val: AudioSetting) => void
  setEncoderSetting: (val: EncoderSetting) => void
  setReconnectPolicy: (val: ReconnectPolicy) => void
  moveVideo: (index: number, direction: "up" | "down") => void
  removeVideo: (id: string) => void
  duplicateVideo: (id: string) => void
  addVideoFile: (filename: string) => void
  resetWizard: () => void
}
