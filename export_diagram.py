#!/usr/bin/env python3
"""
Export HTML diagrams to PNG files
Requires: pip install playwright
Then run: playwright install chromium
"""

import os
import sys
from pathlib import Path

def export_with_playwright():
    """Export using Playwright (Best method)"""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("✗ Playwright not found")
        print("\nInstall with:")
        print("  pip install playwright")
        print("  playwright install chromium")
        return False
    
    files_to_export = [
        ('DATA_FLOW_DIAGRAM.html', 'DATA_FLOW_DIAGRAM.png'),
        ('PROGRAM_FLOWCHART.html', 'PROGRAM_FLOWCHART.png')
    ]
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            
            for html_file, png_file in files_to_export:
                if not os.path.exists(html_file):
                    print(f"✗ File not found: {html_file}")
                    continue
                
                print(f"\n📄 Converting {html_file}...")
                
                try:
                    page = browser.new_page(viewport={"width": 1920, "height": 1080})
                    file_path = Path(html_file).resolve()
                    page.goto(f'file:///{file_path}', wait_until='networkidle')
                    
                    # Get full page height
                    height = page.evaluate('() => document.body.scrollHeight')
                    page.set_viewport_size({"width": 1920, "height": max(1080, int(height))})
                    
                    # Take full page screenshot
                    page.screenshot(path=png_file, full_page=True)
                    page.close()
                    
                    file_size = os.path.getsize(png_file) / 1024  # KB
                    print(f"✓ Saved: {png_file} ({file_size:.1f} KB)")
                    
                except Exception as e:
                    print(f"✗ Error converting {html_file}: {str(e)}")
                    try:
                        page.close()
                    except:
                        pass
            
            browser.close()
            return True
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False


def export_with_selenium():
    """Export using Selenium (Fallback)"""
    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from webdriver_manager.chrome import ChromeDriverManager
        from selenium.webdriver.chrome.service import Service
    except ImportError:
        print("✗ Selenium dependencies not found")
        print("\nInstall with:")
        print("  pip install selenium webdriver-manager")
        return False
    
    files_to_export = [
        ('DATA_FLOW_DIAGRAM.html', 'DATA_FLOW_DIAGRAM.png'),
        ('PROGRAM_FLOWCHART.html', 'PROGRAM_FLOWCHART.png')
    ]
    
    for html_file, png_file in files_to_export:
        if not os.path.exists(html_file):
            print(f"✗ File not found: {html_file}")
            continue
        
        print(f"\n📄 Converting {html_file}...")
        
        driver = None
        try:
            # Setup Chrome options
            options = webdriver.ChromeOptions()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--start-maximized')
            
            # Create driver
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
            
            # Load HTML file
            file_path = Path(html_file).resolve()
            driver.get(f'file:///{file_path}')
            
            # Wait for SVG content
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_all_elements_located((By.TAG_NAME, "svg"))
                )
            except:
                print(f"⚠ Timeout waiting for content (continuing anyway)")
            
            # Get document height and set window size
            total_height = driver.execute_script("return document.body.parentNode.scrollHeight")
            driver.set_window_size(1920, max(1080, total_height))
            
            # Take screenshot
            driver.save_screenshot(png_file)
            
            file_size = os.path.getsize(png_file) / 1024  # KB
            print(f"✓ Saved: {png_file} ({file_size:.1f} KB)")
            
        except Exception as e:
            print(f"✗ Error converting {html_file}: {str(e)}")
            return False
        finally:
            if driver:
                driver.quit()
    
    return True


def main():
    print("=" * 60)
    print("NEXT STEP - Diagram Exporter to PNG")
    print("=" * 60)
    
    # Try Playwright first (best quality)
    print("\n🔄 Attempting to use Playwright...")
    print("-" * 60)
    if export_with_playwright():
        print("\n" + "=" * 60)
        print("✓ All diagrams exported successfully!")
        print("=" * 60)
        print("\nGenerated files:")
        print("  • DATA_FLOW_DIAGRAM.png")
        print("  • PROGRAM_FLOWCHART.png")
        return 0
    
    # Fallback to Selenium
    print("\n🔄 Attempting to use Selenium...")
    print("-" * 60)
    if export_with_selenium():
        print("\n" + "=" * 60)
        print("✓ All diagrams exported successfully!")
        print("=" * 60)
        print("\nGenerated files:")
        print("  • DATA_FLOW_DIAGRAM.png")
        print("  • PROGRAM_FLOWCHART.png")
        return 0
    
    # Failed
    print("\n" + "=" * 60)
    print("✗ Could not export diagrams")
    print("=" * 60)
    print("\nPlease install one of these options:")
    print("\nOPTION 1: Playwright (Recommended)")
    print("  pip install playwright")
    print("  playwright install chromium")
    print("\nOPTION 2: Selenium")
    print("  pip install selenium webdriver-manager")
    
    return 1


if __name__ == '__main__':
    sys.exit(main())
            
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
