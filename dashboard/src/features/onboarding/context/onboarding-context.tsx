"use client"

import * as React from "react"
import {
  VideoClip,
  StreamingPlatform,
  ConnectionStatus,
  ResolutionSetting,
  FpsSetting,
  BitrateSetting,
  AudioSetting,
  EncoderSetting,
  ReconnectPolicy,
  OnboardingWizardState,
  OnboardingWizardContextType,
} from "@/types/onboarding"

const DEFAULT_VIDEOS: VideoClip[] = [
  {
    id: "clip_101",
    filename: "ep_101_rainy_night_lofi.mp4",
    durationSec: 4462,
    resolution: "1920x1080",
    codec: "h264/aac",
    fps: 60,
    size: "142.4 MB",
    status: "READY",
    color: "#FF5A1F",
  },
  {
    id: "clip_102",
    filename: "ep_102_lofi_mix_2026.mp4",
    durationSec: 4512,
    resolution: "1920x1080",
    codec: "h264/aac",
    fps: 60,
    size: "158.1 MB",
    status: "READY",
    color: "#10B981",
  },
  {
    id: "clip_103",
    filename: "ep_103_chill_study_session.mp4",
    durationSec: 6176,
    resolution: "1920x1080",
    codec: "h264/aac",
    fps: 60,
    size: "210.8 MB",
    status: "READY",
    color: "#3B82F6",
  },
]

const INITIAL_STATE: OnboardingWizardState = {
  step: 1,
  platform: "youtube",
  rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
  streamKey: "xxxx-xxxx-xxxx-xxxx",
  showStreamKey: false,
  connectionStatus: "idle",
  pingLatency: null,
  playlistName: "24/7 Lo-Fi Hip-Hop & Study Beats",
  playlistDesc: "Continuous autonomous RTMP broadcast loop with zero-drop audio/video sync.",
  thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
  repeatForever: true,
  shuffle: false,
  autoSkipCorrupt: true,
  continueOnError: true,
  videos: DEFAULT_VIDEOS,
  isValidating: false,
  validationDone: true,
  resolutionSetting: "1080p60",
  fpsSetting: "60",
  bitrateSetting: "6000",
  audioSetting: "aac_160",
  encoderSetting: "nvenc",
  reconnectPolicy: "infinite_exponential",
}

const STORAGE_KEY = "mirza_onboarding_draft_v2"

const OnboardingWizardContext = React.createContext<OnboardingWizardContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<OnboardingWizardState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          return { ...INITIAL_STATE, ...parsed }
        }
      } catch (err) {
        console.warn("Failed to load onboarding draft state:", err)
      }
    }
    return INITIAL_STATE
  })

  // Persist draft across session navigation
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Exclude sensitive stream key from unencrypted sessionStorage draft if user typed real key
        const safeState = { ...state }
        if (safeState.streamKey !== "xxxx-xxxx-xxxx-xxxx") {
          safeState.streamKey = "xxxx-xxxx-xxxx-xxxx"
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeState))
      } catch (err) {
        console.warn("Failed to save onboarding draft state:", err)
      }
    }
  }, [state])

  const setStep = React.useCallback((step: number) => setState((s) => ({ ...s, step })), [])
  const setPlatform = React.useCallback((platform: StreamingPlatform) => setState((s) => ({ ...s, platform })), [])
  const setRtmpUrl = React.useCallback((rtmpUrl: string) => setState((s) => ({ ...s, rtmpUrl })), [])
  const setStreamKey = React.useCallback((streamKey: string) => setState((s) => ({ ...s, streamKey })), [])
  const setShowStreamKey = React.useCallback((showStreamKey: boolean) => setState((s) => ({ ...s, showStreamKey })), [])
  const setConnectionStatus = React.useCallback((connectionStatus: ConnectionStatus) => setState((s) => ({ ...s, connectionStatus })), [])
  const setPingLatency = React.useCallback((pingLatency: number | null) => setState((s) => ({ ...s, pingLatency })), [])
  const setPlaylistName = React.useCallback((playlistName: string) => setState((s) => ({ ...s, playlistName })), [])
  const setPlaylistDesc = React.useCallback((playlistDesc: string) => setState((s) => ({ ...s, playlistDesc })), [])
  const setThumbnailUrl = React.useCallback((thumbnailUrl: string) => setState((s) => ({ ...s, thumbnailUrl })), [])
  const setRepeatForever = React.useCallback((repeatForever: boolean) => setState((s) => ({ ...s, repeatForever })), [])
  const setShuffle = React.useCallback((shuffle: boolean) => setState((s) => ({ ...s, shuffle })), [])
  const setAutoSkipCorrupt = React.useCallback((autoSkipCorrupt: boolean) => setState((s) => ({ ...s, autoSkipCorrupt })), [])
  const setContinueOnError = React.useCallback((continueOnError: boolean) => setState((s) => ({ ...s, continueOnError })), [])
  const setVideos = React.useCallback((videosOrFn: React.SetStateAction<VideoClip[]>) => {
    setState((s) => {
      const nextVideos = typeof videosOrFn === "function" ? videosOrFn(s.videos) : videosOrFn
      return { ...s, videos: nextVideos }
    })
  }, [])
  const setIsValidating = React.useCallback((isValidating: boolean) => setState((s) => ({ ...s, isValidating })), [])
  const setValidationDone = React.useCallback((validationDone: boolean) => setState((s) => ({ ...s, validationDone })), [])
  const setResolutionSetting = React.useCallback((resolutionSetting: ResolutionSetting) => setState((s) => ({ ...s, resolutionSetting })), [])
  const setFpsSetting = React.useCallback((fpsSetting: FpsSetting) => setState((s) => ({ ...s, fpsSetting })), [])
  const setBitrateSetting = React.useCallback((bitrateSetting: BitrateSetting) => setState((s) => ({ ...s, bitrateSetting })), [])
  const setAudioSetting = React.useCallback((audioSetting: AudioSetting) => setState((s) => ({ ...s, audioSetting })), [])
  const setEncoderSetting = React.useCallback((encoderSetting: EncoderSetting) => setState((s) => ({ ...s, encoderSetting })), [])
  const setReconnectPolicy = React.useCallback((reconnectPolicy: ReconnectPolicy) => setState((s) => ({ ...s, reconnectPolicy })), [])

  const moveVideo = React.useCallback((index: number, direction: "up" | "down") => {
    setState((s) => {
      const next = [...s.videos]
      if (direction === "up" && index > 0) {
        const temp = next[index]
        next[index] = next[index - 1]
        next[index - 1] = temp
      } else if (direction === "down" && index < next.length - 1) {
        const temp = next[index]
        next[index] = next[index + 1]
        next[index + 1] = temp
      }
      return { ...s, videos: next }
    })
  }, [])

  const removeVideo = React.useCallback((id: string) => {
    setState((s) => ({
      ...s,
      videos: s.videos.filter((v) => v.id !== id),
    }))
  }, [])

  const duplicateVideo = React.useCallback((id: string) => {
    setState((s) => {
      const idx = s.videos.findIndex((v) => v.id === id)
      if (idx === -1) return s
      const source = s.videos[idx]
      const newClip: VideoClip = {
        ...source,
        id: `clip_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        filename: source.filename.replace(/\.mp4$/, "_copy.mp4"),
      }
      const next = [...s.videos]
      next.splice(idx + 1, 0, newClip)
      return { ...s, videos: next }
    })
  }, [])

  const addVideoFile = React.useCallback((filename: string) => {
    setState((s) => {
      const newClip: VideoClip = {
        id: `clip_${Date.now()}`,
        filename,
        durationSec: Math.floor(Math.random() * 3600) + 1200,
        resolution: "1920x1080",
        codec: "h264/aac",
        fps: 60,
        size: `${(Math.random() * 150 + 80).toFixed(1)} MB`,
        status: "READY",
        color: ["#FF5A1F", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"][Math.floor(Math.random() * 5)],
      }
      return { ...s, videos: [...s.videos, newClip] }
    })
  }, [])

  const resetWizard = React.useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY)
    }
    setState(INITIAL_STATE)
  }, [])

  const value = React.useMemo<OnboardingWizardContextType>(
    () => ({
      state,
      setStep,
      setPlatform,
      setRtmpUrl,
      setStreamKey,
      setShowStreamKey,
      setConnectionStatus,
      setPingLatency,
      setPlaylistName,
      setPlaylistDesc,
      setThumbnailUrl,
      setRepeatForever,
      setShuffle,
      setAutoSkipCorrupt,
      setContinueOnError,
      setVideos,
      setIsValidating,
      setValidationDone,
      setResolutionSetting,
      setFpsSetting,
      setBitrateSetting,
      setAudioSetting,
      setEncoderSetting,
      setReconnectPolicy,
      moveVideo,
      removeVideo,
      duplicateVideo,
      addVideoFile,
      resetWizard,
    }),
    [
      state,
      setStep,
      setPlatform,
      setRtmpUrl,
      setStreamKey,
      setShowStreamKey,
      setConnectionStatus,
      setPingLatency,
      setPlaylistName,
      setPlaylistDesc,
      setThumbnailUrl,
      setRepeatForever,
      setShuffle,
      setAutoSkipCorrupt,
      setContinueOnError,
      setVideos,
      setIsValidating,
      setValidationDone,
      setResolutionSetting,
      setFpsSetting,
      setBitrateSetting,
      setAudioSetting,
      setEncoderSetting,
      setReconnectPolicy,
      moveVideo,
      removeVideo,
      duplicateVideo,
      addVideoFile,
      resetWizard,
    ]
  )

  return <OnboardingWizardContext.Provider value={value}>{children}</OnboardingWizardContext.Provider>
}

export function useOnboardingWizard(): OnboardingWizardContextType {
  const context = React.useContext(OnboardingWizardContext)
  if (!context) {
    throw new Error("useOnboardingWizard must be used within an OnboardingProvider")
  }
  return context
}
