"""Playlist management and automatic media folder detection subsystem.

Scans designated media directories for supported video files, detects newly
dropped videos dynamically, manages playback ordering (shuffle/sequential/loop),
and generates Windows-safe FFmpeg concat demuxer files (`concat.txt`).
"""
