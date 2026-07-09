"""Hardware resource and stream health monitoring subsystem.

Tracks host CPU and memory consumption via `psutil` and asynchronously parses
real-time FFmpeg standard error (`stderr`) outputs to detect frame drops,
encoding slowdowns, and stream freeze events.
"""
