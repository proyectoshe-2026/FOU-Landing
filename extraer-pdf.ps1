# Extrae las imagenes embebidas del PDF de capacitaciones, con su canal de
# transparencia (SMask) cuando lo tienen, y las guarda como PNG.
# El trabajo pesado va en C# porque en PowerShell puro tarda una eternidad.
#
# Uso: powershell -ExecutionPolicy Bypass -File extraer-pdf.ps1

$pdf     = "C:\Users\comun\Downloads\Capacitaciones FOU-UNSAM.pdf"
$destino = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "assets\pdf-img"
New-Item -ItemType Directory -Force -Path $destino | Out-Null

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing, System.Drawing.Primitives -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.IO.Compression;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;

public class PdfImgs {
  static byte[] bytes;
  static string txt;

  static byte[] Inflar(int desde, int largo) {
    if (largo <= 2) return null;
    try {
      using (var ms = new MemoryStream(bytes, desde + 2, largo - 2))
      using (var ds = new DeflateStream(ms, CompressionMode.Decompress))
      using (var outMs = new MemoryStream()) {
        ds.CopyTo(outMs);
        return outMs.ToArray();
      }
    } catch { return null; }
  }

  // Devuelve {inicioStream, largoStream} del objeto que arranca en pos
  static int[] UbicarStream(int pos, int fin) {
    int s = txt.IndexOf("stream", pos, StringComparison.Ordinal);
    if (s < 0 || s > fin) return null;
    int ini = s + 6;
    if (ini < txt.Length && txt[ini] == '\r') ini++;
    if (ini < txt.Length && txt[ini] == '\n') ini++;
    int e = txt.IndexOf("endstream", ini, StringComparison.Ordinal);
    if (e < 0) return null;
    return new int[] { ini, e - ini };
  }

  static int Num(string dicc, string clave) {
    var m = Regex.Match(dicc, Regex.Escape(clave) + @"\s+(\d+)");
    return m.Success ? int.Parse(m.Groups[1].Value) : 0;
  }

  public static string Extraer(string ruta, string destino, int minLado) {
    bytes = File.ReadAllBytes(ruta);
    txt = Encoding.GetEncoding(28591).GetString(bytes);

    // Posicion de cada objeto por numero
    var objs = new Dictionary<int, int>();
    var starts = new List<int>();
    foreach (Match m in Regex.Matches(txt, @"(\d+)\s+0\s+obj")) {
      objs[int.Parse(m.Groups[1].Value)] = m.Index;
      starts.Add(m.Index);
    }
    starts.Sort();

    var log = new StringBuilder();
    int hechas = 0;

    foreach (Match m in Regex.Matches(txt, @"(\d+)\s+0\s+obj")) {
      int pos = m.Index;
      int fin = txt.IndexOf("endobj", pos, StringComparison.Ordinal);
      if (fin < 0) continue;
      int sPos = txt.IndexOf("stream", pos, StringComparison.Ordinal);
      if (sPos < 0 || sPos > fin) continue;
      string dicc = txt.Substring(pos, sPos - pos);
      if (!Regex.IsMatch(dicc, @"/Subtype\s*/Image")) continue;

      int w = Num(dicc, "/Width"), h = Num(dicc, "/Height");
      if (w < minLado || h < minLado) continue;
      if (!dicc.Contains("/FlateDecode")) continue;
      if (dicc.Contains("/DecodeParms")) continue;

      bool gris = dicc.Contains("/DeviceGray") || dicc.Contains("/CalGray");
      int canales = gris ? 1 : 3;

      int[] st = UbicarStream(pos, fin);
      if (st == null) continue;
      byte[] datos = Inflar(st[0], st[1]);
      if (datos == null || datos.Length < (long)w * h * canales) continue;

      // Canal alfa
      byte[] alfa = null;
      var ms2 = Regex.Match(dicc, @"/SMask\s+(\d+)\s+0\s+R");
      if (ms2.Success) {
        int nm = int.Parse(ms2.Groups[1].Value);
        if (objs.ContainsKey(nm)) {
          int mp = objs[nm];
          int mfin = txt.IndexOf("endobj", mp, StringComparison.Ordinal);
          int msp = txt.IndexOf("stream", mp, StringComparison.Ordinal);
          if (mfin > 0 && msp > 0 && msp < mfin) {
            string md = txt.Substring(mp, msp - mp);
            if (Num(md, "/Width") == w && Num(md, "/Height") == h && !md.Contains("/DecodeParms")) {
              int[] mst = UbicarStream(mp, mfin);
              if (mst != null) {
                byte[] a = Inflar(mst[0], mst[1]);
                if (a != null && a.Length >= (long)w * h) alfa = a;
              }
            }
          }
        }
      }

      var bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
      var bd = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
      int stride = Math.Abs(bd.Stride);
      byte[] buf = new byte[stride * h];
      for (int y = 0; y < h; y++) {
        int fb = y * stride, fs = y * w * canales, fa = y * w;
        for (int x = 0; x < w; x++) {
          int i = fb + x * 4, j = fs + x * canales;
          if (gris) { byte v = datos[j]; buf[i] = v; buf[i+1] = v; buf[i+2] = v; }
          else { buf[i] = datos[j+2]; buf[i+1] = datos[j+1]; buf[i+2] = datos[j]; }
          buf[i+3] = alfa != null ? alfa[fa + x] : (byte)255;
        }
      }
      Marshal.Copy(buf, 0, bd.Scan0, buf.Length);
      bmp.UnlockBits(bd);

      string nombre = string.Format("img_{0}_{1}x{2}{3}.png", m.Groups[1].Value, w, h, alfa != null ? "_alpha" : "");
      bmp.Save(Path.Combine(destino, nombre), ImageFormat.Png);
      bmp.Dispose();
      hechas++;
      log.AppendLine(nombre);
    }

    log.AppendLine("--- extraidas: " + hechas);
    return log.ToString();
  }
}
"@

Write-Output (([PdfImgs]::Extraer($pdf, $destino, 250)))
