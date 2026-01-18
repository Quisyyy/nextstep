#!/usr/bin/env python3
"""
Export HTML diagrams to PNG files
Requires: pip install selenium pillow
"""

import os
import sys
import time
from pathlib import Path

def export_html_to_png():
    """Export HTML diagrams to PNG using Selenium and PIL"""
    
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        from PIL import Image
        import io
    except ImportError:
        print("❌ Missing dependencies. Install with:")
        print("   pip install selenium pillow")
        sys.exit(1)
    
    diagrams = [
        "DATA_FLOW_DIAGRAM.html",
        "PROGRAM_FLOWCHART.html"
    ]
    
    script_dir = Path(__file__).parent
    
    for diagram_file in diagrams:
        file_path = script_dir / diagram_file
        
        if not file_path.exists():
            print(f"⚠️  File not found: {diagram_file}")
            continue
        
        print(f"\n📊 Converting {diagram_file} to PNG...")
        
        try:
            # Setup Chrome options
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--window-size=1400,1200")
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            
            # Create driver
            driver = webdriver.Chrome(options=chrome_options)
            
            # Load the HTML file
            file_url = file_path.as_uri()
            driver.get(file_url)
            
            # Wait for content to render
            time.sleep(2)
            
            # Get container element and take screenshot
            container = driver.find_element("class name", "container")
            screenshot = container.screenshot_as_png
            
            # Save as PNG
            output_file = script_dir / diagram_file.replace(".html", ".png")
            with open(output_file, 'wb') as f:
                f.write(screenshot)
            
            print(f"✅ Saved: {output_file}")
            driver.quit()
            
        except Exception as e:
            print(f"❌ Error processing {diagram_file}: {str(e)}")
            try:
                driver.quit()
            except:
                pass
    
    print("\n✅ Export complete!")

if __name__ == "__main__":
    export_html_to_png()
