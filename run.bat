@echo off
setlocal EnableDelayedExpansion

:: ====================================================================
:: CIPERX — AI-Powered Criminal Network Analysis System
:: Master One-Click Windows Launcher (run.bat)
:: ====================================================================

title CIPERX — Application Launcher
color 0B

:: Ensure we run from the project root directory regardless of how launched
cd /d "%~dp0"

:main_launch
cls
echo.
echo ====================================================================
echo      CIPERX -- AI-Powered Criminal Network Analysis System
echo                 Master One-Click Application Launcher
echo ====================================================================
echo   Project Directory: %~dp0
echo ====================================================================
echo.

:: --------------------------------------------------------------------
:: STEP 1: Verify System Prerequisites (Python, Node.js, npm)
:: --------------------------------------------------------------------
echo [1/5] Checking required software prerequisites...

where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo ====================================================================
    echo [ERROR] Python was not found in your system PATH!
    echo Please install Python 3.10 or higher from:
    echo   https://www.python.org/downloads/
    echo IMPORTANT: Ensure "Add python.exe to PATH" is checked during setup.
    echo ====================================================================
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo   - Found %%v

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo ====================================================================
    echo [ERROR] Node.js was not found in your system PATH!
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended versions: v18 LTS or v20 LTS or higher.
    echo ====================================================================
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>^&1') do echo   - Found Node.js %%v

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo ====================================================================
    echo [ERROR] npm was not found in your system PATH!
    echo Please reinstall Node.js with npm included.
    echo ====================================================================
    echo.
    pause
    exit /b 1
)
echo   - Found npm package manager

:: --------------------------------------------------------------------
:: STEP 2: Python Virtual Environment Activation (If Available)
:: --------------------------------------------------------------------
echo.
echo [2/5] Checking Python environment...

if exist "venv\Scripts\activate.bat" (
    echo   - Activating virtual environment: venv
    call "venv\Scripts\activate.bat"
) else if exist ".venv\Scripts\activate.bat" (
    echo   - Activating virtual environment: .venv
    call ".venv\Scripts\activate.bat"
) else if exist "backend\venv\Scripts\activate.bat" (
    echo   - Activating virtual environment: backend\venv
    call "backend\venv\Scripts\activate.bat"
) else if exist "backend\.venv\Scripts\activate.bat" (
    echo   - Activating virtual environment: backend\.venv
    call "backend\.venv\Scripts\activate.bat"
) else (
    echo   - Using system Python installation.
)

:: --------------------------------------------------------------------
:: STEP 3: Verify & Install Dependencies If Missing
:: --------------------------------------------------------------------
echo.
echo [3/5] Verifying dependencies...

:: Check Python packages
python -c "import fastapi, uvicorn, networkx, pydantic" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   [!] Required Python packages are missing.
    echo   [*] Installing backend dependencies from backend\requirements.txt...
    python -m pip install -r backend\requirements.txt
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install Python dependencies. Please check your internet connection.
        pause
        exit /b 1
    )
    echo   [OK] Python dependencies installed successfully.
) else (
    echo   [OK] Python dependencies verified: fastapi, uvicorn, networkx, pydantic.
)

:: Check Node.js packages
if not exist "node_modules\" (
    echo   [!] node_modules folder not found.
    echo   [*] Installing frontend packages via npm...
    call npm.cmd install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install npm dependencies.
        pause
        exit /b 1
    )
    echo   [OK] Frontend packages installed successfully.
) else (
    echo   [OK] Frontend dependencies verified: node_modules present.
)

:: --------------------------------------------------------------------
:: STEP 4: Start Graph Analysis Backend (FastAPI on Port 8000)
:: --------------------------------------------------------------------
echo.
echo [4/5] Launching Graph Analysis Backend Engine...

set BACKEND_WAS_RUNNING=0
netstat -ano | findstr /R ":8000.*LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo   [OK] Graph Analysis Backend is ALREADY running on port 8000.
    set BACKEND_WAS_RUNNING=1
) else (
    echo   [*] Launching FastAPI Backend on http://127.0.0.1:8000 in separate window...
    start "CIPERX - Graph Analysis Backend (FastAPI)" cmd /k "title CIPERX Backend Engine && cd /d "%~dp0" && echo ==================================================================== && echo   CIPERX Graph Analysis Engine (FastAPI / Uvicorn) && echo   Base URL: http://127.0.0.1:8000 && echo   Swagger:  http://127.0.0.1:8000/docs && echo ==================================================================== && python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"
)

:: Wait for Backend Health Endpoint
echo   [*] Waiting for backend health verification...
set /a WAIT_B_COUNT=0
:wait_backend_loop
curl.exe -f -s http://127.0.0.1:8000/api/graph/health >nul 2>&1
if %ERRORLEVEL% equ 0 goto backend_is_up
set /a WAIT_B_COUNT+=1
if !WAIT_B_COUNT! geq 25 (
    echo.
    echo   [WARNING] Backend health check timed out after 15 seconds.
    echo   Please inspect the "CIPERX - Graph Analysis Backend" window for any startup error.
    goto backend_proceed
)
ping 127.0.0.1 -n 2 >nul
goto wait_backend_loop

:backend_is_up
echo   [OK] Backend engine is healthy and operational on port 8000.

:backend_proceed

:: --------------------------------------------------------------------
:: STEP 5: Start Complete Frontend UI (Vite on Port 5173)
:: --------------------------------------------------------------------
echo.
echo [5/5] Launching Frontend Interface...

set FRONTEND_WAS_RUNNING=0
netstat -ano | findstr /R ":5173.*LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo   [OK] Frontend development server is ALREADY running on port 5173.
    set FRONTEND_WAS_RUNNING=1
) else (
    echo   [*] Launching Vite Frontend on http://localhost:5173 in separate window...
    start "CIPERX - Frontend UI (Vite)" cmd /k "title CIPERX Frontend Server && cd /d "%~dp0" && echo ==================================================================== && echo   CIPERX Frontend Server (Vite / React) && echo   Main Application: http://localhost:5173 && echo ==================================================================== && call npm.cmd run dev"
)

:: Wait for Frontend HTTP Response
echo   [*] Waiting for frontend server to become accessible...
set /a WAIT_F_COUNT=0
:wait_frontend_loop
curl.exe -f -s http://localhost:5173 >nul 2>&1
if %ERRORLEVEL% equ 0 goto frontend_is_up
set /a WAIT_F_COUNT+=1
if !WAIT_F_COUNT! geq 20 (
    echo   [WARNING] Frontend server wait timed out; opening browser anyway...
    goto frontend_proceed
)
ping 127.0.0.1 -n 2 >nul
goto wait_frontend_loop

:frontend_is_up
echo   [OK] Frontend server is ready on port 5173.

:frontend_proceed

:: --------------------------------------------------------------------
:: STEP 6: Open Default Web Browser & Present Hub
:: --------------------------------------------------------------------
echo.
echo [*] Opening CIPERX in your default web browser...
start http://localhost:5173

:dashboard_menu
cls
echo.
echo ====================================================================
echo      CIPERX -- AI-Powered Criminal Network Analysis System
echo                       APPLICATION ACTIVE
echo ====================================================================
echo.
echo   [FRONTEND USER INTERFACE]
echo     Main Dashboard:         http://localhost:5173
echo     Network Explorer:       http://localhost:5173/network
echo     Evidence Management:    http://localhost:5173/evidence
echo     Case Management:        http://localhost:5173/cases
echo.
echo   [GRAPH ANALYSIS BACKEND]
echo     Backend Base URL:       http://127.0.0.1:8000
echo     Swagger Interactive UI: http://127.0.0.1:8000/docs
echo     ReDoc Documentation:    http://127.0.0.1:8000/redoc
echo     Health Check:           http://127.0.0.1:8000/api/graph/health
echo.
echo ====================================================================
echo   CONTROLS:
echo     [O] Open application in browser again
echo     [D] Open Swagger API Documentation
echo     [R] Restart all services (Backend + Frontend)
echo     [S] Stop all services and exit
echo     [Q] Close this launcher window (keeps servers running)
echo ====================================================================
echo.

choice /c ODRSQ /n /m "Enter your choice [O, D, R, S, Q]: "
if errorlevel 5 goto do_quit
if errorlevel 4 goto do_stop
if errorlevel 3 goto do_restart
if errorlevel 2 goto do_open_docs
if errorlevel 1 goto do_open_browser
goto dashboard_menu

:do_open_browser
start http://localhost:5173
goto dashboard_menu

:do_open_docs
start http://127.0.0.1:8000/docs
goto dashboard_menu

:do_restart
echo.
echo [*] Stopping running services before restart...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000, 5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
ping 127.0.0.1 -n 3 >nul
goto main_launch

:do_stop
echo.
echo [*] Gracefully stopping CIPERX backend and frontend services...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000, 5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host \"  [STOPPED] Terminated process on port $($_.LocalPort) (PID: $($_.OwningProcess))\" }"
echo.
echo [OK] All CIPERX services have been stopped.
ping 127.0.0.1 -n 4 >nul
exit /b 0

:do_quit
echo.
echo Exiting launcher. Services continue running in their respective windows.
ping 127.0.0.1 -n 3 >nul
exit /b 0
