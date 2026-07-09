<#
.SYNOPSIS
    Automated Windows FFmpeg Binary Downloader and Installer.
.DESCRIPTION
    Downloads the official static essentials build of FFmpeg from gyan.dev,
    extracts the executable binaries (`ffmpeg.exe`, `ffprobe.exe`) into the
    project's `bin/` directory, and verifies installation success.
#>

$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
$BinDir = "$ProjectRoot\bin"
$TempZip = "$env:TEMP\ffmpeg-release-essentials.zip"
$ExtractDir = "$env:TEMP\ffmpeg-extract"
$DownloadUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " MIRZA LIVE SERVER — WINDOWS FFMPEG INSTALLER" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Check if already installed locally
if (Test-Path "$BinDir\ffmpeg.exe") {
    Write-Host "[SUCCESS] FFmpeg binary is already installed at: $BinDir\ffmpeg.exe" -ForegroundColor Green
    & "$BinDir\ffmpeg.exe" -version | Select-Object -First 1
    exit 0
}

# Create bin directory if needed
if (-not (Test-Path $BinDir)) {
    New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
}

Write-Host "[1/3] Downloading latest static FFmpeg build from gyan.dev..." -ForegroundColor Yellow
Write-Host "      URL: $DownloadUrl" -ForegroundColor DarkGray

try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $TempZip -UseBasicParsing
} catch {
    Write-Host "[ERROR] Failed to download FFmpeg zip package: $_" -ForegroundColor Red
    exit 1
}

Write-Host "[2/3] Extracting archive..." -ForegroundColor Yellow
if (Test-Path $ExtractDir) {
    Remove-Item -Path $ExtractDir -Recurse -Force
}
Expand-Archive -Path $TempZip -DestinationPath $ExtractDir -Force

Write-Host "[3/3] Locating and copying binaries to local bin/ directory..." -ForegroundColor Yellow
$FFmpegBin = Get-ChildItem -Path $ExtractDir -Filter "ffmpeg.exe" -Recurse | Select-Object -First 1
$FFprobeBin = Get-ChildItem -Path $ExtractDir -Filter "ffprobe.exe" -Recurse | Select-Object -First 1

if ($null -ne $FFmpegBin) {
    Copy-Item -Path $FFmpegBin.FullName -Destination "$BinDir\ffmpeg.exe" -Force
    if ($null -ne $FFprobeBin) {
        Copy-Item -Path $FFprobeBin.FullName -Destination "$BinDir\ffprobe.exe" -Force
    }
    Write-Host "`n[SUCCESS] FFmpeg binaries installed successfully to project bin folder!" -ForegroundColor Green
    Write-Host "          Executable Path: $BinDir\ffmpeg.exe" -ForegroundColor Cyan
    
    # Cleanup temporary files
    Remove-Item -Path $TempZip -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $ExtractDir -Recurse -Force -ErrorAction SilentlyContinue
    
    # Verify execution
    & "$BinDir\ffmpeg.exe" -version | Select-Object -First 1
} else {
    Write-Host "[ERROR] Could not find ffmpeg.exe inside extracted archive!" -ForegroundColor Red
    exit 1
}
