@echo off
setlocal
TITLE Mirza Live Server v1 — 24/7 YouTube Livestreaming Engine

echo ========================================================
echo  MIRZA LIVE SERVER v1 — WINDOWS LAUNCHER
echo ========================================================

:: Check if virtual environment exists and activate it
if exist "%~dp0..\.venv\Scripts\activate.bat" (
    echo [INFO] Activating Python virtual environment...
    call "%~dp0..\.venv\Scripts\activate.bat"
) else (
    echo [INFO] Using system Python environment...
)

:: Navigate to project root directory
cd /d "%~dp0.."

:: Run pre-flight validation check
echo [INFO] Running pre-flight configuration check...
python main.py validate
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Pre-flight validation failed! Please check your config.yaml or .env file.
    echo Press any key to exit...
    pause >nul
    exit /b %errorlevel%
)

echo.
echo [SUCCESS] Configuration verified. Starting 24/7 Livestreaming Engine...
echo Press CTRL+C at any time to gracefully stop all channels.
echo ========================================================
echo.

python main.py start

echo.
echo Server shut down cleanly.
pause
