@echo off
echo Starting Volt Guard AI local server...
echo.
echo Open your browser and go to: http://localhost:8000
echo Press Ctrl+C to stop the server.
echo.
cd /d "%~dp0"
python -m http.server 8000
