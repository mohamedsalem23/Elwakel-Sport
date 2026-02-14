@echo off
REM ELWAKEL-SPORT Server Startup Script for Windows
REM يقوم بتشغيل Backend و Frontend معاً

echo.
echo ==================================
echo         ELWAKEL-SPORT Setup
echo ==================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed.
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed.
    echo Please install Node.js 14+ from nodejs.org
    pause
    exit /b 1
)

echo ✅ Python and Node.js are installed
echo.

REM Start Backend
echo Starting Backend (FastAPI)...
cd backend

REM Check if venv exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate venv (Windows)
call venv\Scripts\activate.bat

REM Install requirements
echo Installing/Updating dependencies...
pip install -q -r requirements.txt

REM Start the backend server in a new window
echo Starting uvicorn server...
start "ELWAKEL-SPORT Backend" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo ✅ Backend started
echo    Backend will run at: http://localhost:8000
timeout /t 2 /nobreak

REM Start Frontend
cd ..\frontend

echo.
echo Starting Frontend (Next.js)...

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Start the frontend in a new window
echo Starting Next.js development server...
start "ELWAKEL-SPORT Frontend" cmd /k "npm run dev"
echo ✅ Frontend started

echo.
echo ==================================
timeout /t 2 /nobreak
cls
echo ==================================
echo        ELWAKEL-SPORT Running
echo ==================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo.
echo Both servers are running in separate windows.
echo Close the windows to stop them.
echo ==================================
echo.
pause
