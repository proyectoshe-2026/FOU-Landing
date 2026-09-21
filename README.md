# Landing FOU y UNSAM — Jornadas de formación

Landing de pre-inscripción para las jornadas de formación profesional que organizan
FOU (centro de entrenamiento y medicina deportiva) y la Diplomatura en Política y
Gestión Deportiva de la UNSAM.

Sitio estático: HTML, CSS y JavaScript vanilla. **Sin frameworks, sin dependencias,
sin paso de build en el servidor.**

`index.html` es autónomo: logos, patrones y las 12 fotos de disertantes van embebidos
como data URI. Lo único externo son las tipografías (Montserrat y Exo) de Google Fonts
y el contenedor de Google Tag Manager.

---

## Publicar en Vercel

No hay que compilar nada: se sirve `index.html` tal cual.

1. Subir este repositorio a GitHub.
2. En Vercel: **Add New → Project → Import** el repo.
3. Configuración:
   - **Framework Preset:** `Other`
   - **Build Command:** vacío (desactivar el override)
   - **Output Directory:** vacío o `.` (la raíz del repo)
   - **Install Command:** vacío
4. Deploy. La landing queda en `/`.

## Dominio con Cloudflare

El DNS está en Cloudflare y el hosting en Vercel.

1. En Vercel, **Project → Settings → Domains**, agregar `capacitaciones.fou.com.ar`.
2. En Cloudflare, crear el registro que pide Vercel:

   ```
   Tipo    Nombre           Contenido
   CNAME   capacitaciones   cname.vercel-dns.com
   ```

   Para un dominio raíz (sin subdominio) Vercel pide `A → 76.76.21.21`.
3. **Si dejás el proxy de Cloudflare activado (nube naranja):** poner
   **SSL/TLS → Overview → Full (strict)**. Con "Flexible" el sitio entra en
   redirección infinita. Si preferís evitar el tema, poner la nube en gris
   (DNS only) y que Vercel maneje el certificado.
4. Esperar a que Vercel marque el dominio como *Valid Configuration*.

---

## La página de gracias (se entrega aparte)

Al enviar el formulario, la persona es redirigida a:

```
capacitaciones.fou.com.ar/gracias-registro
```

Esa página viaja en un paquete separado. **Tiene que quedar publicada en esa misma
ruta del mismo dominio**, porque la landing redirige ahí. Hay dos formas:

- **Recomendada:** copiar la carpeta `gracias-registro/` (con su `index.html` adentro)
  a la raíz de este repo antes de deployar. Vercel la sirve en `/gracias-registro`
  sin configurar nada.
- **Alternativa:** si la página va a vivir en otra ruta o en otro dominio, cambiar la
  constante `GRACIAS_URL` en `landing.src.html` (buscar `GRACIAS_URL`) y regenerar
  `index.html`, o editar el mismo valor directo en `index.html`.

Con `GRACIAS_URL = ""` el formulario no redirige: muestra la confirmación dentro de
la misma tarjeta.

---

## Pendiente: conectar el formulario con la Google Sheet

Hoy el formulario **valida y redirige, pero todavía no guarda los datos**. Falta
publicar el backend:

1. Abrir la Sheet "Jornadas de capacitación Fou" → **Extensiones → Apps Script**.
2. Pegar el contenido de `apps-script.gs` y guardar.
3. **Implementar → Nueva implementación → Aplicación web**, con
   *Ejecutar como: Yo* y *Quién tiene acceso: Cualquier usuario*.
4. Copiar la URL que termina en `/exec` y pegarla en la constante `SHEET_ENDPOINT`
   de `landing.src.html` (buscar `REEMPLAZAR`). Regenerar `index.html` con
   `build.ps1`, o reemplazar el mismo texto directo en `index.html`.

El formulario y el chat mandan un `POST` con `mode: 'no-cors'`. Columnas que escribe:
Nombre · Apellido · Mail · Teléfono · Jornada · Fecha del dato · Origen
(`Formulario` o `Chat`). El teléfono se normaliza a `+549` + 10 dígitos.

---

## Google Tag Manager

Ya está instalado el contenedor **GTM-59CVWFCL**: el `<script>` en el `<head>` y el
`<noscript>` como primer elemento del `<body>`. La página de gracias lo tiene también.

---

## Cómo editar la landing

```
index.html          el sitio publicable (GENERADO: no editar a mano)
landing.src.html    la fuente: acá se edita todo
build.ps1           genera index.html embebiendo los assets
serve.ps1           servidor local en http://localhost:8899
apps-script.gs      backend del formulario (Google Apps Script)
assets/
  fotos/            los 12 retratos ya procesados (480x640)
  fou-logo-*.png    logos de FOU
  unsam-pyg-*.png   logo de Política y Gobierno UNSAM (blanco y oscuro)
  pattern-*.png     patrones de la marca
```

Flujo de trabajo:

```powershell
# 1. editar landing.src.html
# 2. regenerar
powershell -ExecutionPolicy Bypass -File build.ps1
# 3. previsualizar
powershell -ExecutionPolicy Bypass -File serve.ps1
```

`build.ps1` reemplaza los marcadores `__LOGO_NEGRO_MARCA__`, `__UNSAM__`,
`__FOTO_<slug>__`, etc. por los data URI correspondientes. Usa `System.Drawing`,
así que **corre en Windows PowerShell 5.1**.

**Desde Mac o Linux no hace falta correrlo:** `index.html` ya está generado y es lo
único que se publica. Se puede editar directo, pero esos cambios se pierden si
alguien vuelve a correr el build desde la fuente. Si se trabaja así, conviene
volcar el cambio también en `landing.src.html`.

---

## Datos que usa la página

WhatsApp 11 6893-0497 · fou.contacto@gmail.com · @fou.arg · Fournier 2353, Boedo, CABA.

Jornadas: Kinesiología 31/10 (9 a 18 h) · Psicología 14/11 (9 a 13 h) ·
Nutrición 21/11 (9 a 18 h) · Gestión de equipos y Preparación física en 2027,
fecha a confirmar.
