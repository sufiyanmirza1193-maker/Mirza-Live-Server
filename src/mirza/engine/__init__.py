"""Core livestreaming engine and process supervision subsystem.

Constructs YouTube-mandated FFmpeg commands (`ffmpeg_cmd`), manages asynchronous
child process lifecycle and exponential backoff recovery (`supervisor`), and
coordinates multi-channel concurrency via an in-memory state registry (`orchestrator`).
"""
