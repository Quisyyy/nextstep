// Export diagrams to PNG using Puppeteer
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function exportDiagramsToPNG() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const files = [
      { input: 'DATA_FLOW_DIAGRAM.html', output: 'DATA_FLOW_DIAGRAM.png' },
      { input: 'PROGRAM_FLOWCHART.html', output: 'PROGRAM_FLOWCHART.png' }
    ];

    for (const file of files) {
      console.log(`Converting ${file.input} to PNG...`);
      
      const page = await browser.newPage();
      const filePath = path.resolve(__dirname, file.input);
      
      // Set viewport to capture the full diagram
      await page.setViewport({ width: 1400, height: 1200 });
      
      // Load the HTML file
      await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });
      
      // Wait for SVGs to render
      await page.waitForTimeout(1000);
      
      // Get the full page height
      const bodyHandle = await page.$('body');
      const { height } = await bodyHandle.boundingBox();
      
      await page.setViewport({ width: 1400, height: Math.max(1200, height) });
      
      // Take screenshot
      const outputPath = path.resolve(__dirname, file.output);
      await page.screenshot({ 
        path: outputPath,
        fullPage: true
      });
      
      console.log(`✓ Saved: ${file.output}`);
      await page.close();
    }

    console.log('\n✓ All diagrams exported successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

exportDiagramsToPNG();
