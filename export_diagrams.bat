@echo off
REM Export diagrams to PNG using Python script
echo ======================================================
echo NEXT STEP - Diagram Exporter
echo ======================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org
    pause
    exit /b 1
)

echo Checking Python version...
python --version

echo.
echo Installing required packages...
echo (This may take a minute on first run)
python -m pip install --upgrade pip >nul 2>&1
python -m pip install playwright >nul 2>&1

if errorlevel 0 (
    echo Installing Playwright browser...
    python -m playwright install chromium >nul 2>&1
)

echo.
echo Running export script...
python export_diagram.py

pause
