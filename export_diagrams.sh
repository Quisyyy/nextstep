#!/bin/bash
# Export diagrams to PNG using Python script

echo "======================================================"
echo "NEXT STEP - Diagram Exporter"
echo "======================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "Error: Python is not installed"
    echo "Install with: brew install python3 (macOS) or apt-get install python3 (Linux)"
    exit 1
fi

# Determine Python command
if command -v python3 &> /dev/null; then
    PYTHON="python3"
else
    PYTHON="python"
fi

echo "Using: $PYTHON"
$PYTHON --version

echo ""
echo "Installing required packages..."
$PYTHON -m pip install --upgrade pip > /dev/null 2>&1
$PYTHON -m pip install playwright > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "Installing Playwright browser..."
    $PYTHON -m playwright install chromium > /dev/null 2>&1
fi

echo ""
echo "Running export script..."
$PYTHON export_diagram.py

exit $?
