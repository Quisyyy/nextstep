# PowerShell script to convert HTML diagrams to PNG using Microsoft Edge
# This requires Edge browser to be installed (which is included with Windows)

$ErrorActionPreference = "Stop"

function Export-HtmlToPng {
    param(
        [string]$HtmlFile,
        [string]$OutputFile
    )
    
    if (-not (Test-Path $HtmlFile)) {
        Write-Host "File not found: $HtmlFile" -ForegroundColor Red
        return $false
    }
    
    Write-Host "Converting $HtmlFile to PNG..." -ForegroundColor Cyan
    
    # Create absolute path
    $absolutePath = (Get-Item $HtmlFile).FullName
    $fileUri = "file:///$($absolutePath -replace '\\', '/')"
    
    # Try using Edge (Chromium-based)
    $edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    
    if (-not (Test-Path $edgePath)) {
        Write-Host "Edge not found. Trying Chrome..." -ForegroundColor Yellow
        $edgePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    }
    
    if (-not (Test-Path $edgePath)) {
        Write-Host "No suitable browser found. Please install Chrome or Edge." -ForegroundColor Red
        return $false
    }
    
    try {
        # Launch browser with screenshot options
        & $edgePath --headless --disable-gpu --screenshot="$OutputFile" "$fileUri" 2>$null
        Start-Sleep -Seconds 3
        
        if (Test-Path $OutputFile) {
            Write-Host "Saved: $OutputFile" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
    
    return $false
}

# Main execution
Write-Host "Starting diagram export..." -ForegroundColor Cyan

Export-HtmlToPng -HtmlFile "DATA_FLOW_DIAGRAM.html" -OutputFile "DATA_FLOW_DIAGRAM.png"
Export-HtmlToPng -HtmlFile "PROGRAM_FLOWCHART.html" -OutputFile "PROGRAM_FLOWCHART.png"

Write-Host "Export process complete!" -ForegroundColor Green
