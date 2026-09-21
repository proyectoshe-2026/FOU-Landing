/**
 * FOU x UNSAM — recepción de pre-inscripciones
 *
 * Recibe lo que envía el formulario de la landing y lo escribe como una
 * fila nueva en esta Sheet. El mail posterior se maneja aparte, desde
 * EnvíaloSimple.
 *
 * CÓMO INSTALARLO (una sola vez)
 *  1. Abrí la Sheet "Jornadas de capacitación Fou".
 *  2. Menú Extensiones > Apps Script. Borrá lo que haya y pegá este archivo entero.
 *  3. Guardá (ícono del disquete).
 *  4. Implementar > Nueva implementación > engranaje > Aplicación web.
 *       Ejecutar como:      Yo
 *       Quién tiene acceso: Cualquier usuario      <-- importante
 *     Implementar > Autorizar acceso > elegí tu cuenta.
 *     Si aparece "Google no ha verificado esta aplicación":
 *       Configuración avanzada > Ir a (nombre del proyecto) > Permitir.
 *  5. Copiá la URL que termina en /exec: esa va en la landing.
 *
 * Si más adelante cambiás este código, hay que hacer Implementar >
 * Administrar implementaciones > editar (lápiz) > Versión: Nueva > Implementar.
 * Si no, la URL sigue sirviendo la versión vieja.
 */

var NOMBRE_HOJA = 'Pre-inscriptos';   // pestaña donde se escriben los datos

function doPost(e) {
  var datos = (e && e.parameter) ? e.parameter : {};

  var nombre   = (datos.nombre   || '').trim();
  var apellido = (datos.apellido || '').trim();
  var email    = (datos.email    || '').trim();
  var telefono = (datos.telefono || '').trim();
  var jornada  = (datos.jornada  || '').trim();
  var origen   = (datos.origen   || 'Formulario').trim();

  if (!nombre && !email) {
    return ContentService.createTextOutput('faltan datos');
  }

  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(NOMBRE_HOJA) || libro.getSheets()[0];

  // El teléfono va como texto para que la Sheet no se coma el + ni los ceros.
  // "origen" dice si el dato llegó del formulario de la landing o del chat.
  hoja.appendRow([nombre, apellido, email, "'" + telefono, jornada, new Date(), origen]);

  return ContentService.createTextOutput('ok');
}

// Ejecutá esta función desde el editor (elegila arriba y tocá Ejecutar) para
// probar que escribe bien, sin pasar por la landing.
function probar() {
  doPost({
    parameter: {
      nombre: 'Prueba',
      apellido: 'De Carga',
      email: 'prueba@ejemplo.com',
      telefono: '+5491123456789',
      jornada: 'Jornada de Kinesiología Deportiva (24/10/2026)',
      origen: 'Prueba'
    }
  });
}
