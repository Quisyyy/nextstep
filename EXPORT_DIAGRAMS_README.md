# 📊 Export Diagrams to PNG

This guide explains how to export the Data Flow Diagram and Program Flowchart to PNG files.

## 🚀 Quick Start (Windows)

### Method 1: Batch File (Easiest)
Simply double-click the batch file:
```
export_diagrams.bat
```

This will:
1. Install required dependencies
2. Export both diagrams to PNG files

**Generated files:**
- `DATA_FLOW_DIAGRAM.png`
- `PROGRAM_FLOWCHART.png`

---

## 💻 Manual Installation (Any OS)

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Step 1: Install Dependencies

#### Option A: Playwright (Recommended)
Best quality, fastest export
```bash
pip install playwright
playwright install chromium
```

#### Option B: Selenium (Fallback)
Alternative method
```bash
pip install selenium webdriver-manager
```

### Step 2: Run Export Script

```bash
python export_diagram.py
```

The script will automatically use the best available method.

---

## 🎯 Usage

### From Windows Command Line
```batch
cd "g:\Next Step"
python export_diagram.py
```

### From PowerShell
```powershell
cd "g:\Next Step"
python export_diagram.py
```

### From macOS/Linux Terminal
```bash
cd path/to/Next\ Step
python3 export_diagram.py
```

---

## ✅ Expected Output

```
============================================================
NEXT STEP - Diagram Exporter to PNG
============================================================

🔄 Attempting to use Playwright...
────────────────────────────────────────────────────────────

📄 Converting DATA_FLOW_DIAGRAM.html...
✓ Saved: DATA_FLOW_DIAGRAM.png (2450.5 KB)

📄 Converting PROGRAM_FLOWCHART.html...
✓ Saved: PROGRAM_FLOWCHART.png (1850.3 KB)

============================================================
✓ All diagrams exported successfully!
============================================================

Generated files:
  • DATA_FLOW_DIAGRAM.png
  • PROGRAM_FLOWCHART.png
```

---

## 🔧 Troubleshooting

### Issue: Python not found
**Solution:** Install Python from https://www.python.org and ensure "Add Python to PATH" is checked during installation.

### Issue: ModuleNotFoundError
**Solution:** Reinstall dependencies:
```bash
pip install --upgrade playwright
playwright install chromium
```

### Issue: Permission denied (macOS/Linux)
**Solution:** Run with sudo or change permissions:
```bash
sudo python3 export_diagram.py
# OR
chmod +x export_diagram.py
./export_diagram.py
```

### Issue: Browser not found
**Solution:** Install the browser:
```bash
playwright install chromium
```

---

## 📝 Script Details

The `export_diagram.py` script:
- ✓ Tries Playwright first (best quality)
- ✓ Falls back to Selenium if needed
- ✓ Creates full-page screenshots
- ✓ Handles responsive sizing
- ✓ Saves high-resolution PNGs (2x scale)
- ✓ Works on Windows, macOS, and Linux

---

## 🌐 Browser Export (Alternative)

You can also export from the web browser:

1. Open `DATA_FLOW_DIAGRAM.html` in a web browser
2. Click the "📥 Export as PNG (Browser)" button
3. Repeat for `PROGRAM_FLOWCHART.html`

**Note:** Browser export may have mixed results depending on your browser.

---

## 📞 Support

If export still doesn't work:
1. Check Python installation: `python --version`
2. Verify pip: `pip --version`
3. Reinstall dependencies: `pip install --force-reinstall playwright`
4. Try the batch file: `export_diagrams.bat`

---

## 📋 Files in This Directory

- `DATA_FLOW_DIAGRAM.html` - Interactive data flow diagram
- `PROGRAM_FLOWCHART.html` - Interactive program flowchart  
- `export_diagram.py` - Python export script (main tool)
- `export_diagrams.bat` - Windows batch file (easy launcher)
- `EXPORT_DIAGRAMS_README.md` - This file
