function Get-FileSignature {
    param ($path)
    if (Test-Path $path) {
        $bytes = Get-Content $path -Encoding Byte -TotalCount 4
        $hex = ($bytes | ForEach-Object { $_.ToString("X2") }) -join " "
        
        $type = "Unknown"
        if ($hex -match "^89 50 4E 47") { $type = "PNG" }
        if ($hex -match "^FF D8 FF") { $type = "JPEG" }
        
        Write-Output "$path : $type ($hex)"
    }
    else {
        Write-Output "$path : Not Found"
    }
}

$root = "c:\Users\Joe Paul Koola\.gemini\antigravity\scratch\gamified-task-tracker\public"

Get-FileSignature "$root\pwa-192x192.png"
Get-FileSignature "$root\pwa-512x512.png"
Get-FileSignature "$root\maskable-icon-192.png"
Get-FileSignature "$root\maskable-icon-512.png"
