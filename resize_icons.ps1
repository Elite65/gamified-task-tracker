Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$SourcePath,
        [string]$DestPath,
        [int]$Width,
        [int]$Height
    )

    if (-not (Test-Path $SourcePath)) {
        Write-Error "Source file not found: $SourcePath"
        return
    }

    $srcImage = [System.Drawing.Image]::FromFile($SourcePath)
    $newBitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.DrawImage($srcImage, 0, 0, $Width, $Height)
    
    $srcImage.Dispose()
    
    # Save
    $newBitmap.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $newBitmap.Dispose()
    $graphics.Dispose()
    
    Write-Output "Created $DestPath ($($Width)x$($Height))"
}

$root = "c:\Users\Joe Paul Koola\.gemini\antigravity\scratch\gamified-task-tracker\public"

# Source files (using the 1024x1024 originals)
$iconSource = "$root\elite65_icon_pure.png"
$maskableSource = "$root\maskable-icon.png"

# Resize Standard Icons
Resize-Image -SourcePath $iconSource -DestPath "$root\pwa-192x192.png" -Width 192 -Height 192
Resize-Image -SourcePath $iconSource -DestPath "$root\pwa-512x512.png" -Width 512 -Height 512

# Resize Maskable Icons (creating specific sizes)
Resize-Image -SourcePath $maskableSource -DestPath "$root\maskable-icon-192.png" -Width 192 -Height 192
Resize-Image -SourcePath $maskableSource -DestPath "$root\maskable-icon-512.png" -Width 512 -Height 512
