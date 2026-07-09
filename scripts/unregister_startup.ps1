# ==============================================================================
# MIRZA LIVE SERVER v1 - WINDOWS AUTOMATIC STARTUP UNREGISTRATION
# ==============================================================================
# Removes the 'MirzaLiveServer_24_7' Windows Scheduled Task cleanly.
# ==============================================================================

param(
    [string]$TaskName = "MirzaLiveServer_24_7"
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " MIRZA LIVE SERVER - STARTUP UNREGISTRATION" -ForegroundColor Cyan
Write-Host "========================================================"

$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

if ($ExistingTask) {
    try {
        Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue | Out-Null
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -Force | Out-Null
        Write-Host " [SUCCESS] Scheduled Task '$TaskName' has been removed cleanly." -ForegroundColor Green
    } catch {
        Write-Error "Failed to remove task '$TaskName'. Ensure you run PowerShell as Administrator: $_"
        exit 1
    }
} else {
    Write-Host " [INFO] Scheduled Task '$TaskName' is not currently registered. Nothing to do." -ForegroundColor Yellow
}

Write-Host "========================================================" -ForegroundColor Cyan
