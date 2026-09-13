# Toma el logo blanco de Politica y Gobierno UNSAM, le saca el aire sobrante y
# genera dos versiones: blanca (fondos oscuros) y oscura (fondos claros).
# Uso: powershell -ExecutionPolicy Bypass -File prep-unsam.ps1

$root   = Split-Path -Parent $MyInvocation.MyCommand.Path
$origen = "C:\Users\comun\Downloads\PYG BLANCO.png"
$assets = Join-Path $root "assets"

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing, System.Drawing.Primitives -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class LogoUnsam {
  public static string Generar(string entrada, string salidaBlanco, string salidaOscuro, int anchoFinal) {
    using (var src = new Bitmap(entrada)) {
      var bd = src.LockBits(new Rectangle(0, 0, src.Width, src.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      int stride = Math.Abs(bd.Stride);
      byte[] buf = new byte[stride * src.Height];
      Marshal.Copy(bd.Scan0, buf, 0, buf.Length);
      src.UnlockBits(bd);

      // Caja del contenido visible
      int x0 = src.Width, y0 = src.Height, x1 = -1, y1 = -1;
      for (int y = 0; y < src.Height; y++)
        for (int x = 0; x < src.Width; x++) {
          int i = y * stride + x * 4;
          bool visible = buf[i+3] > 20 && (buf[i] > 40 || buf[i+1] > 40 || buf[i+2] > 40);
          if (visible) {
            if (x < x0) x0 = x; if (x > x1) x1 = x;
            if (y < y0) y0 = y; if (y > y1) y1 = y;
          }
        }
      if (x1 < 0) return "sin contenido";
      var caja = new Rectangle(x0, y0, x1 - x0 + 1, y1 - y0 + 1);

      float esc = (float)anchoFinal / caja.Width;
      int w = anchoFinal, h = (int)(caja.Height * esc);

      // Version blanca
      using (var blanco = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
        using (var g = Graphics.FromImage(blanco)) {
          g.InterpolationMode = InterpolationMode.HighQualityBicubic;
          g.PixelOffsetMode = PixelOffsetMode.HighQuality;
          g.Clear(Color.Transparent);
          g.DrawImage(src, new Rectangle(0, 0, w, h), caja.X, caja.Y, caja.Width, caja.Height, GraphicsUnit.Pixel);
        }
        blanco.Save(salidaBlanco, ImageFormat.Png);

        // Version oscura: mismo dibujo, tinta #16130F, conservando el alfa
        var bd2 = blanco.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int st2 = Math.Abs(bd2.Stride);
        byte[] b2 = new byte[st2 * h];
        Marshal.Copy(bd2.Scan0, b2, 0, b2.Length);
        for (int i = 0; i < b2.Length; i += 4) {
          if (b2[i+3] > 0) { b2[i] = 15; b2[i+1] = 19; b2[i+2] = 22; }
        }
        Marshal.Copy(b2, 0, bd2.Scan0, b2.Length);
        blanco.UnlockBits(bd2);
        blanco.Save(salidaOscuro, ImageFormat.Png);
      }
      return string.Format("recorte {0}x{1} -> {2}x{3}", caja.Width, caja.Height, w, h);
    }
  }
}
"@

$r = [LogoUnsam]::Generar($origen,
  (Join-Path $assets "unsam-pyg-blanco.png"),
  (Join-Path $assets "unsam-pyg-oscuro.png"), 620)
Write-Output $r
