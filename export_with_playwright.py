#!/usr/bin/env python3
"""
Simple HTML to PNG converter using Playwright (lighter than Selenium)
Install: pip install playwright
Run: python export_with_playwright.py
"""

import asyncio
import sys
from pathlib import Path

async def export_diagrams():
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("❌ Playwright not installed. Run: pip install playwright")
        print("   Then run: playwright install")
        sys.exit(1)
    
    diagrams = [
        "DATA_FLOW_DIAGRAM.html",
        "PROGRAM_FLOWCHART.html"
    ]
    
    script_dir = Path(__file__).parent
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        for diagram_file in diagrams:
            file_path = script_dir / diagram_file
            
            if not file_path.exists():
                print(f"⚠️  File not found: {diagram_file}")
                continue
            
            print(f"📊 Converting {diagram_file} to PNG...")
            
            try:
                page = await browser.new_page()
                file_url = file_path.as_uri()
                await page.goto(file_url, wait_until="networkidle")
                
                # Wait for SVGs to render
                await page.wait_for_timeout(1000)
                
                output_file = script_dir / diagram_file.replace(".html", ".png")
                await page.screenshot(path=str(output_file), full_page=True)
                
                print(f"✅ Saved: {output_file}")
                await page.close()
                
            except Exception as e:
                print(f"❌ Error: {str(e)}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(export_diagrams())
