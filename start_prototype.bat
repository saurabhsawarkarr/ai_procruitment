@echo off
echo ====================================================================
echo  STARTING AERCHAIN "KILL THE QUOTE SPREADSHEET" PROTOTYPE
echo ====================================================================
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Aerchain Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Vite React Frontend on http://localhost:5173 ...
start "Aerchain Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo Both services launched! 
echo Open your browser to: http://localhost:5173
echo Backend API Docs at: http://127.0.0.1:8000/docs
echo ====================================================================
