# Servidor estatico minimo para previsualizar la landing.
# Uso: powershell -ExecutionPolicy Bypass -File serve.ps1
# Luego abrir http://localhost:8899/index.html

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8899/")
$listener.Start()
Write-Output "sirviendo $root en http://localhost:8899/"

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = $ctx.Request.Url.LocalPath.TrimStart("/")
  if ($rel -eq "") { $rel = "index.html" }
  $path = Join-Path $root $rel
  if (Test-Path $path -PathType Leaf) {
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $ext = [System.IO.Path]::GetExtension($path).ToLower()
    $type = "text/html; charset=utf-8"
    if ($ext -eq ".png")  { $type = "image/png" }
    if ($ext -eq ".jpg")  { $type = "image/jpeg" }
    if ($ext -eq ".css")  { $type = "text/css" }
    if ($ext -eq ".js")   { $type = "application/javascript" }
    $ctx.Response.ContentType = $type
    $ctx.Response.Headers.Add("Cache-Control", "no-store")
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $ctx.Response.StatusCode = 404
  }
  $ctx.Response.Close()
}
