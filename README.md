# Landing FOU × UNSAM — Jornadas de formación

Landing de pre-inscripción para las 5 jornadas de formación profesional que organizan
FOU (centro de entrenamiento y medicina deportiva) y la Diplomatura en Política y Gestión
Deportiva de la UNSAM.

Sitio estático: HTML, CSS y JavaScript vanilla. Sin frameworks, sin dependencias, sin npm.

## Para publicar

`index.html` es **autónomo**: logos, patrones y las 12 fotos de disertantes van embebidos
como data URI. Se sube ese solo archivo a cualquier hosting estático y funciona.

- **GitHub Pages:** subir el repo, Settings → Pages → Deploy from branch → `main` / root.
- **Hosting propio (DonWeb, etc.):** subir `index.html` a una subcarpeta, p. ej.
  `public_html/capacitaciones/`. No va en la raíz si ahí hay un WordPress.

Lo único externo son las tipografías (Montserrat y Exo) desde Google Fonts.

## Estructura

```
index.html          el sitio publicable (GENERADO: no editar a mano)
landing.src.html    la fuente: acá se edita todo
build.ps1           genera index.html embebiendo los assets
serve.ps1           servidor local en http://localhost:8899
apps-script.gs      backend del formulario (Google Apps Script)
assets/
  fotos/            retratos de disertantes ya procesados (480x640)
  fou-logo-*.png    logos de FOU
  unsam-pyg-*.png   logo Política y Gobierno UNSAM (blanco y oscuro)
  pattern-*.png     patrones de la marca
prep-fotos.ps1      procesa los retratos (silueta + resplandor azul)
prep-unsam.ps1      prepara el logo de UNSAM
extraer-pdf.ps1     extrae las imágenes del PDF de capacitaciones
```

## Flujo de trabajo

```powershell
# 1. Editar landing.src.html
# 2. Regenerar
powershell -ExecutionPolicy Bypass -File build.ps1
# 3. Previsualizar
powershell -ExecutionPolicy Bypass -File serve.ps1
```

`build.ps1` reemplaza los marcadores `__LOGO_NEGRO_MARCA__`, `__UNSAM__`, `__FOTO_<slug>__`,
etc. por los data URI correspondientes. Usa `System.Drawing`, así que corre en **Windows
PowerShell 5.1**. Desde Mac o Linux no hace falta correrlo: `index.html` ya está generado;
si hay que editar, se puede tocar directo, pero los cambios se pierden si alguien vuelve a
correr el build desde la fuente.

Los scripts `prep-*` y `extraer-pdf` tienen rutas a archivos originales en la máquina de
quien armó el proyecto. Sus resultados ya están en `assets/`, no hace falta volver a
correrlos.

## Formulario y chat → Google Sheet

El formulario de pre-inscripción y el chat mandan los datos por `POST` (`mode: 'no-cors'`)
a un Apps Script publicado como aplicación web, que escribe una fila en la Sheet
"Jornadas de capacitación Fou".

Columnas: Nombre · Apellido · Mail · Teléfono · Jornada · Fecha del dato · Origen
(`Formulario` o `Chat`). El teléfono llega normalizado como `+549` + 10 dígitos.

**Pendiente para que funcione:**

1. Pegar `apps-script.gs` en la Sheet (Extensiones → Apps Script).
2. Implementar → Nueva implementación → Aplicación web, con *Ejecutar como: Yo* y
   *Quién tiene acceso: Cualquier usuario*.
3. Copiar la URL que termina en `/exec` en la constante `SHEET_ENDPOINT` de
   `landing.src.html` (buscar `REEMPLAZAR`) y regenerar.

Hasta entonces, el formulario y el chat validan y muestran la confirmación, pero los datos
no se guardan.

## Otros pendientes

- Temarios de cada jornada: provisorios, a confirmar con FOU.
- Horario (9 a 13 h) y fechas 2027: a confirmar.
- Píxel de Meta: agregar en el `<head>` de `landing.src.html` antes de pautar.

## Contacto que usa la página

WhatsApp 11 6893-0497 · fou.contacto@gmail.com · @fou.arg · Fournier 2353, Boedo, CABA.
