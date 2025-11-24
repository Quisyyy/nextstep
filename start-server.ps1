$Port = 8000
$Root = Get-Location

Write-Host "Starting simple PowerShell static server"
Write-Host "Root: $Root"
Write-Host "Port: $Port"

$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Listening on $prefix"

function Get-ContentType($ext) {
    switch ($ext.ToLower()) {
        '.html' { 'text/html' }
        '.htm'  { 'text/html' }
        '.css'  { 'text/css' }
        '.js'   { 'application/javascript' }
        '.json' { 'application/json' }
        '.png'  { 'image/png' }
        '.jpg'  { 'image/jpeg' }
        '.jpeg' { 'image/jpeg' }
        '.gif'  { 'image/gif' }
        '.svg'  { 'image/svg+xml' }
        '.mp4'  { 'video/mp4' }
        default { 'application/octet-stream' }
    }
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $rawUrl = $req.RawUrl
        $pathOnly = $rawUrl -split '\?' | Select-Object -First 1
        $localPath = [System.Uri]::UnescapeDataString($pathOnly.TrimStart('/').Replace('/','\\'))
        if ([string]::IsNullOrEmpty($localPath)) { $localPath = 'index.html' }

        $filePath = Join-Path -Path $Root -ChildPath $localPath
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath)
            $res.ContentType = Get-ContentType $ext
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.StatusCode = 200
        }
        else {
            $res.StatusCode = 404
            $msg = "Not Found: $pathOnly"
            $buf = [System.Text.Encoding]::UTF8.GetBytes($msg)
            $res.ContentType = 'text/plain'
            $res.ContentLength64 = $buf.Length
            $res.OutputStream.Write($buf, 0, $buf.Length)
        }
        $res.OutputStream.Close()
    }
    catch {
        Write-Host "Server error: $_"
    }
}

$listener.Stop()