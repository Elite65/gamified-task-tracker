Add-Type -AssemblyName System.Drawing

function Get-ImageDims {
    param ($path)
    if (Test-Path $path) {
        try {
            $img = [System.Drawing.Image]::FromFile($path)
            Write-Output "$path : $($img.Width)x$($img.Height)"
            $img.Dispose()
        }
        catch {
            Write-Output "$path : Error reading image"
        }
    }
    else {
        Write-Output "$path : Not Found"
    }
}

$root = "c:\Users\Joe Paul Koola\.gemini\antigravity\scratch\gamified-task-tracker\public"

Get-ImageDims "$root\icon-192.png"
Get-ImageDims "$root\icon-512.png"
Get-ImageDims "$root\icon-maskable-192.png"
Get-ImageDims "$root\icon-maskable-512.png"
Get-ImageDims "$root\screenshots\dashboard-wide.png"
Get-ImageDims "$root\screenshots\analytics-mobile.png"
Get-ImageDims "$root\screenshots\habits-wide.png"
Get-ImageDims "$root\screenshots\tasks-wide.png"
