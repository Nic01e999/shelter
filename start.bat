@echo off
cd /d "%~dp0"

echo Starting SHELTER services...
echo.

start "Backend Server" python server.py
start "Frontend Server" python -m http.server 9998

echo Backend: http://localhost:9999
echo Frontend: http://localhost:9998
echo.
echo Press any key to stop servers...
pause >nul

taskkill /FI "WINDOWTITLE eq Backend Server*" /T /F
taskkill /FI "WINDOWTITLE eq Frontend Server*" /T /F
