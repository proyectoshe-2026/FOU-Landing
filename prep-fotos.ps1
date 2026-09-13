# Prepara las fotos de los disertantes replicando el tratamiento del PDF de FOU:
# silueta recortada (sin fondo), resplandor azul detras y encuadre uniforme.
# Las siluetas salen del propio PDF (extraer-pdf.ps1), asi que ya vienen con
# canal de transparencia. El marco verde lo dibuja el CSS de la landing.
#
# Uso: powershell -ExecutionPolicy Bypass -File prep-fotos.ps1

$root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$origen  = Join-Path $root "assets\pdf-img"
$destino = Join-Path $root "assets\fotos"
New-Item -ItemType Directory -Force -Path $destino | Out-Null

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing, System.Drawing.Primitives -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public class Retratos {
  const int ANCHO = 480;
  const int ALTO  = 640;

  // Deja transparente el marco verde que algunas fotos traen encima.
  static void QuitarVerde(Bitmap bmp) {
    var bd = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    int stride = Math.Abs(bd.Stride);
    byte[] buf = new byte[stride * bmp.Height];
    Marshal.Copy(bd.Scan0, buf, 0, buf.Length);
    for (int i = 0; i < buf.Length; i += 4) {
      byte b = buf[i], g = buf[i+1], r = buf[i+2];
      if (g > 50 && g >= r + 10 && g >= b + 10) { buf[i] = 0; buf[i+1] = 0; buf[i+2] = 0; buf[i+3] = 0; }
    }
    Marshal.Copy(buf, 0, bd.Scan0, buf.Length);
    bmp.UnlockBits(bd);
  }

  // Caja que ocupa realmente la persona, ignorando lo transparente.
  static Rectangle Contenido(Bitmap bmp) {
    var bd = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    int stride = Math.Abs(bd.Stride);
    byte[] buf = new byte[stride * bmp.Height];
    Marshal.Copy(bd.Scan0, buf, 0, buf.Length);
    bmp.UnlockBits(bd);

    int x0 = bmp.Width, y0 = bmp.Height, x1 = -1, y1 = -1;
    for (int y = 0; y < bmp.Height; y++) {
      int fila = y * stride;
      for (int x = 0; x < bmp.Width; x++) {
        if (buf[fila + x * 4 + 3] > 24) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) return new Rectangle(0, 0, bmp.Width, bmp.Height);
    return new Rectangle(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  }

  public static string Componer(string entrada, string salida, bool quitarVerde, int calidad) {
    using (var src = new Bitmap(entrada)) {
      var trabajo = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
      using (var g0 = Graphics.FromImage(trabajo)) g0.DrawImage(src, 0, 0, src.Width, src.Height);
      if (quitarVerde) QuitarVerde(trabajo);

      Rectangle caja = Contenido(trabajo);

      var lienzo = new Bitmap(ANCHO, ALTO, PixelFormat.Format32bppArgb);
      using (var g = Graphics.FromImage(lienzo)) {
        g.SmoothingMode = SmoothingMode.HighQuality;
        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
        g.Clear(Color.FromArgb(255, 10, 10, 11));

        // Resplandor azul detras de la figura, mas intenso hacia abajo.
        using (var path = new GraphicsPath()) {
          path.AddEllipse(-ANCHO * 0.25f, ALTO * 0.10f, ANCHO * 1.5f, ALTO * 1.25f);
          using (var brocha = new PathGradientBrush(path)) {
            brocha.CenterPoint = new PointF(ANCHO * 0.5f, ALTO * 0.80f);
            brocha.CenterColor = Color.FromArgb(255, 42, 96, 158);
            brocha.SurroundColors = new Color[] { Color.FromArgb(0, 10, 10, 11) };
            g.FillPath(brocha, path);
          }
        }

        // La figura: ocupa casi todo el alto y se apoya en la base.
        float escala = Math.Min((ALTO * 0.97f) / caja.Height, (ANCHO * 0.92f) / caja.Width);
        int fw = (int)(caja.Width * escala), fh = (int)(caja.Height * escala);
        int fx = (ANCHO - fw) / 2, fy = ALTO - fh;
        g.DrawImage(trabajo, new Rectangle(fx, fy, fw, fh), caja.X, caja.Y, caja.Width, caja.Height, GraphicsUnit.Pixel);
      }

      var codec = Array.Find(ImageCodecInfo.GetImageEncoders(), c => c.MimeType == "image/jpeg");
      var ps = new EncoderParameters(1);
      ps.Param[0] = new EncoderParameter(Encoder.Quality, (long)calidad);
      lienzo.Save(salida, codec, ps);
      lienzo.Dispose();
      trabajo.Dispose();
      return string.Format("{0}x{1}", ANCHO, ALTO);
    }
  }
}
"@

# imagen extraida del PDF -> disertante
$mapa = @(
  @{ img='img_159_480x640_alpha.png'; slug='pablo-capucheti' },
  @{ img='img_160_576x800_alpha.png'; slug='luis-garcia'     },
  @{ img='img_161_486x720_alpha.png'; slug='pablo-varela'    },
  @{ img='img_167_512x640_alpha.png'; slug='fernando-luna'   },
  @{ img='img_169_533x800_alpha.png'; slug='luciano-spena'   },
  @{ img='img_168_480x640_alpha.png'; slug='eugenio-rossi'   },
  @{ img='img_175_540x720_alpha.png'; slug='luciana-ortiz'   },
  @{ img='img_176_769x800_alpha.png'; slug='gustavo-ruiz'    },
  @{ img='img_177_720x680_alpha.png'; slug='lisandro-aisa'; verde=$true },
  @{ img='img_184_641x800_alpha.png'; slug='julio-lamas'     },
  @{ img='img_190_532x799_alpha.png'; slug='horacio-anselmi' },
  @{ img='img_191_800x532_alpha.png'; slug='esteban-pizzi'   }
)

foreach ($f in $mapa) {
  $entrada = Join-Path $origen $f.img
  if (-not (Test-Path $entrada)) { Write-Output ("FALTA: " + $f.img); continue }
  $salida = Join-Path $destino ($f.slug + ".jpg")
  $tam = [Retratos]::Componer($entrada, $salida, [bool]$f.verde, 86)
  $kb = [int]((Get-Item $salida).Length / 1KB)
  Write-Output ("{0,-18} {1}  {2} KB" -f $f.slug, $tam, $kb)
}
