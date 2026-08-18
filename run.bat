@echo off
title GUARDIAN - Autonomous Cyber Defense Commander
echo.
echo  ======================================================
echo   GUARDIAN - Autonomous Cyber Defense Commander
echo  ======================================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.9+
    pause
    exit /b 1
)

REM Install python dependencies if needed
echo [*] Checking Python backend dependencies...
pip install -r "%~dp0requirements.txt" -q 2>nul

REM Start FastAPI backend
echo [*] Starting GUARDIAN API on http://localhost:8000 ...
start "GUARDIAN-API" cmd /k "cd /d %~dp0 && python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait for API to start
echo [*] Waiting for API to initialize...
timeout /t 4 /nobreak >nul

REM Start React frontend
echo [*] Starting GUARDIAN React Frontend on http://localhost:3000 ...
start "GUARDIAN-REACT-UI" cmd /k "cd /d %~dp0frontend-react && npm run dev -- --port 3000"

echo.
echo  ======================================================
echo   GUARDIAN is starting...
echo  ======================================================
echo.
echo   API Backend:      http://localhost:8000
echo   API Docs:         http://localhost:8000/docs
echo   React Dashboard:  http://localhost:3000
echo.
echo   Close this window or press Ctrl+C to stop.
echo  ======================================================
echo.
pause
