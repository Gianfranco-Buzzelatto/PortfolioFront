function showEmailModal(subject, body, stage) {
  const existing = document.getElementById('gb-email-modal')
  if (existing) existing.remove()

  const STAGE_COLORS = {
    cotizacion:    '#EF9F27',
    inicio:        '#639922',
    revision:      '#D4537E',
    entrega:       '#1D9E75',
    mantenimiento: '#7F77DD',
  }
  const color = STAGE_COLORS[stage] || '#e8141e'
  const safeSubject = String(subject).replace(/</g, '')
  const safeBody = String(body)

  const modal = document.createElement('div')
  modal.id = 'gb-email-modal'
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;
    display:flex;align-items:center;justify-content:center;padding:20px;
    font-family:'Inter','Helvetica Neue',sans-serif;
  `
  modal.innerHTML = `
    <div style="background:#1a1a1a;border:1px solid #333;border-radius:16px;width:100%;max-width:620px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:18px 22px;border-bottom:1px solid #333;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:11px;color:${color};text-transform:uppercase;letter-spacing:0.1em;font-weight:700;margin-bottom:3px;">Listo para copiar</div>
          <div style="font-size:15px;font-weight:700;color:#fff;">Email para el cliente</div>
        </div>
        <button id="gb-email-close" style="background:none;border:none;color:#666;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:6px;">×</button>
      </div>
      <div style="padding:18px 22px;flex:1;overflow-y:auto;">
        <div style="margin-bottom:14px;">
          <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Asunto</div>
          <div id="gb-email-subject" style="background:#111;border:1px solid #333;border-radius:8px;padding:10px 14px;font-size:13px;color:#e0e0e0;font-weight:600;">${safeSubject}</div>
        </div>
        <div>
          <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Cuerpo del email</div>
          <textarea id="gb-email-body" style="width:100%;background:#111;border:1px solid #333;border-radius:8px;padding:14px;font-size:13px;color:#d0d0d0;line-height:1.7;resize:vertical;min-height:260px;font-family:inherit;">${safeBody}</textarea>
        </div>
      </div>
      <div style="padding:14px 22px;border-top:1px solid #333;display:flex;gap:10px;justify-content:flex-end;">
        <button id="gb-email-copy-all" style="background:${color};border:none;border-radius:8px;padding:9px 20px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;">Copiar todo</button>
        <button id="gb-email-copy-body" style="background:none;border:1px solid #444;border-radius:8px;padding:9px 16px;color:#aaa;font-size:13px;cursor:pointer;">Solo cuerpo</button>
      </div>
    </div>
  `
  document.body.appendChild(modal)

  document.getElementById('gb-email-close').onclick = () => modal.remove()
  modal.onclick = (e) => { if (e.target === modal) modal.remove() }

  document.getElementById('gb-email-copy-all').onclick = () => {
    const text = `Asunto: ${subject}\n\n${document.getElementById('gb-email-body').value}`
    navigator.clipboard.writeText(text).then(() => {
      document.getElementById('gb-email-copy-all').textContent = '¡Copiado!'
      setTimeout(() => { document.getElementById('gb-email-copy-all').textContent = 'Copiar todo' }, 2000)
    })
  }
  document.getElementById('gb-email-copy-body').onclick = () => {
    navigator.clipboard.writeText(document.getElementById('gb-email-body').value).then(() => {
      document.getElementById('gb-email-copy-body').textContent = '¡Copiado!'
      setTimeout(() => { document.getElementById('gb-email-copy-body').textContent = 'Solo cuerpo' }, 2000)
    })
  }
}

const firstName = (name = '') => String(name).trim().split(/\s+/)[0] || 'hola'
const brand = (settings = {}) => settings.name || 'GB.Dev'
const money = (n, currency = 'USD') => {
  const sym = currency === 'EUR' ? '€' : '$'
  return `${sym}${Math.round(n || 0).toLocaleString('es-AR')} ${currency}`
}

export function generateQuoteEmail(quote, settings = {}) {
  const name = firstName(quote.clientName)
  showEmailModal(
    `Cotización para tu proyecto: ${quote.projectName || quote.projectType}`,
    `Hola ${name},

Gracias por la consulta. Te armé la cotización de ${quote.projectType} con tres opciones para que compares, y te marqué la que yo tomaría en tu lugar.

Resumen de la recomendada:
- Inversión: ${money(quote.finalPrice, quote.currency)}
- Plazo: ${quote.deadline || 30} días
- Revisiones incluidas: ${quote.revisions || 3}

El desarrollo se paga 40% al arrancar, 30% a mitad de proyecto y 30% contra entrega. La cotización vale 15 días.

Cualquier duda, respondeme este mail o por WhatsApp y lo vemos.

Saludos,
${brand(settings)}`,
    'cotizacion'
  )
}

export function generateStartEmail(client, settings = {}) {
  const name = firstName(client.clientName)
  const pay = money((client.finalPrice || 0) * 0.4, client.currency)
  showEmailModal(
    `Arrancamos — ${client.projectType}`,
    `Hola ${name},

Confirmado: recibí el 40% inicial (${pay}) y el proyecto arranca oficialmente.

Qué sigue:
- Armo el entorno y te pido logo, textos y accesos si hace falta
- Te mando un update semanal corto
- Plazo estimado: ${client.deadline || 30} días hábiles

Si tenés material listo (fotos, textos, referencias), mandalo cuando puedas. Cualquier consulta, escribime.

Saludos,
${brand(settings)}`,
    'inicio'
  )
}

export function generateRevisionEmail(client, settings = {}) {
  const name = firstName(client.clientName)
  const used = client.revisionsUsed || 1
  const total = client.revisions || 3
  showEmailModal(
    `Listo para revisar — ${client.projectType}`,
    `Hola ${name},

Ya está la versión para que mires. Entrá acá:

${client.stagingUrl || '[URL de staging]'}

Cómo dar feedback (así avanzamos rápido):
- Qué cambiar, en qué pantalla
- Si podés, una captura

Vas ${used} de ${total} rondas incluidas. Si podés responder en 5 días hábiles, mantenemos el calendario.

Saludos,
${brand(settings)}`,
    'revision'
  )
}

export function generateDeliveryEmail(client, settings = {}) {
  const name = firstName(client.clientName)
  const rest = money((client.finalPrice || 0) * 0.3, client.currency)
  showEmailModal(
    `Tu proyecto está en vivo — ${client.projectType}`,
    `Hola ${name},

El proyecto ya está publicado:

${client.productionUrl || '[URL de producción]'}

Te adjunto el acta de entrega y la guía de uso. El 30% contra entrega son ${rest}.

Hay 15 días de garantía para bugs de lo entregado. Si querés que yo me encargue de hosting, backups y cambios chicos, te paso el plan de mantenimiento mensual.

Felicitaciones,
${brand(settings)}`,
    'entrega'
  )
}

export function generateMaintenanceEmail(client, plan = {}, settings = {}) {
  const name = firstName(client.clientName)
  showEmailModal(
    `Plan de mantenimiento para tu ${client.projectType}`,
    `Hola ${name},

El sitio ya está en el aire. Para que no se corte (hosting, backups, monitoreo y cambios chicos) te ofrezco un plan mensual de ${money(plan.price, client.currency)}/mes.

Incluye lo que acordemos en la propuesta. No hay que decidirlo ya: si te cierra, arrancamos el mes que viene.

Saludos,
${brand(settings)}`,
    'mantenimiento'
  )
}
