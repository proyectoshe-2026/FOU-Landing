/**
 * FOU x UNSAM — recepción de pre-inscripciones
 *
 * Recibe lo que envía el formulario de la landing, lo escribe como una fila
 * nueva en esta Sheet, y dispara el mail de confirmación vía la API de
 * EnvíaloSimple Transaccional (dominio envios.fou.com.ar). El envío masivo
 * ("para quemar") es aparte, se maneja desde EnvíaloSimple Marketing.
 *
 * CÓMO INSTALARLO (una sola vez)
 *  1. Abrí la Sheet "Jornadas de capacitación Fou".
 *  2. Menú Extensiones > Apps Script. Borrá lo que haya y pegá este archivo entero.
 *  3. Antes de guardar: Configuración del proyecto (ícono de engranaje) >
 *     Propiedades del script > Agregar propiedad del script.
 *       Propiedad: ENVIALOSIMPLE_API_KEY
 *       Valor:     (la clave API que generaste en EnvíaloSimple Transaccional)
 *     Nunca pegues la clave directo en este archivo: este repo vive en GitHub
 *     y cualquiera con acceso al código podría usarla para mandar mail en tu nombre.
 *  4. Guardá (ícono del disquete).
 *  5. Implementar > Nueva implementación > engranaje > Aplicación web.
 *       Ejecutar como:      Yo
 *       Quién tiene acceso: Cualquier usuario      <-- importante
 *     Implementar > Autorizar acceso > elegí tu cuenta.
 *     Si aparece "Google no ha verificado esta aplicación":
 *       Configuración avanzada > Ir a (nombre del proyecto) > Permitir.
 *  6. Copiá la URL que termina en /exec: esa va en la landing.
 *
 * Si más adelante cambiás este código, hay que hacer Implementar >
 * Administrar implementaciones > editar (lápiz) > Versión: Nueva > Implementar.
 * Si no, la URL sigue sirviendo la versión vieja.
 *
 * LOS MAILS
 *  - Se eligen por la jornada que manda el formulario (o el chat) de la landing.
 *    Las claves de MAILS_POR_JORNADA tienen que ser EXACTAMENTE iguales a los
 *    value del <select name="jornada"> de landing.src.html (con tildes,
 *    mayúsculas y paréntesis). Si no coinciden, no se manda nada.
 *  - {{nombre}} se reemplaza por el nombre que la persona puso en el formulario.
 *  - Las imágenes (header y footer) se levantan de la carpeta mail-img/, que se
 *    sube al hosting junto con la landing. Tienen que ser URLs públicas: si la
 *    carpeta no está online, el mail llega sin imágenes.
 *  - Los textos se generan con mails-jornadas/generar-envialosimple.sh.
 */

var NOMBRE_HOJA = 'Pre-inscriptos';   // pestaña donde se escriben los datos

var REMITENTE = 'Capacitaciones FOU <info@envios.fou.com.ar>';
var REPLY_TO  = 'fou.contacto@gmail.com';

var MAILS_POR_JORNADA = {
  "Kinesiología Deportiva (31/10)": {
    asunto: "Reservá tu vacante para la capacitación de Kinesiología Deportiva (FOU + UNSAM)",
    html: `
<div style="margin:0;padding:0;background:#eeeeee">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eeeeee"><tr><td align="center" style="padding:20px 10px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;background:#ffffff">
      <tr><td><img src="https://capacitaciones.fou.com.ar/mail-img/header-kinesiologia.png" width="600" alt="FOU · Jornada de Kinesiología · Política y Gobierno UNSAM" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
      <tr><td style="padding:28px 32px 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222222">
        <p style="margin:0 0 14px">Hola, {{nombre}}:</p>
        <p style="margin:0 0 14px"><strong>Gracias por interesarte en la Jornada de Kinesiología Deportiva: Tratamiento y readaptación funcional de lesiones deportivas, organizada por FOU junto a la Diplomatura en Política y Gestión Deportiva de la UNSAM.</strong></p>
        <p style="margin:0 0 14px">Te compartimos el detalle completo de la capacitación:</p>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Datos clave ✍️</h2>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px"><strong>Fecha:</strong> sábado 31 de octubre de 2026</li>
          <li style="margin:0 0 6px"><strong>Horario:</strong> de 9 a 18 h</li>
          <li style="margin:0 0 6px"><strong>Modalidad:</strong> presencial (cupos limitados)</li>
          <li style="margin:0 0 6px"><strong>Sede:</strong> Fournier 2353, Boedo, CABA</li>
          <li style="margin:0 0 6px"><strong>Certificación:</strong> certificado oficial emitido por la UNSAM</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">🗣️ Disertantes</h2>
        <p style="margin:0 0 14px">La jornada será dictada por profesionales referentes del alto rendimiento deportivo:</p>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px"><strong>Luis García</strong> (kinesiólogo de la Selección Argentina de Fútbol)</li>
          <li style="margin:0 0 6px"><strong>Pablo Capuchetti</strong> (kinesiólogo de la Selección Argentina de Fútbol)</li>
          <li style="margin:0 0 6px"><strong>Pablo Varela</strong> (kinesiólogo de fútbol profesional en Boca Juniors)</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Ejes temáticos 👇</h2>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px">La readaptación a la actividad física como eje del proceso de rehabilitación deportiva.</li>
          <li style="margin:0 0 6px">Volumen, intensidad y direccionalidad de las lesiones musculares.</li>
          <li style="margin:0 0 6px">Volumen, intensidad y direccionalidad de las lesiones por sobrecarga mecánica.</li>
          <li style="margin:0 0 6px">Volumen, intensidad y direccionalidad de las lesiones articulares.</li>
          <li style="margin:0 0 6px">El análisis del movimiento: protocolo para el estudio de la huella motriz.</li>
          <li style="margin:0 0 6px">GPS: control de evolución y retorno deportivo.</li>
          <li style="margin:0 0 6px">Y mucho más…</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Cuánto sale la jornada, qué beneficios tengo 💵</h2>
        <p style="margin:0 0 14px"><strong>El valor general de esta jornada es: $160.000</strong><br>Podés abonarlo haciendo clic acá 👇</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 16px"><tr>
          <td bgcolor="#9BEA2E" style="border-radius:8px"><a href="https://mpago.la/2345LKy" target="_blank" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#111111;text-decoration:none;border-radius:8px">¡Quiero pagar la jornada de Kinesiología!</a></td>
        </tr></table>
        <p style="margin:0 0 14px"><strong>Si te inscribís antes del 12/10 tenés un 10% off por inscripción temprana.</strong><br>Valor con descuento: <strong>$144.000</strong>. Podés pagar con este descuento acá 👇</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 16px"><tr>
          <td bgcolor="#9BEA2E" style="border-radius:8px"><a href="https://mpago.la/1mrAwVd" target="_blank" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#111111;text-decoration:none;border-radius:8px">¡Quiero pagar con 10% OFF! (vence el 12/10)</a></td>
        </tr></table>
        <p style="margin:0 0 14px"><strong>Si pagás por transferencia tenés un 5% off extra</strong>, acumulable con el beneficio de inscripción temprana. Más abajo tenés los datos para transferir.<br>
        Valor por transferencia: <strong>$152.000</strong><br>
        Con inscripción temprana + transferencia: <strong>$136.000</strong></p>
        <p style="margin:0 0 14px;padding:12px 14px;background:#f3fbe6;border-left:4px solid #9BEA2E"><strong>IMPORTANTE:</strong> si sos deportista de FOU o alumno/a o egresado/a de la Diplomatura en Política y Gestión Deportiva de la UNSAM, accedés a un <strong>20% de descuento</strong> pagando por transferencia (no acumulable con otros beneficios). Valor con este beneficio: <strong>$128.000</strong></p>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Datos para transferir 🏦</h2>
        <p style="margin:0 0 14px">Banco: <strong>Credicoop</strong><br>Alias: <strong>fou.arg</strong></p>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Cómo confirmar tu vacante ✅</h2>
        <p style="margin:0 0 14px">Los cupos son reducidos y el lugar se reserva únicamente con el pago.<br>
        Una vez hecho el pago, envianos el comprobante por <a href="https://api.whatsapp.com/send/?phone=5491168930497&amp;text=%C2%A1Hola%21+Ya+hice+la+reserva+de+mi+vacante.%0AAdjunto+el+pago.%0AMi+nombre+es%3A+%0AMi+mail+es%3A+%0AMe+anot%C3%A9+a+la+jornada+de%3A+Kinesiolog%C3%ADa" target="_blank" style="color:#1a73e8;font-weight:bold;text-decoration:underline">WhatsApp al 11 6893-0497</a> así te dejamos todo confirmado ☑️</p>
        <p style="margin:0 0 14px;font-size:13px;color:#666666">*Si pagaste con el beneficio de deportista de FOU o de alumno/a o egresado/a de la Diplomatura de la UNSAM, además te vamos a pedir tu DNI.</p>
        <p style="margin:24px 0 14px">¡Te esperamos!<br><strong>Equipo FOU</strong></p>
      </td></tr>
      <tr><td><img src="https://capacitaciones.fou.com.ar/mail-img/footer.png" width="600" alt="WhatsApp 11 6893-0497 · Fournier 2353, Boedo · @fou.arg" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
    </table>
  </td></tr></table>
</div>
    `
  },

  "Psicología Deportiva (14/11)": {
    asunto: "Reservá tu vacante para la capacitación de Psicología Deportiva (FOU + UNSAM)",
    html: `
<div style="margin:0;padding:0;background:#eeeeee">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eeeeee"><tr><td align="center" style="padding:20px 10px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;background:#ffffff">
      <tr><td><img src="https://capacitaciones.fou.com.ar/mail-img/header-psicologia.png" width="600" alt="FOU · Jornada de Psicología · Política y Gobierno UNSAM" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
      <tr><td style="padding:28px 32px 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222222">
        <p style="margin:0 0 14px">Hola, {{nombre}}:</p>
        <p style="margin:0 0 14px"><strong>Gracias por interesarte en la Jornada de Psicología Deportiva «El valor de equivocarse: la gestión del error y el circuito emocional del deportista», organizada por FOU junto a la Diplomatura en Política y Gestión Deportiva de la UNSAM.</strong></p>
        <p style="margin:0 0 14px">Te compartimos el detalle completo de la capacitación:</p>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Datos clave ✍️</h2>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px"><strong>Fecha:</strong> sábado 14 de noviembre de 2026</li>
          <li style="margin:0 0 6px"><strong>Horario:</strong> de 9 a 13 h</li>
          <li style="margin:0 0 6px"><strong>Modalidad:</strong> presencial (cupos limitados)</li>
          <li style="margin:0 0 6px"><strong>Sede:</strong> Fournier 2353, Boedo, CABA</li>
          <li style="margin:0 0 6px"><strong>Certificación:</strong> certificado oficial emitido por la UNSAM</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">🗣️ Disertantes</h2>
        <p style="margin:0 0 14px">La jornada será dictada por profesionales referentes del alto rendimiento deportivo:</p>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px"><strong>Gustavo Ruiz</strong> (psicólogo deportivo de Franco Colapinto)</li>
          <li style="margin:0 0 6px"><strong>Luciana Ortiz</strong> (psicóloga clínica y deportiva de FOU)</li>
          <li style="margin:0 0 6px"><strong>Lisandro Aisa</strong> (psicólogo deportivo de la Selección Argentina de Boccia)</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Ejes temáticos 👇</h2>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px">Proceso de aprendizaje deportivo: desde la cantidad hacia la calidad.</li>
          <li style="margin:0 0 6px">Entrenar para perder (y aprender): cómo lo que pensás y sentís moldea tu conducta deportiva.</li>
          <li style="margin:0 0 6px">Gestión emocional a través de herramientas psicológicas.</li>
          <li style="margin:0 0 6px">Y mucho más…</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Cuánto sale la jornada, qué beneficios tengo 💵</h2>
        <p style="margin:0 0 14px"><strong>El valor general de esta jornada es: $90.000</strong><br>Podés abonarlo haciendo clic acá 👇</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 16px"><tr>
          <td bgcolor="#9BEA2E" style="border-radius:8px"><a href="https://mpago.la/2b5d7qy" target="_blank" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#111111;text-decoration:none;border-radius:8px">¡Quiero pagar la jornada de Psicología!</a></td>
        </tr></table>
        <p style="margin:0 0 14px"><strong>Si te inscribís antes del 12/10 tenés un 10% off por inscripción temprana.</strong><br>Valor con descuento: <strong>$81.000</strong>. Podés pagar con este descuento acá 👇</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 16px"><tr>
          <td bgcolor="#9BEA2E" style="border-radius:8px"><a href="https://mpago.la/1crFaof" target="_blank" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#111111;text-decoration:none;border-radius:8px">¡Quiero pagar con 10% OFF! (vence el 12/10)</a></td>
        </tr></table>
        <p style="margin:0 0 14px"><strong>Si pagás por transferencia tenés un 5% off extra</strong>, acumulable con el beneficio de inscripción temprana. Más abajo tenés los datos para transferir.<br>
        Valor por transferencia: <strong>$85.500</strong><br>
        Con inscripción temprana + transferencia: <strong>$76.500</strong></p>
        <p style="margin:0 0 14px;padding:12px 14px;background:#f3fbe6;border-left:4px solid #9BEA2E"><strong>IMPORTANTE:</strong> si sos deportista de FOU o alumno/a o egresado/a de la Diplomatura en Política y Gestión Deportiva de la UNSAM, accedés a un <strong>20% de descuento</strong> pagando por transferencia (no acumulable con otros beneficios). Valor con este beneficio: <strong>$72.000</strong></p>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Datos para transferir 🏦</h2>
        <p style="margin:0 0 14px">Banco: <strong>Credicoop</strong><br>Alias: <strong>fou.arg</strong></p>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Cómo confirmar tu vacante ✅</h2>
        <p style="margin:0 0 14px">Los cupos son reducidos y el lugar se reserva únicamente con el pago.<br>
        Una vez hecho el pago, envianos el comprobante por <a href="https://api.whatsapp.com/send/?phone=5491168930497&amp;text=%C2%A1Hola%21+Ya+hice+la+reserva+de+mi+vacante.%0AAdjunto+el+pago.%0AMi+nombre+es%3A+%0AMi+mail+es%3A+%0AMe+anot%C3%A9+a+la+jornada+de%3A+Psicolog%C3%ADa" target="_blank" style="color:#1a73e8;font-weight:bold;text-decoration:underline">WhatsApp al 11 6893-0497</a> así te dejamos todo confirmado ☑️</p>
        <p style="margin:0 0 14px;font-size:13px;color:#666666">*Si pagaste con el beneficio de deportista de FOU o de alumno/a o egresado/a de la Diplomatura de la UNSAM, además te vamos a pedir tu DNI.</p>
        <p style="margin:24px 0 14px">¡Te esperamos!<br><strong>Equipo FOU</strong></p>
      </td></tr>
      <tr><td><img src="https://capacitaciones.fou.com.ar/mail-img/footer.png" width="600" alt="WhatsApp 11 6893-0497 · Fournier 2353, Boedo · @fou.arg" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
    </table>
  </td></tr></table>
</div>
    `
  },

  "Nutrición Deportiva (21/11)": {
    asunto: "Reservá tu vacante para la capacitación de Nutrición Deportiva (FOU + UNSAM)",
    html: `
<div style="margin:0;padding:0;background:#eeeeee">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eeeeee"><tr><td align="center" style="padding:20px 10px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;background:#ffffff">
      <tr><td><img src="https://capacitaciones.fou.com.ar/mail-img/header-nutricion.png" width="600" alt="FOU · Jornada de Nutrición · Política y Gobierno UNSAM" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
      <tr><td style="padding:28px 32px 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222222">
        <p style="margin:0 0 14px">Hola, {{nombre}}:</p>
        <p style="margin:0 0 14px"><strong>Gracias por interesarte en la Jornada de Nutrición Deportiva en el deporte amateur y el alto rendimiento, organizada por FOU junto a la Diplomatura en Política y Gestión Deportiva de la UNSAM.</strong></p>
        <p style="margin:0 0 14px">Te compartimos el detalle completo de la capacitación:</p>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Datos clave ✍️</h2>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px"><strong>Fecha:</strong> sábado 21 de noviembre de 2026</li>
          <li style="margin:0 0 6px"><strong>Horario:</strong> de 9 a 18 h</li>
          <li style="margin:0 0 6px"><strong>Modalidad:</strong> presencial (cupos limitados)</li>
          <li style="margin:0 0 6px"><strong>Sede:</strong> Fournier 2353, Boedo, CABA</li>
          <li style="margin:0 0 6px"><strong>Certificación:</strong> certificado oficial emitido por la UNSAM</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">🗣️ Disertantes</h2>
        <p style="margin:0 0 14px">La jornada será dictada por profesionales referentes del alto rendimiento deportivo:</p>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px"><strong>Luciano Spena</strong> (nutricionista de la Selección Argentina de Fútbol)</li>
          <li style="margin:0 0 6px"><strong>Fernando Luna</strong> (nutricionista, magíster en Investigación Biomédica por la UNLP)</li>
          <li style="margin:0 0 6px"><strong>Eugenio Viviani Rossi</strong> (médico especialista en nutrición)</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Ejes temáticos 👇</h2>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px">Composición corporal en el deporte de élite.</li>
          <li style="margin:0 0 6px">Cronobiología aplicada al deportista de alto rendimiento.</li>
          <li style="margin:0 0 6px">Buffers en el deporte.</li>
          <li style="margin:0 0 6px">Análisis crítico de la suplementación con magnesio, colágeno y creatina.</li>
          <li style="margin:0 0 6px">Recuperación nutricional basada en métricas.</li>
          <li style="margin:0 0 6px">Perfil bioquímico en atletas.</li>
          <li style="margin:0 0 6px">Y mucho más…</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Cuánto sale la jornada, qué beneficios tengo 💵</h2>
        <p style="margin:0 0 14px"><strong>El valor general de esta jornada es: $160.000</strong><br>Podés abonarlo haciendo clic acá 👇</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 16px"><tr>
          <td bgcolor="#9BEA2E" style="border-radius:8px"><a href="https://mpago.la/2345LKy" target="_blank" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#111111;text-decoration:none;border-radius:8px">¡Quiero pagar la jornada de Nutrición!</a></td>
        </tr></table>
        <p style="margin:0 0 14px"><strong>Si te inscribís antes del 12/10 tenés un 10% off por inscripción temprana.</strong><br>Valor con descuento: <strong>$144.000</strong>. Podés pagar con este descuento acá 👇</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 16px"><tr>
          <td bgcolor="#9BEA2E" style="border-radius:8px"><a href="https://mpago.la/2axZ8JA" target="_blank" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#111111;text-decoration:none;border-radius:8px">¡Quiero pagar con 10% OFF! (vence el 12/10)</a></td>
        </tr></table>
        <p style="margin:0 0 14px"><strong>Si pagás por transferencia tenés un 5% off extra</strong>, acumulable con el beneficio de inscripción temprana. Más abajo tenés los datos para transferir.<br>
        Valor por transferencia: <strong>$152.000</strong><br>
        Con inscripción temprana + transferencia: <strong>$136.000</strong></p>
        <p style="margin:0 0 14px;padding:12px 14px;background:#f3fbe6;border-left:4px solid #9BEA2E"><strong>IMPORTANTE:</strong> si sos deportista de FOU o alumno/a o egresado/a de la Diplomatura en Política y Gestión Deportiva de la UNSAM, accedés a un <strong>20% de descuento</strong> pagando por transferencia (no acumulable con otros beneficios). Valor con este beneficio: <strong>$128.000</strong></p>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Datos para transferir 🏦</h2>
        <p style="margin:0 0 14px">Banco: <strong>Credicoop</strong><br>Alias: <strong>fou.arg</strong></p>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Cómo confirmar tu vacante ✅</h2>
        <p style="margin:0 0 14px">Los cupos son reducidos y el lugar se reserva únicamente con el pago.<br>
        Una vez hecho el pago, envianos el comprobante por <a href="https://api.whatsapp.com/send/?phone=5491168930497&amp;text=%C2%A1Hola%21+Ya+hice+la+reserva+de+mi+vacante.%0AAdjunto+el+pago.%0AMi+nombre+es%3A+%0AMi+mail+es%3A+%0AMe+anot%C3%A9+a+la+jornada+de%3A+Nutrici%C3%B3n" target="_blank" style="color:#1a73e8;font-weight:bold;text-decoration:underline">WhatsApp al 11 6893-0497</a> así te dejamos todo confirmado ☑️</p>
        <p style="margin:0 0 14px;font-size:13px;color:#666666">*Si pagaste con el beneficio de deportista de FOU o de alumno/a o egresado/a de la Diplomatura de la UNSAM, además te vamos a pedir tu DNI.</p>
        <p style="margin:24px 0 14px">¡Te esperamos!<br><strong>Equipo FOU</strong></p>
      </td></tr>
      <tr><td><img src="https://capacitaciones.fou.com.ar/mail-img/footer.png" width="600" alt="WhatsApp 11 6893-0497 · Fournier 2353, Boedo · @fou.arg" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
    </table>
  </td></tr></table>
</div>
    `
  },

  "Gestión de Equipos (2027)": {
    asunto: "Tu consulta por la capacitación de Gestión de Equipos (FOU + UNSAM)",
    html: `
<div style="margin:0;padding:0;background:#eeeeee">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eeeeee"><tr><td align="center" style="padding:20px 10px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;background:#ffffff">
      <tr><td><img src="https://capacitaciones.fou.com.ar/mail-img/header-gestion.png" width="600" alt="FOU · Jornada de Gestión de equipos · Política y Gobierno UNSAM" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
      <tr><td style="padding:28px 32px 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222222">
        <p style="margin:0 0 14px">Hola, {{nombre}}:</p>
        <p style="margin:0 0 14px"><strong>Gracias por interesarte en la Jornada de Gestión de Equipos, organizada por FOU junto a la Diplomatura en Política y Gestión Deportiva de la UNSAM.</strong></p>
        <p style="margin:0 0 14px">Te compartimos el detalle completo de la capacitación:</p>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Datos clave ✍️</h2>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px"><strong>Fecha:</strong> 2027, a confirmar</li>
          <li style="margin:0 0 6px"><strong>Horario:</strong> a confirmar</li>
          <li style="margin:0 0 6px"><strong>Modalidad:</strong> presencial (cupos limitados)</li>
          <li style="margin:0 0 6px"><strong>Sede:</strong> Fournier 2353, Boedo, CABA</li>
          <li style="margin:0 0 6px"><strong>Certificación:</strong> certificado oficial emitido por la UNSAM</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">🗣️ Disertantes</h2>
        <p style="margin:0 0 14px">La jornada será dictada por uno de los grandes referentes del deporte argentino:</p>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px"><strong>Julio Lamas</strong> (ex entrenador de la Selección Argentina de Básquet)</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Ejes temáticos 👇</h2>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px">Liderazgo.</li>
          <li style="margin:0 0 6px">Comunicación.</li>
          <li style="margin:0 0 6px">Organización de roles en los equipos de trabajo.</li>
          <li style="margin:0 0 6px">Resolución de conflictos.</li>
          <li style="margin:0 0 6px">Los vínculos en el alto rendimiento.</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">¿Cuándo me puedo inscribir? 📅</h2>
        <p style="margin:0 0 14px">Esta jornada se hace en 2027 y todavía no abrimos la inscripción. <strong>Cuando confirmemos la fecha, el horario y el valor, te vamos a avisar por este medio para que puedas inscribirte.</strong></p>
        <p style="margin:0 0 14px">Mientras tanto, si tenés alguna consulta, escribinos por <a href="https://api.whatsapp.com/send/?phone=5491168930497&amp;text=%C2%A1Hola%21+Tengo+una+consulta+sobre+la+jornada+de%3A+Gesti%C3%B3n+de+equipos" target="_blank" style="color:#1a73e8;font-weight:bold;text-decoration:underline">WhatsApp al 11 6893-0497</a>.</p>
        <p style="margin:24px 0 14px">¡Te esperamos!<br><strong>Equipo FOU</strong></p>
      </td></tr>
      <tr><td><img src="https://capacitaciones.fou.com.ar/mail-img/footer.png" width="600" alt="WhatsApp 11 6893-0497 · Fournier 2353, Boedo · @fou.arg" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
    </table>
  </td></tr></table>
</div>
    `
  },

  "Preparación Física (2027)": {
    asunto: "Tu consulta por la capacitación de Preparación Física (FOU + UNSAM)",
    html: `
<div style="margin:0;padding:0;background:#eeeeee">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eeeeee"><tr><td align="center" style="padding:20px 10px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;background:#ffffff">
      <tr><td><img src="https://capacitaciones.fou.com.ar/mail-img/header-preparacion.png" width="600" alt="FOU · Jornada de Preparación física · Política y Gobierno UNSAM" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
      <tr><td style="padding:28px 32px 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222222">
        <p style="margin:0 0 14px">Hola, {{nombre}}:</p>
        <p style="margin:0 0 14px"><strong>Gracias por interesarte en la Jornada de Preparación Física, organizada por FOU junto a la Diplomatura en Política y Gestión Deportiva de la UNSAM.</strong></p>
        <p style="margin:0 0 14px">Te compartimos el detalle completo de la capacitación:</p>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Datos clave ✍️</h2>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px"><strong>Fecha:</strong> 2027, a confirmar</li>
          <li style="margin:0 0 6px"><strong>Horario:</strong> a confirmar</li>
          <li style="margin:0 0 6px"><strong>Modalidad:</strong> presencial (cupos limitados)</li>
          <li style="margin:0 0 6px"><strong>Sede:</strong> Fournier 2353, Boedo, CABA</li>
          <li style="margin:0 0 6px"><strong>Certificación:</strong> certificado oficial emitido por la UNSAM</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">🗣️ Disertantes</h2>
        <p style="margin:0 0 14px">La jornada será dictada por profesionales referentes del alto rendimiento deportivo:</p>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px"><strong>Horacio Anselmi</strong> (ex preparador físico de Los Pumas y Las Leonas)</li>
          <li style="margin:0 0 6px"><strong>Esteban Pizzi</strong> (preparador físico de selecciones de AFA)</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">Ejes temáticos 👇</h2>
        <ul style="margin:0 0 14px;padding-left:22px">
          <li style="margin:0 0 6px">Desarrollo físico de los deportistas.</li>
          <li style="margin:0 0 6px">Rol del preparador físico en el deporte amateur y el alto rendimiento.</li>
          <li style="margin:0 0 6px">Progresión de contenidos de acuerdo a las etapas de desarrollo.</li>
          <li style="margin:0 0 6px">La importancia de los gestos técnicos en los trabajos de fuerza y potencia.</li>
        </ul>
        <h2 style="margin:26px 0 10px;font-size:17px;color:#111111">¿Cuándo me puedo inscribir? 📅</h2>
        <p style="margin:0 0 14px">Esta jornada se hace en 2027 y todavía no abrimos la inscripción. <strong>Cuando confirmemos la fecha, el horario y el valor, te vamos a avisar por este medio para que puedas inscribirte.</strong></p>
        <p style="margin:0 0 14px">Mientras tanto, si tenés alguna consulta, escribinos por <a href="https://api.whatsapp.com/send/?phone=5491168930497&amp;text=%C2%A1Hola%21+Tengo+una+consulta+sobre+la+jornada+de%3A+Preparaci%C3%B3n+f%C3%ADsica" target="_blank" style="color:#1a73e8;font-weight:bold;text-decoration:underline">WhatsApp al 11 6893-0497</a>.</p>
        <p style="margin:24px 0 14px">¡Te esperamos!<br><strong>Equipo FOU</strong></p>
      </td></tr>
      <tr><td><img src="https://capacitaciones.fou.com.ar/mail-img/footer.png" width="600" alt="WhatsApp 11 6893-0497 · Fournier 2353, Boedo · @fou.arg" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
    </table>
  </td></tr></table>
</div>
    `
  }
};

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

  // Disparar el mail de confirmación. Si falla, no cortamos el guardado en la
  // Sheet — el dato ya quedó registrado, que es lo más importante.
  try {
    enviarMailConfirmacion(nombre, email, jornada);
  } catch (err) {
    Logger.log('No se pudo enviar el mail de confirmación: ' + err);
  }

  return ContentService.createTextOutput('ok');
}

// El nombre lo escribe la persona en el formulario: se escapa antes de meterlo en el HTML.
function escaparHtml(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function enviarMailConfirmacion(nombre, email, jornada) {
  if (!email) return;

  var contenido = MAILS_POR_JORNADA[jornada];
  if (!contenido) {
    // Jornada sin plantilla cargada todavía: no se envía nada, para no mandar
    // un mail vacío o con el texto de otra jornada por error.
    Logger.log('Sin plantilla de mail para la jornada: ' + jornada);
    return;
  }

  var apiKey = PropertiesService.getScriptProperties().getProperty('ENVIALOSIMPLE_API_KEY');
  if (!apiKey) {
    Logger.log('Falta ENVIALOSIMPLE_API_KEY en Propiedades del script');
    return;
  }

  // Sin nombre queda "Hola:" en vez de "Hola, vos:".
  var html = nombre
    ? contenido.html.replace(/\{\{nombre\}\}/g, escaparHtml(nombre))
    : contenido.html.replace(/, \{\{nombre\}\}/g, '');

  var payload = {
    to: nombre ? (nombre + ' <' + email + '>') : email,
    from: REMITENTE,
    reply_to: REPLY_TO,
    subject: contenido.asunto,
    html: html
  };

  var resp = UrlFetchApp.fetch('https://backend.envialosimple.email/api/v1/mail/send', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  Logger.log('EnvíaloSimple ' + resp.getResponseCode() + ': ' + resp.getContentText());
}

// Ejecutá esta función desde el editor (elegila arriba y tocá Ejecutar) para
// probar que escribe bien y manda el mail, sin pasar por la landing.
// Cambiá la jornada para probar cada uno de los 5 mails.
function probar() {
  doPost({
    parameter: {
      nombre: 'Prueba',
      apellido: 'De Carga',
      email: 'alanalesi1986@gmail.com',
      telefono: '+5491123456789',
      jornada: 'Kinesiología Deportiva (31/10)',
      origen: 'Prueba'
    }
  });
}
