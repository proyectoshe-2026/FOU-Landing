# Landing FOU y UNSAM: Jornadas de formación

Landing de pre-inscripción para las jornadas de formación profesional que organizan
FOU (centro de entrenamiento y medicina deportiva) y la Diplomatura en Política y
Gestión Deportiva de la UNSAM.

Sitio estático: HTML, CSS y JavaScript vanilla. **Sin frameworks, sin dependencias,
sin paso de build en el servidor.**

`index.html` es autónomo: logos, patrones y las 12 fotos de disertantes van embebidos
como data URI. Lo único externo son las tipografías (Montserrat y Exo) de Google Fonts
y el contenedor de Google Tag Manager.

---

## Cómo se publica

```
editar en local → git push a main → Cloudflare Pages despliega solo → capacitaciones.fou.com.ar
```

- **Hosting:** Cloudflare Pages, proyecto `fou-landing`, conectado a este repo.
  Cada push a `main` sale a producción en segundos. No hay que subir nada a mano.
- **Configuración del proyecto en Cloudflare Pages:** Framework preset `None`,
  build command vacío, output directory `/` (la raíz del repo).
- **Dominio:** `capacitaciones.fou.com.ar`, cargado en Workers & Pages → fou-landing →
  Custom domains. Cloudflare crea el registro `CNAME capacitaciones → fou-landing.pages.dev`
  y el certificado. **No editar ese CNAME a mano** en el DNS.
- **Ver un deploy:** Workers & Pages → fou-landing → Deployments. El último commit de
  `main` tiene que figurar en *Success* como *Production*.
- **Volver a una versión anterior:** en Deployments, menú (⋯) del deploy bueno →
  *Rollback to this deployment*.
- **Cambios grandes:** probarlos antes en local con `serve.ps1`, o subirlos a una rama
  aparte (Cloudflare Pages genera una URL de preview por rama) y después mergear a `main`.
- **Headers o redirecciones:** Cloudflare Pages usa archivos `_headers` y `_redirects`
  en la raíz del repo.
- **Si un cambio no se ve:** probar en ventana privada. Si sigue igual,
  Cloudflare → Caching → Purge.

---

## La página de gracias

Al enviar el formulario, la persona es redirigida a:

```
capacitaciones.fou.com.ar/gracias-registro
```

La página vive en `gracias-registro/index.html` y Cloudflare Pages la sirve en
`/gracias-registro` sin configurar nada. La ruta se define en la constante
`GRACIAS_URL` de `landing.src.html`. Con `GRACIAS_URL = ""` el formulario no
redirige: muestra la confirmación dentro de la misma tarjeta.

El chat no redirige: después de guardar los datos sigue respondiendo dudas.

---

## Formulario y Google Sheet

El formulario y el chat mandan un `POST` (`mode: 'no-cors'`) a un Google Apps Script
publicado como aplicación web (`apps-script.gs`). El script:

1. Escribe una fila en la Sheet "Jornadas de capacitación Fou", pestaña `Pre-inscriptos`.
   Columnas: Nombre · Apellido · Mail · Teléfono · Jornada · Fecha del dato · Origen
   (`Formulario` o `Chat`). El teléfono se normaliza a `+549` + 10 dígitos.
2. Manda el mail de confirmación de la jornada elegida vía EnvíaloSimple.

La URL del script (termina en `/exec`) está en la constante `SHEET_ENDPOINT` de
`landing.src.html`. La API key de EnvíaloSimple va en Propiedades del script de
Apps Script, **nunca en este repo**.

Si se cambia `apps-script.gs`, hay que volver a implementarlo en el editor de
Apps Script: Implementar → Administrar implementaciones → lápiz → Versión: Nueva →
Implementar. Así la URL `/exec` se mantiene.

Las claves de `MAILS_POR_JORNADA` en `apps-script.gs` tienen que ser idénticas a los
`value` del `<select name="jornada">` de `landing.src.html`. Si no coinciden, el mail
no se envía.

---

## Google Tag Manager

Está instalado el contenedor **GTM-59CVWFCL** en la landing y en la página de
gracias: el `<script>` en el `<head>` y el `<noscript>` como primer elemento del
`<body>`. Las etiquetas (Analytics, píxeles, conversiones) se configuran dentro de
tagmanager.google.com, no en este código.

---

## Cómo editar la landing

```
index.html                  el sitio publicable (GENERADO: no editar a mano)
landing.src.html            la fuente: acá se edita todo
build.ps1                   genera index.html embebiendo los assets
serve.ps1                   servidor local en http://localhost:8899
apps-script.gs              backend del formulario (Google Apps Script)
gracias-registro/           página de gracias
mail-img/                   imágenes de los mails de confirmación (las cargan los mails desde el sitio)
assets/
  fotos/                    los 12 retratos ya procesados (480x640)
  fou-logo-*.png            logos de FOU
  unsam-pyg-*.png           logo de Política y Gobierno UNSAM (blanco y oscuro)
  pattern-*.png             patrones de la marca
  fou-og.jpg                imagen para la vista previa al compartir el link (1200x630)
extraer-pdf.ps1, prep-*.ps1 scripts de una sola vez (preparación de imágenes)
```

Flujo de trabajo:

```powershell
# 0. traer lo último del repo
git pull --rebase origin main
# 1. editar landing.src.html
# 2. regenerar
powershell -ExecutionPolicy Bypass -File build.ps1
# 3. previsualizar
powershell -ExecutionPolicy Bypass -File serve.ps1
# 4. publicar
git add -A
git commit -m "Describe el cambio"
git push origin main
```

`build.ps1` reemplaza los marcadores `__LOGO_NEGRO_MARCA__`, `__UNSAM__`,
`__FOTO_<slug>__`, etc. por los data URI correspondientes. Usa `System.Drawing`,
así que **corre en Windows PowerShell 5.1**.

**Desde Mac o Linux no hace falta correrlo:** `index.html` ya está generado. Se puede
editar directo, pero esos cambios se pierden si alguien vuelve a correr el build desde
la fuente. Si se trabaja así, conviene volcar el cambio también en `landing.src.html`.

---

## Datos que usa la página

WhatsApp 11 6893-0497 · fou.contacto@gmail.com · @fou.arg · Fournier 2353, Boedo, CABA.

Jornadas: Kinesiología 31/10 (9 a 18 h) · Psicología 14/11 (9 a 13 h) ·
Nutrición 21/11 (9 a 18 h) · Gestión de equipos y Preparación física en 2027,
fecha a confirmar.
