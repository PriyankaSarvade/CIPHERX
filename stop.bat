@echo off
title CIPERX — Stop All Services
color 0C
cd /d "%~dp0"

echo ====================================================================
echo      CIPERX -- AI-Powered Criminal Network Analysis System
echo                      Stop All Services
echo ====================================================================
echo.
echo Stopping running CIPERX services on ports 8000 and 5173...
echo.

powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000, 5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host \"  [STOPPED] Terminated service on port $($_.LocalPort) [PID: $($_.OwningProcess)]\" }"

echo.
echo All CIPERX services have been safely stopped.
ping 127.0.0.1 -n 4 >nul
