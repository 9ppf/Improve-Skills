@echo off
cd /d e:\self-improvement\Improve-Skills

echo ============================
echo   Study Workbench Launcher
echo ============================
echo.

echo [1/2] Checking dependencies...
python -c "import watchdog" 2>nul
if errorlevel 1 (
    echo   Installing watchdog...
    pip install watchdog
) else (
    echo   Dependencies OK
)
echo.
echo [2/2] Starting server...
echo URL: http://localhost:8000/Workbench/此刻便是春天.html
echo Do NOT close this window!
echo.

python dev_server.py --no-build

echo.
echo Server stopped. Press any key to exit...
pause >nul
