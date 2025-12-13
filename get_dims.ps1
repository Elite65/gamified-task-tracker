Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:\Users\Joe Paul Koola\.gemini\antigravity\brain\abef6f47-c6c3-423b-80c9-9ce5bb060a10\uploaded_image_1765591781207.png')
Write-Output "Width: $($img.Width)"
Write-Output "Height: $($img.Height)"
$img.Dispose()
