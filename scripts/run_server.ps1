<#
.SYNOPSIS
    PowerShell production launcher and diagnostic check for Mirza Live Server.
.DESCRIPTION
    Activates the virtual environment if present, performs dependency verification,
    checks system CPU/RAM limits, and starts the asynchronous streaming engine.
#>

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "Mirza Live Server v1 — 24/7 YouTube Livestreaming Engine"

$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
Set-Location $ProjectRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " MIRZA LIVE SERVER v1 — POWERSHELL LAUNCHER" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Check for .venv
$VenvPath = "$ProjectRoot\.venv\Scripts\Activate.ps1"
if (Test-Path $VenvPath) {
    Write-Host "[INFO] Activating virtual environment..." -ForegroundColor Green
    & $VenvPath
} else {
    Write-Host "[INFO] No local .venv detected. Using global Python environment." -ForegroundColor Yellow
}

# Run dependency verification
Write-Host "[INFO] Running dependency verification..." -ForegroundColor Cyan
python main.py verify
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] System dependency verification failed!" -ForegroundColor Red
    Write-Host "Please ensure Python dependencies (pip install -r requirements.txt) and FFmpeg are installed." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit $LASTEXITCODE
}

# Print system status snapshot
python main.py status

Write-Host "Starting 24/7 Livestreaming Engine... Press CTRL+C to stop.`n" -ForegroundColor Green
try {
    python main.py start
} finally {
    Write-Host "`nServer terminated cleanly." -ForegroundColor Cyan
}
