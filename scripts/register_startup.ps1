# ==============================================================================
# MIRZA LIVE SERVER v1 - WINDOWS AUTOMATIC STARTUP REGISTRATION
# ==============================================================================
# Registers a Windows Scheduled Task ('MirzaLiveServer_24_7') to automatically
# start the livestream server in the background whenever the user logs in or
# Windows starts up.
# ==============================================================================

param(
    [string]$TaskName = "MirzaLiveServer_24_7",
    [string]$PythonPath = "python",
    [switch]$RunAtSystemStartup
)

# Determine exact absolute path to the project root directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$MainScript = Join-Path $ProjectRoot "main.py"

if (-not (Test-Path $MainScript)) {
    Write-Error "Could not locate main.py at '$MainScript'. Please run this script from inside the project."
    exit 1
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " MIRZA LIVE SERVER - STARTUP REGISTRATION" -ForegroundColor Cyan
Write-Host "========================================================"
Write-Host " Project Root : $ProjectRoot"
Write-Host " Python Exec  : $PythonPath"
Write-Host " Task Name    : $TaskName"
Write-Host "--------------------------------------------------------"

# Remove existing scheduled task if present
Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue | Unregister-ScheduledTask -Confirm:$false -ErrorAction SilentlyContinue

# Configure Scheduled Task Trigger
if ($RunAtSystemStartup) {
    Write-Host " Configuring task trigger: At System Startup (Boot)..."
    $Trigger = New-ScheduledTaskTrigger -AtStartup
} else {
    Write-Host " Configuring task trigger: At User Logon..."
    $Trigger = New-ScheduledTaskTrigger -AtLogOn
}

# Configure Scheduled Task Action (Runs 'python main.py start' from project root)
$ActionArgs = "$MainScript start"
$Action = New-ScheduledTaskAction -Execute $PythonPath -Argument $ActionArgs -WorkingDirectory $ProjectRoot

# Configure Task Settings (Do not stop if running on battery, allow demand start, auto-restart)
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit 0 -StartWhenAvailable -RestartInterval (New-TimeSpan -Minutes 1) -RestartCount 3

# Register the Scheduled Task
try {
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Mirza Live Server v1 - 24/7 YouTube Livestream Engine" -Force | Out-Null
    Write-Host " [SUCCESS] Scheduled Task '$TaskName' registered successfully!" -ForegroundColor Green
    Write-Host " -> The server will start automatically on next Windows logon."
    Write-Host " -> To start immediately via Task Scheduler, run: Start-ScheduledTask -TaskName '$TaskName'"
    Write-Host " -> To unregister later, run: scripts\unregister_startup.ps1"
} catch {
    Write-Error "Failed to register scheduled task. Ensure you are running PowerShell as Administrator: $_"
    exit 1
}

Write-Host "========================================================" -ForegroundColor Cyan
