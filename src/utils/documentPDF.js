// ─────────────────────────────────────────────────────────────────────────────
// documentPDF.js — Generador de documentos para el flujo de clientes
// Mismo estilo visual que quotePDF.js (branding GB.Dev)
// ─────────────────────────────────────────────────────────────────────────────

const today = () =>
  new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

const docNumber = () => String(Date.now()).slice(-6)

// ── HTML base compartido por todos los documentos ────────────────────────────
function baseHTML({ title, clientName, docLabel, docNum, content, settings = {} }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${docLabel} — ${clientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 0; }
    body {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      background: #fff; color: #1a1a1a;
      font-size: 13px; line-height: 1.6;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    table.layout { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .header-main {
      background: #0f0f0f; color: #fff;
      padding: 26px 48px 22px;
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    .accent-bar { height: 4px; background: #e8141e; }
    .brand-logo { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; line-height: 1; }
    .brand-logo .gb { color: #fff; }
    .brand-logo .dot { color: #e8141e; }
    .brand-logo .dev { color: #fff; }
    .brand-sub { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 5px; text-transform: uppercase; letter-spacing: 0.18em; }
    .doc-meta-header { text-align: right; }
    .doc-label { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; }
    .doc-date  { font-size: 13px; color: rgba(255,255,255,0.75); margin-top: 4px; font-weight: 500; }
    .doc-num   { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 3px; }
    .footer-bar {
      background: #fafafa; border-top: 1px solid #efefef;
      padding: 12px 48px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-brand { font-size: 13px; font-weight: 900; color: #0f0f0f; }
    .footer-brand .dot { color: #e8141e; }
    .footer-contact { font-size: 11px; color: #999; text-align: right; }
    .body-cell { padding: 36px 48px; }
    .section-title {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.15em; color: #e8141e;
      margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;
    }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid #f0f0f0; }
    .info-block .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #999; margin-bottom: 5px; }
    .info-block .value { font-size: 16px; font-weight: 700; color: #0f0f0f; }
    .info-block .sub   { font-size: 12px; color: #666; margin-top: 2px; }
    .content-section { margin-bottom: 24px; page-break-inside: avoid; break-inside: avoid; }
    .item-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 9px 12px; border-bottom: 1px solid #f5f5f5; font-size: 12px; gap: 16px; }
    .item-row:last-child { border-bottom: none; }
    .item-name { color: #2a2a2a; flex: 1; }
    .item-status { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; white-space: nowrap; }
    .status-ok  { background: #e8f5e9; color: #2e7d32; }
    .status-out { background: #fce4ec; color: #c62828; }
    .status-pending { background: #fff3e0; color: #e65100; }
    .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .term-item { background: #f8f8f8; border-radius: 8px; padding: 14px 16px; }
    .term-title { font-size: 11px; font-weight: 700; color: #333; margin-bottom: 4px; }
    .term-text  { font-size: 11px; color: #777; line-height: 1.5; }
    .highlight-box { background: #0f0f0f; border-radius: 12px; padding: 20px 24px; color: #fff; margin-bottom: 24px; }
    .highlight-box .hl-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 6px; }
    .highlight-box .hl-value { font-size: 24px; font-weight: 900; color: #fff; }
    .highlight-box .hl-sub   { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 4px; }
    .signature-row { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
    .sig-block { border-top: 1px solid #ddd; padding-top: 10px; }
    .sig-block .sig-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; }
    .sig-block .sig-name  { font-size: 12px; font-weight: 600; color: #333; margin-top: 4px; }
    p { font-size: 12px; color: #555; line-height: 1.7; margin-bottom: 12px; }
    ul { margin: 8px 0 16px 20px; }
    ul li { font-size: 12px; color: #555; line-height: 1.7; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
<table class="layout">
  <thead><tr><td>
    <div class="header-main">
      <div>
        <div class="brand-logo"><span class="gb">GB</span><span class="dot">.</span><span class="dev">Dev</span></div>
        <div class="brand-sub">${settings.title || 'Desarrollador Web Full Stack'}</div>
      </div>
      <div class="doc-meta-header">
        <div class="doc-label">${docLabel}</div>
        <div class="doc-date">${today()}</div>
        <div class="doc-num">#${docNum}</div>
      </div>
    </div>
    <div class="accent-bar"></div>
  </td></tr></thead>
  <tfoot><tr><td>
    <div class="footer-bar">
      <div class="footer-brand">GB<span class="dot">.</span>Dev${settings.name ? ` — ${settings.name}` : ''}</div>
      <div class="footer-contact">${settings.email || ''}${settings.location ? `<br>${settings.location}` : ''}</div>
    </div>
  </td></tr></tfoot>
  <tbody><tr><td class="body-cell">
    <div class="info-grid">
      <div class="info-block">
        <div class="label">Cliente</div>
        <div class="value">${clientName}</div>
      </div>
      <div class="info-block">
        <div class="label">Documento</div>
        <div class="value">${docLabel}</div>
        <div class="sub">${today()}</div>
      </div>
    </div>
    ${content}
    <div class="signature-row">
      <div class="sig-block">
        <div class="sig-label">Firma del cliente</div>
        <div class="sig-name">${clientName}</div>
      </div>
      <div class="sig-block">
        <div class="sig-label">Firma del desarrollador</div>
        <div class="sig-name">${settings.name || 'GB.Dev'}</div>
      </div>
    </div>
  </td></tr></tbody>
</table>
<script>window.onload = () => { window.focus(); window.print(); }</script>
</body></html>`
}

function openDoc(html) {
  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
}

// ── 1. Brief de descubrimiento ───────────────────────────────────────────────
export function generateBriefPDF(quote, settings = {}) {
  const content = `
    <div class="content-section">
      <div class="section-title">Datos del proyecto</div>
      ${[
        ['Tipo de proyecto', quote.projectType || '—'],
        ['Presupuesto del cliente', quote.budget || 'A definir'],
        ['Plataforma / tecnología preferida', quote.tech || 'A definir'],
        ['Plazo deseado', quote.deadline ? `${quote.deadline} días` : 'A definir'],
      ].map(([k, v]) => `
        <div class="item-row">
          <span class="item-name" style="font-weight:600;color:#333;">${k}</span>
          <span style="color:#555;">${v}</span>
        </div>`).join('')}
    </div>
    <div class="content-section">
      <div class="section-title">Descripción del proyecto</div>
      <p>${quote.description || 'Sin descripción provista por el cliente.'}</p>
    </div>
    <div class="content-section">
      <div class="section-title">Preguntas clave para la reunión de descubrimiento</div>
      ${[
        '¿Cuál es el objetivo principal del sitio/app?',
        '¿Quién es el público objetivo?',
        '¿Tenés referentes visuales o sitios que te gusten?',
        '¿Ya tenés dominio y hosting, o lo necesitás?',
        '¿Quién va a gestionar el contenido después de la entrega?',
        '¿Hay integraciones con sistemas existentes (CRM, ERP, etc.)?',
        '¿Cuáles son los KPIs de éxito del proyecto?',
      ].map(q => `<div class="item-row"><span class="item-name">→ ${q}</span></div>`).join('')}
    </div>
    <div class="content-section">
      <div class="section-title">Notas de la consulta inicial</div>
      <p>${quote.adminNotes || quote.description || 'Sin notas aún.'}</p>
    </div>
  `
  openDoc(baseHTML({ docLabel: 'Brief de descubrimiento', clientName: quote.clientName, docNum: docNumber(), content, settings }))
}

// ── 2. Acuerdo de trabajo ────────────────────────────────────────────────────
export function generateAgreementPDF(quote, settings = {}) {
  const sym = quote.currency === 'EUR' ? '€' : '$'
  const total = quote.finalPrice || 0
  const pay1 = Math.round(total * 0.4)
  const pay2 = Math.round(total * 0.3)
  const pay3 = Math.round(total * 0.3)
  const featuresList = (quote.features || []).map(f => `<li>${f.name}</li>`).join('')
  const content = `
    <div class="highlight-box">
      <div class="hl-label">Valor total del proyecto</div>
      <div class="hl-value">${sym}${total.toLocaleString('es-AR')} ${quote.currency || 'USD'}</div>
      <div class="hl-sub">40% al arrancar (${sym}${pay1.toLocaleString('es-AR')}) · 30% a mitad (${sym}${pay2.toLocaleString('es-AR')}) · 30% al entregar (${sym}${pay3.toLocaleString('es-AR')})</div>
    </div>
    <div class="content-section">
      <div class="section-title">Alcance del proyecto</div>
      <p><strong>Proyecto:</strong> ${quote.projectName || quote.projectType}</p>
      <p><strong>Tipo:</strong> ${quote.projectType}</p>
      <p><strong>Plazo estimado de entrega:</strong> ${quote.deadline || 30} días hábiles desde el pago del adelanto.</p>
      <p><strong>Rondas de revisión incluidas:</strong> ${quote.revisions || 3}. Las revisiones adicionales se presupuestan por separado.</p>
    </div>
    ${featuresList ? `
    <div class="content-section">
      <div class="section-title">Funcionalidades incluidas</div>
      <ul>${featuresList}</ul>
    </div>` : ''}
    <div class="content-section">
      <div class="section-title">Términos y condiciones</div>
      <div class="terms-grid">
        <div class="term-item">
          <div class="term-title">Forma de pago</div>
          <div class="term-text">40% al inicio del proyecto (${sym}${pay1.toLocaleString('es-AR')}), 30% a mitad de proyecto (${sym}${pay2.toLocaleString('es-AR')}) y 30% contra entrega final (${sym}${pay3.toLocaleString('es-AR')}).</div>
        </div>
        <div class="term-item">
          <div class="term-title">Alcance</div>
          <div class="term-text">Cualquier funcionalidad fuera de las detalladas generará un presupuesto adicional antes de ser desarrollada.</div>
        </div>
        <div class="term-item">
          <div class="term-title">Revisiones</div>
          <div class="term-text">Se incluyen ${quote.revisions || 3} rondas de revisión. Cambios estructurales fuera de alcance se presupuestan aparte.</div>
        </div>
        <div class="term-item">
          <div class="term-title">Propiedad intelectual</div>
          <div class="term-text">El cliente recibe todos los derechos del código y los assets una vez abonado el 100% del proyecto.</div>
        </div>
        <div class="term-item">
          <div class="term-title">Confidencialidad</div>
          <div class="term-text">Toda información provista por el cliente se tratará con estricta confidencialidad.</div>
        </div>
        <div class="term-item">
          <div class="term-title">Demoras del cliente</div>
          <div class="term-text">Si el cliente no provee materiales o feedback en tiempo y forma, los plazos se recalculan desde la recepción.</div>
        </div>
      </div>
    </div>
  `
  openDoc(baseHTML({ docLabel: 'Acuerdo de trabajo', clientName: quote.clientName, docNum: docNumber(), content, settings }))
}

// ── 3. Acta de revisiones ────────────────────────────────────────────────────
export function generateRevisionsPDF(client, revisions = [], settings = {}) {
  const approved  = revisions.filter(r => r.status === 'aprobado')
  const outscope  = revisions.filter(r => r.status === 'fuera-de-alcance')
  const pending   = revisions.filter(r => r.status === 'pendiente')

  const statusMap = {
    'aprobado':         ['status-ok',      'Aprobado'],
    'fuera-de-alcance': ['status-out',     'Fuera de alcance'],
    'pendiente':        ['status-pending', 'Pendiente'],
  }

  const renderRows = (list) => list.map(r => `
    <div class="item-row">
      <span class="item-name">${r.description}</span>
      <span class="item-status ${statusMap[r.status]?.[0] || 'status-pending'}">${statusMap[r.status]?.[1] || r.status}</span>
    </div>`).join('')

  const content = `
    <div class="highlight-box">
      <div class="hl-label">Proyecto</div>
      <div class="hl-value" style="font-size:18px;">${client.projectType}</div>
      <div class="hl-sub">Revisiones usadas: ${client.revisionsUsed || revisions.length} de ${client.revisions || '—'} incluidas · URL staging: ${client.stagingUrl || 'pendiente'}</div>
    </div>
    ${approved.length > 0 ? `
    <div class="content-section">
      <div class="section-title">Cambios aprobados (${approved.length})</div>
      ${renderRows(approved)}
    </div>` : ''}
    ${outscope.length > 0 ? `
    <div class="content-section">
      <div class="section-title">Fuera de alcance — requieren presupuesto adicional (${outscope.length})</div>
      ${renderRows(outscope)}
    </div>` : ''}
    ${pending.length > 0 ? `
    <div class="content-section">
      <div class="section-title">Pendientes de resolución (${pending.length})</div>
      ${renderRows(pending)}
    </div>` : ''}
    ${revisions.length === 0 ? `
    <div class="content-section">
      <p>No se han registrado revisiones aún. Este documento se actualizará con los cambios solicitados por el cliente.</p>
    </div>` : ''}
    <div class="content-section">
      <div class="section-title">Aclaración sobre alcance</div>
      <p>Los cambios marcados como "Fuera de alcance" no están incluidos en el precio original del proyecto. Antes de implementarlos, se enviará un presupuesto adicional para aprobación del cliente.</p>
    </div>
  `
  openDoc(baseHTML({ docLabel: 'Acta de revisiones', clientName: client.clientName, docNum: docNumber(), content, settings }))
}

// ── 4. Acta de entrega ───────────────────────────────────────────────────────
export function generateDeliveryPDF(client, settings = {}) {
  const sym = client.currency === 'EUR' ? '€' : '$'
  const total = client.finalPrice || 0
  const half = Math.round(total / 2)

  const content = `
    <div class="highlight-box">
      <div class="hl-label">Proyecto entregado en producción</div>
      <div class="hl-value" style="font-size:18px;">${client.productionUrl || 'URL a confirmar'}</div>
      <div class="hl-sub">Tipo: ${client.projectType} · Pago final pendiente: ${sym}${half.toLocaleString('es-AR')} ${client.currency || 'USD'}</div>
    </div>
    <div class="content-section">
      <div class="section-title">Detalles de la entrega</div>
      ${[
        ['URL en producción', client.productionUrl || 'A completar'],
        ['Fecha de entrega', today()],
        ['Tipo de proyecto', client.projectType],
        ['Tecnologías utilizadas', client.tech || 'A completar'],
      ].map(([k, v]) => `
        <div class="item-row">
          <span class="item-name" style="font-weight:600;color:#333;">${k}</span>
          <span style="color:#555;">${v}</span>
        </div>`).join('')}
    </div>
    <div class="content-section">
      <div class="section-title">Accesos y credenciales entregados</div>
      <p>Al firmar este documento, el cliente confirma haber recibido todos los accesos necesarios para operar el proyecto:</p>
      <ul>
        <li>Acceso al panel de administración / CMS</li>
        <li>Credenciales de hosting / servidor</li>
        <li>Acceso al repositorio de código (si aplica)</li>
        <li>Credenciales de servicios integrados (pagos, email, analytics)</li>
      </ul>
    </div>
    <div class="content-section">
      <div class="section-title">Condiciones de pago final</div>
      <p>El cliente confirma su conformidad con el proyecto entregado y abonará el saldo restante de <strong>${sym}${half.toLocaleString('es-AR')} ${client.currency || 'USD'}</strong> al recibir este documento.</p>
    </div>
    <div class="content-section">
      <div class="section-title">Garantía post-entrega</div>
      <p>Se incluye una garantía de 15 días para corrección de bugs funcionales. No incluye nuevas funcionalidades ni cambios de diseño.</p>
    </div>
  `
  openDoc(baseHTML({ docLabel: 'Acta de entrega', clientName: client.clientName, docNum: docNumber(), content, settings }))
}

// ── 5. Guía de uso / capacitación ───────────────────────────────────────────
export function generateUserGuidePDF(client, settings = {}) {
  const content = `
    <div class="content-section">
      <div class="section-title">Tu nuevo sitio / aplicación</div>
      <p>Este documento es una guía de referencia rápida para gestionar tu proyecto. Guardalo en un lugar seguro.</p>
      ${[
        ['URL del proyecto', client.productionUrl || 'A completar'],
        ['Tipo', client.projectType],
        ['Panel de administración', client.adminUrl || 'Ver sección de accesos'],
      ].map(([k, v]) => `
        <div class="item-row">
          <span class="item-name" style="font-weight:600;color:#333;">${k}</span>
          <span style="color:#555;">${v}</span>
        </div>`).join('')}
    </div>
    <div class="content-section">
      <div class="section-title">Tareas de mantenimiento recomendadas</div>
      ${[
        ['Semanal',  'Revisar que el sitio cargue correctamente. Moderar comentarios/mensajes si aplica.'],
        ['Mensual',  'Actualizar contenido (textos, precios, imágenes). Revisar formularios de contacto.'],
        ['Trimestral', 'Actualizar plugins/dependencias si usás CMS. Revisar backups.'],
        ['Anual',    'Renovar dominio y certificado SSL. Revisar analíticas y métricas.'],
      ].map(([freq, desc]) => `
        <div class="item-row">
          <span class="item-name" style="font-weight:600;min-width:100px;">${freq}</span>
          <span style="color:#555;">${desc}</span>
        </div>`).join('')}
    </div>
    <div class="content-section">
      <div class="section-title">Ante cualquier problema</div>
      <p>Para reportar errores o solicitar soporte, contactame por los siguientes medios:</p>
      <div class="terms-grid">
        <div class="term-item">
          <div class="term-title">Email</div>
          <div class="term-text">${settings.email || 'A completar'}</div>
        </div>
        <div class="term-item">
          <div class="term-title">Tiempo de respuesta</div>
          <div class="term-text">Bugs críticos: 24hs · Consultas generales: 48-72hs hábiles</div>
        </div>
      </div>
    </div>
    <div class="content-section">
      <div class="section-title">¿Necesitás algo más adelante?</div>
      <p>Si en el futuro necesitás nuevas funcionalidades, actualizaciones o mantenimiento mensual, no dudes en contactarme. Tengo planes de mantenimiento adaptados a cada proyecto.</p>
    </div>
  `
  openDoc(baseHTML({ docLabel: 'Guía de uso', clientName: client.clientName, docNum: docNumber(), content, settings }))
}

// ── 6. Propuesta de mantenimiento ────────────────────────────────────────────
export function generateMaintenancePDF(client, plan = {}, settings = {}) {
  const sym = client.currency === 'EUR' ? '€' : '$'
  const price = plan.price || 0

  const includes = plan.includes || [
    'Monitoreo de disponibilidad (uptime)',
    'Corrección de bugs funcionales',
    'Actualización de dependencias y plugins',
    'Backup mensual del sitio y base de datos',
    'Soporte por email (tiempo de respuesta: 48hs hábiles)',
    '1 hora de desarrollo incluida (cambios menores)',
  ]

  const content = `
    <div class="highlight-box">
      <div class="hl-label">Plan de mantenimiento mensual</div>
      <div class="hl-value">${sym}${price.toLocaleString('es-AR')} ${client.currency || 'USD'} / mes</div>
      <div class="hl-sub">Proyecto: ${client.projectType} · ${client.productionUrl || ''}</div>
    </div>
    <div class="content-section">
      <div class="section-title">¿Qué incluye este plan?</div>
      ${includes.map(item => `
        <div class="item-row">
          <span class="item-name">✓ ${item}</span>
        </div>`).join('')}
    </div>
    <div class="content-section">
      <div class="section-title">¿Qué NO incluye?</div>
      ${[
        'Desarrollo de nuevas funcionalidades (se presupuestan por separado)',
        'Rediseño o cambios estructurales del proyecto',
        'Migración a otro proveedor de hosting',
      ].map(item => `
        <div class="item-row">
          <span class="item-name" style="color:#999;">✗ ${item}</span>
        </div>`).join('')}
    </div>
    <div class="content-section">
      <div class="section-title">Condiciones</div>
      <div class="terms-grid">
        <div class="term-item">
          <div class="term-title">Facturación</div>
          <div class="term-text">Mensual, por adelantado. El plan comienza el día de la firma.</div>
        </div>
        <div class="term-item">
          <div class="term-title">Cancelación</div>
          <div class="term-text">Podés cancelar con 15 días de anticipación, sin penalidades.</div>
        </div>
        <div class="term-item">
          <div class="term-title">Ajuste de precio</div>
          <div class="term-text">El precio se puede ajustar cada 6 meses con 30 días de previo aviso.</div>
        </div>
        <div class="term-item">
          <div class="term-title">Horas adicionales</div>
          <div class="term-text">El tiempo de desarrollo extra a las horas incluidas se factura por hora separada.</div>
        </div>
      </div>
    </div>
  `
  openDoc(baseHTML({ docLabel: 'Propuesta de mantenimiento', clientName: client.clientName, docNum: docNumber(), content, settings }))
}
