# Genera index.html a partir de landing.src.html, embebiendo los assets como data URI.
# Uso:  powershell -ExecutionPolicy Bypass -File build.ps1
#
# Fotos de disertantes: guardarlas en assets\fotos\ con el nombre del slug
# (pablo-capucheti.jpg, luis-garcia.jpg, etc). Si falta una, la tarjeta
# muestra las iniciales.

Add-Type -AssemblyName System.Drawing
$root   = Split-Path -Parent $MyInvocation.MyCommand.Path
$assets = Join-Path $root "assets"
$web    = Join-Path $assets "web"
New-Item -ItemType Directory -Force -Path $web | Out-Null

function Resize-Png($inPath, $outPath, $maxW, $transparentWhite) {
  $src = [System.Drawing.Image]::FromFile($inPath)
  $scale = [Math]::Min(1.0, $maxW / $src.Width)
  $w = [int]($src.Width * $scale); $h = [int]($src.Height * $scale)
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.Clear([System.Drawing.Color]::Transparent)
  if ($transparentWhite) {
    $attr = New-Object System.Drawing.Imaging.ImageAttributes
    $lo = [System.Drawing.Color]::FromArgb(238,238,238)
    $hi = [System.Drawing.Color]::FromArgb(255,255,255)
    $attr.SetColorKey($lo, $hi)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $g.DrawImage($src, $rect, 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr)
  } else {
    $g.DrawImage($src, 0, 0, $w, $h)
  }
  $g.Dispose(); $src.Dispose()
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

# Recorta la franja superior (el wordmark, sin el tagline) y la escala.
function Crop-Top($inPath, $outPath, $keepRatio, $maxW) {
  $src = [System.Drawing.Image]::FromFile($inPath)
  $ch = [int]($src.Height * $keepRatio)
  $scale = [Math]::Min(1.0, $maxW / $src.Width)
  $w = [int]($src.Width * $scale); $h = [int]($ch * $scale)
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.Clear([System.Drawing.Color]::Transparent)
  $dest = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $g.DrawImage($src, $dest, 0, 0, $src.Width, $ch, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose(); $src.Dispose()
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

# Recorta una caja definida en porcentajes (0-1) y escala.
function Crop-Box($inPath, $outPath, $x0, $y0, $x1, $y1, $maxW) {
  $src = [System.Drawing.Image]::FromFile($inPath)
  $sx = [int]($src.Width * $x0); $sy = [int]($src.Height * $y0)
  $sw = [int]($src.Width * ($x1 - $x0)); $sh = [int]($src.Height * ($y1 - $y0))
  $scale = [Math]::Min(1.0, $maxW / $sw)
  $w = [int]($sw * $scale); $h = [int]($sh * $scale)
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.Clear([System.Drawing.Color]::Transparent)
  $dest = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $g.DrawImage($src, $dest, $sx, $sy, $sw, $sh, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose(); $src.Dispose()
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

function DataUri($path) {
  if (-not (Test-Path $path)) { return "" }
  $ext = [System.IO.Path]::GetExtension($path).ToLower()
  $mime = "image/png"
  if ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $mime = "image/jpeg" }
  return "data:$mime;base64," + [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($path))
}

Resize-Png (Join-Path $assets "fou-logo-blanco.png") (Join-Path $web "logo-blanco.png")   900 $false
# El logo de UNSAM lo prepara prep-unsam.ps1 (version blanca y version oscura).
Resize-Png (Join-Path $assets "pattern-verde.png")   (Join-Path $web "pattern-verde.png") 420 $true
Resize-Png (Join-Path $assets "pattern-gris.png")    (Join-Path $web "pattern-gris.png")  420 $true
Crop-Top   (Join-Path $assets "fou-logo-negro.png")  (Join-Path $web "marca-negro.png")   0.74 700
Crop-Top   (Join-Path $assets "fou-logo-blanco.png") (Join-Path $web "marca-blanco.png")  0.74 700

$html = [System.IO.File]::ReadAllText((Join-Path $root "landing.src.html"), (New-Object System.Text.UTF8Encoding($false)))

$map = @{
  "__LOGO_BLANCO__"       = DataUri (Join-Path $web "logo-blanco.png")
  "__LOGO_NEGRO_MARCA__"  = DataUri (Join-Path $web "marca-negro.png")
  "__LOGO_BLANCO_MARCA__" = DataUri (Join-Path $web "marca-blanco.png")
  "__UNSAM__"             = DataUri (Join-Path $assets "unsam-pyg-oscuro.png")
  "__UNSAM_BLANCO__"      = DataUri (Join-Path $assets "unsam-pyg-blanco.png")
  "__PATTERN_VERDE__"     = DataUri (Join-Path $web "pattern-verde.png")
  "__PATTERN_GRIS__"      = DataUri (Join-Path $web "pattern-gris.png")
}

$slugs = @("pablo-capucheti","luis-garcia","pablo-varela",
           "fernando-luna","luciano-spena","eugenio-rossi",
           "luciana-ortiz","gustavo-ruiz","lisandro-aisa",
           "julio-lamas","horacio-anselmi","esteban-pizzi")

$faltan = 0
foreach ($s in $slugs) {
  # Las fotos ya vienen recortadas y comprimidas por prep-fotos.ps1: los JPEG
  # se embeben tal cual (pasarlos a PNG multiplicaria el peso del archivo).
  $foto = ""
  foreach ($ext in @(".jpg",".jpeg",".png")) {
    $p = Join-Path $assets ("fotos\" + $s + $ext)
    if (Test-Path $p) {
      if ($ext -eq ".png") {
        $tmp = Join-Path $web ("foto-" + $s + ".png")
        Resize-Png $p $tmp 600 $false
        $foto = DataUri $tmp
      } else {
        $foto = DataUri $p
      }
      break
    }
  }
  if ($foto -eq "") { $faltan++ }
  $map[("__FOTO_" + $s + "__")] = $foto
}

foreach ($k in $map.Keys) { $html = $html.Replace($k, $map[$k]) }

$outFile = Join-Path $root "index.html"
[System.IO.File]::WriteAllText($outFile, $html, (New-Object System.Text.UTF8Encoding($false)))
$kb = [int]((Get-Item $outFile).Length / 1KB)
Write-Output ("index.html generado - " + $kb + " KB. Fotos faltantes: " + $faltan + " de " + $slugs.Count + ".")
