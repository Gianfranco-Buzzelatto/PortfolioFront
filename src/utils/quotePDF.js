const SYM = { USD: '$', ARS: '$', EUR: '€' }
const URGENCY_LABEL = { normal: 'Normal', urgente: 'Urgente (+15%)', 'muy-urgente': 'Muy urgente (+30%)' }

export function calcPricing(q) {
  const urgencyMult   = q.urgency === 'muy-urgente' ? 1.30 : q.urgency === 'urgente' ? 1.15 : 1
  const allFeatures   = [...(q.features || []), ...(q.customFeatures || [])]
  const base          = allFeatures.reduce((s, f) => s + f.price, 0)
  const afterDiscount = base * (1 - (q.discount || 0) / 100)
  const afterMargin   = afterDiscount * (1 + (q.margin || 0) / 100)
  const afterUrgency  = afterMargin * urgencyMult
  const final         = afterUrgency * (q.exchangeRate || 1)
  return { base, final, urgencyMult }
}

export function generatePDF(quote, settings = {}) {
  const sym  = SYM[quote.currency] || '$'
  const cur  = quote.currency || 'USD'
  const rate = quote.exchangeRate || 1
  const { base, final } = calcPricing(quote)
  const allFeatures = [...(quote.features || []), ...(quote.customFeatures || [])]

  const today      = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
  const validUntil = new Date(Date.now() + 15 * 86400000)
    .toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

  const fmtLocal = n => `${sym}${Math.round(n).toLocaleString('es-AR')}`
  const fmtUSD   = n => `USD $${Math.round(n).toLocaleString('es-AR')}`

  const isUSD      = cur === 'USD'
  const finalInUSD = isUSD ? final : final / rate
  const showUSDHint = !isUSD && rate > 1

  const byCategory = allFeatures.reduce((acc, f) => {
    const cat = f.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(f)
    return acc
  }, {})

  const featuresRows = Object.entries(byCategory).map(([cat, items]) => `
    <tr class="cat-row">
      <td colspan="2" class="cat-label">${cat}</td>
    </tr>
    ${items.map(f => `
      <tr>
        <td class="feat-name">${f.name}</td>
        <td class="feat-price">${fmtLocal(f.price * rate)}</td>
      </tr>
    `).join('')}
  `).join('')

  const quoteNumber = String(Date.now()).slice(-6)

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Cotización — ${quote.clientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 0; }
    body {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      background: #fff; color: #1a1a1a; font-size: 13px; line-height: 1.5;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }

    /* ── HEADER FIJO ── */
    .page-header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; }
    .header-main {
      background: #0f0f0f; color: #fff;
      padding: 28px 48px 24px;
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    .accent-bar { height: 4px; background: #e8141e; }

    /* Logo GB.Dev */
    .brand-logo { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; line-height: 1; }
    .brand-logo .gb  { color: #ffffff; }
    .brand-logo .dot { color: #e8141e; }
    .brand-logo .dev { color: #ffffff; }
    .brand-sub {
      font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 5px;
      text-transform: uppercase; letter-spacing: 0.18em;
    }
    .quote-meta-header { text-align: right; }
    .quote-number { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; }
    .quote-date   { font-size: 13px; color: rgba(255,255,255,0.75); margin-top: 4px; font-weight: 500; }
    .quote-validity { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 3px; }

    /* ── FOOTER FIJO ── */
    .page-footer {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #fafafa; border-top: 1px solid #efefef;
      padding: 13px 48px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-brand { font-size: 13px; font-weight: 900; color: #0f0f0f; }
    .footer-brand .dot { color: #e8141e; }
    .footer-contact { font-size: 11px; color: #999; text-align: right; }

    /* ── BODY ── */
    .body {
      padding: 156px 48px 70px; /* top = header height, bottom = footer height */
    }

    /* ── CLIENT + PROJECT ── */
    .client-project {
      display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
      margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid #f0f0f0;
    }
    .info-block .label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.15em; color: #999; margin-bottom: 5px;
    }
    .info-block .value { font-size: 18px; font-weight: 700; color: #0f0f0f; }
    .info-block .sub   { font-size: 12px; color: #666; margin-top: 2px; }

    /* ── SECTION TITLES ── */
    .section-title {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.15em; color: #e8141e;
      margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;
    }

    /* ── FEATURES ── */
    .features-section { margin-bottom: 28px; }
    .features-table { width: 100%; border-collapse: collapse; }
    .cat-row td {
      padding: 10px 12px 6px; font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; color: #bbb; background: #f8f8f8;
    }
    .cat-label { border-top: 1px solid #efefef; }
    .features-table tr:not(.cat-row) td { padding: 9px 12px; border-bottom: 1px solid #f5f5f5; }
    .feat-name  { color: #2a2a2a; }
    .feat-price { text-align: right; font-weight: 600; color: #0f0f0f; white-space: nowrap; }

    /* ── PRICING ── */
    .pricing-section {
      display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
      margin-bottom: 24px; page-break-inside: avoid; break-inside: avoid;
    }
    .breakdown-table { width: 100%; }
    .breakdown-table tr td { padding: 7px 0; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
    .breakdown-table tr:last-child td { border-bottom: none; }
    .breakdown-table td:last-child { text-align: right; font-weight: 600; color: #0f0f0f; }
    .breakdown-label { color: #666; }

    .total-box {
      background: #0f0f0f; border-radius: 12px; padding: 24px;
      display: flex; flex-direction: column; justify-content: center;
      align-items: center; text-align: center;
    }
    .total-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.15em; color: rgba(255,255,255,0.35); margin-bottom: 8px;
    }
    .total-amount { font-size: 32px; font-weight: 900; color: #fff; letter-spacing: -1px; line-height: 1; }
    .total-currency { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 6px; font-weight: 600; }
    .total-usd-hint {
      margin-top: 10px; padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 11px; color: rgba(255,255,255,0.4);
    }
    .total-usd-hint strong { color: rgba(255,255,255,0.7); font-weight: 600; }

    /* ── META ── */
    .meta-section {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 1px; background: #efefef; border-radius: 10px;
      overflow: hidden; margin-bottom: 24px;
      page-break-inside: avoid; break-inside: avoid;
    }
    .meta-item { background: #fff; padding: 14px; text-align: center; }
    .meta-value { font-size: 20px; font-weight: 900; color: #0f0f0f; }
    .meta-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 3px; }

    /* ── TERMS ── */
    .terms-section { margin-bottom: 28px; page-break-inside: avoid; break-inside: avoid; }
    .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .term-item { background: #f8f8f8; border-radius: 8px; padding: 14px 16px; }
    .term-title { font-size: 11px; font-weight: 700; color: #333; margin-bottom: 4px; }
    .term-text  { font-size: 11px; color: #777; line-height: 1.5; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- HEADER FIJO -->
  <div class="page-header">
    <div class="header-main">
      <div>
        <div class="brand-logo">
          <span class="gb">GB</span><span class="dot">.</span><span class="dev">Dev</span>
        </div>
        <div class="brand-sub">${settings.title || 'Desarrollador Web Full Stack'}</div>
      </div>
      <div class="quote-meta-header">
        <div class="quote-number">Cotización #${quoteNumber}</div>
        <div class="quote-date">${today}</div>
        <div class="quote-validity">Válida hasta el ${validUntil}</div>
      </div>
    </div>
    <div class="accent-bar"></div>
  </div>

  <!-- FOOTER FIJO -->
  <div class="page-footer">
    <div class="footer-brand">GB<span class="dot">.</span>Dev${settings.name ? ` — ${settings.name}` : ''}</div>
    <div class="footer-contact">
      ${settings.email || ''}${settings.location ? `<br>${settings.location}` : ''}
    </div>
  </div>

  <!-- CONTENIDO -->
  <div class="body">

    <div class="client-project">
      <div class="info-block">
        <div class="label">Cliente</div>
        <div class="value">${quote.clientName}</div>
        <div class="sub">${quote.email}</div>
        ${quote.whatsapp ? `<div class="sub">${quote.whatsapp}</div>` : ''}
      </div>
      <div class="info-block">
        <div class="label">Proyecto</div>
        <div class="value">${quote.projectName || quote.projectType}</div>
        <div class="sub">${quote.projectType}</div>
      </div>
    </div>

    ${allFeatures.length > 0 ? `
    <div class="features-section">
      <div class="section-title">Funcionalidades incluidas</div>
      <table class="features-table">${featuresRows}</table>
    </div>` : ''}

    <div class="pricing-section">
      <div>
        <div class="section-title">Desglose del precio</div>
        <table class="breakdown-table">
          <tr>
            <td class="breakdown-label">Precio base</td>
            <td>${fmtLocal(base * rate)}</td>
          </tr>
          ${quote.discount > 0 ? `<tr>
            <td class="breakdown-label">Descuento (${quote.discount}%)</td>
            <td>− ${fmtLocal(base * rate * quote.discount / 100)}</td>
          </tr>` : ''}
          ${quote.margin > 0 ? `<tr>
            <td class="breakdown-label">Margen adicional (${quote.margin}%)</td>
            <td>+ ${fmtLocal(base * (1 - (quote.discount||0)/100) * rate * quote.margin / 100)}</td>
          </tr>` : ''}
          ${quote.urgency !== 'normal' ? `<tr>
            <td class="breakdown-label">${URGENCY_LABEL[quote.urgency]}</td>
            <td>incluido</td>
          </tr>` : ''}
          ${showUSDHint ? `<tr>
            <td class="breakdown-label" style="font-size:11px;color:#bbb;">Tipo de cambio</td>
            <td style="font-size:11px;color:#bbb;">1 USD = ${sym}${Math.round(rate).toLocaleString('es-AR')}</td>
          </tr>` : ''}
          <tr style="font-weight:700;font-size:14px;">
            <td style="padding-top:12px;color:#0f0f0f;">Total (${cur})</td>
            <td style="padding-top:12px;color:#e8141e;">${fmtLocal(final)}</td>
          </tr>
        </table>
      </div>

      <div class="total-box">
        <div class="total-label">Total estimado</div>
        <div class="total-amount">${fmtLocal(final)}</div>
        <div class="total-currency">${cur}</div>
        ${showUSDHint ? `
        <div class="total-usd-hint">≈ <strong>${fmtUSD(finalInUSD)}</strong></div>` : ''}
      </div>
    </div>

    <div class="meta-section">
      <div class="meta-item">
        <div class="meta-value">${quote.deadline || 30} días</div>
        <div class="meta-label">Entrega estimada</div>
      </div>
      <div class="meta-item">
        <div class="meta-value">${quote.revisions || 3}</div>
        <div class="meta-label">Revisiones incluidas</div>
      </div>
      <div class="meta-item">
        <div class="meta-value">${allFeatures.length}</div>
        <div class="meta-label">Funcionalidades</div>
      </div>
    </div>

    <div class="terms-section">
      <div class="section-title">Términos y condiciones</div>
      <div class="terms-grid">
        <div class="term-item">
          <div class="term-title">💳 Forma de pago</div>
          <div class="term-text">50% al inicio del proyecto y 50% contra entrega final.</div>
        </div>
        <div class="term-item">
          <div class="term-title">📋 Alcance</div>
          <div class="term-text">Cualquier funcionalidad fuera del listado anterior generará un presupuesto adicional.</div>
        </div>
        <div class="term-item">
          <div class="term-title">⏱ Validez</div>
          <div class="term-text">Esta cotización es válida por 15 días desde la fecha de emisión.</div>
        </div>
        <div class="term-item">
          <div class="term-title">🔄 Revisiones</div>
          <div class="term-text">Se incluyen ${quote.revisions || 3} rondas de revisión. Las adicionales se presupuestan por separado.</div>
        </div>
      </div>
    </div>

    ${quote.description ? `
    <div style="margin-bottom:28px;page-break-inside:avoid;break-inside:avoid;">
      <div class="section-title">Descripción del proyecto</div>
      <p style="color:#555;line-height:1.7;font-size:13px;">${quote.description}</p>
    </div>` : ''}

  </div>

<script>window.onload = () => { window.focus(); window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
}
