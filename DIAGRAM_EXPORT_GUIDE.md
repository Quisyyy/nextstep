# 📊 Diagram Export Guide

This document explains how to export the Data Flow Diagram and Program Flowchart as PNG files.

## 🌐 Option 1: Browser Export (Easiest)

1. Open either diagram in your browser:
   - `DATA_FLOW_DIAGRAM.html`
   - `PROGRAM_FLOWCHART.html`

2. Look for the **"📥 Export as PNG (Browser)"** button at the bottom

3. Click it to download the diagram as a PNG file

**Note:** If the button doesn't work, try Option 2 or 3 below.

---

## 🐍 Option 2: Python with Playwright (Recommended)

### Install Playwright:
```bash
pip install playwright
playwright install chromium
```

### Run the export script:
```bash
python export_with_playwright.py
```

This will generate:
- `DATA_FLOW_DIAGRAM.png`
- `PROGRAM_FLOWCHART.png`

---

## 🐍 Option 3: Python with Selenium

### Install dependencies:
```bash
pip install selenium pillow
```

### Download ChromeDriver:
Download ChromeDriver matching your Chrome version from: https://chromedriver.chromium.org/

### Run the export script:
```bash
python export_diagram.py
```

---

## 🔷 Option 4: Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File export_diagram.ps1
```

**Requirements:**
- Microsoft Edge or Google Chrome must be installed
- Windows 10 or later

---

## 🌐 Option 5: Online Converter

If all else fails, you can use an online HTML-to-PNG converter:

1. Copy the full HTML content
2. Go to: https://html2pdf.com or similar service
3. Paste HTML and export as PNG

---

## 📱 Alternative: Print to PDF

All diagrams can also be printed to PDF:

1. Open the HTML file in browser
2. Press `Ctrl+P` (or `Cmd+P` on Mac)
3. Select "Save as PDF"
4. Choose location and filename

---

## ✅ Files Generated

After successful export, you should see:

```
DATA_FLOW_DIAGRAM.png     (Context diagram + detailed data flows)
PROGRAM_FLOWCHART.png     (Login, signup, password reset flows)
```

Both diagrams are at **2x scale** (high resolution) for better clarity.

---

## 🐛 Troubleshooting

**Issue: Browser export button doesn't work**
- Solution: Use Python method (Option 2 or 3) instead

**Issue: Python not installed**
- Download from: https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

**Issue: Module not found**
- Run: `pip install --upgrade pip`
- Then reinstall the required package

**Issue: Browser not found**
- Install Google Chrome from: https://www.google.com/chrome/
- Or Microsoft Edge from: https://www.microsoft.com/edge

---

## 📝 Diagram Descriptions

### Data Flow Diagram (DFD)
Shows how data flows between:
- Users (Students/Alumni)
- The NEXT STEP System
- Supabase Database
- Email Service (Nodemailer)

Includes:
- Level 0: Context Diagram
- Level 1: Detailed Data Flows

### Program Flowchart
Shows step-by-step processes for:
- User Authentication (Login)
- User Registration (Sign Up)
- Password Reset Flow
- Profile Management

---

For questions or issues, refer to the documentation in the project README.
