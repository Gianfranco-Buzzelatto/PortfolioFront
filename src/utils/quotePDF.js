import { buildRecommendation } from '../data/quoteRecommendation'
import { CARE_PLANS } from '../data/quoteCatalog2026'

const SYM = { USD: 'USD $', ARS: 'ARS $', EUR: '€' }
const SYM_SHORT = { USD: '$', ARS: '$', EUR: '€' }
const URGENCY_LABEL = { normal: 'Normal', urgente: 'Urgente (+15%)', 'muy-urgente': 'Muy urgente (+30%)' }

export function calcPricing(q) {
  const urgencyMult   = q.urgency === 'muy-urgente' ? 1.30 : q.urgency === 'urgente' ? 1.15 : 1
  const featureSum    = (q.features || []).reduce((s, f) => s + (f.price || 0), 0)
  const customSum     = (q.customFeatures || []).reduce((s, f) => s + (f.price || 0), 0)
  const base          = q.fixedPrice != null ? q.fixedPrice + featureSum + customSum : featureSum + customSum
  const afterDiscount = base * (1 - (q.discount || 0) / 100)
  const afterMargin   = afterDiscount * (1 + (q.margin || 0) / 100)
  const afterUrgency  = afterMargin * urgencyMult
  const final         = afterUrgency * (q.exchangeRate || 1)
  return { base, final, urgencyMult }
}

const planItems = (p) => [...(p.features || []), ...(p.customFeatures || [])]

const hasItem = (p, name) => planItems(p).some((f) => f.name === name)

export function generatePDF(quote, settings = {}) {
  const cur      = quote.currency || 'USD'
  const rate     = quote.exchangeRate || 1
  const symFull  = SYM[cur] || 'USD $'
  const symShort = SYM_SHORT[cur] || '$'
  const isUSD    = cur === 'USD'

  const { base, final } = calcPricing(quote)
  const allFeatures = [...(quote.features || []), ...(quote.customFeatures || [])]
  const plans = quote.plans?.length === 3 ? quote.plans : null
  const careTierKey = quote.carePlan?.tier || 'intermedio'
  const careDef = CARE_PLANS[careTierKey] || CARE_PLANS.intermedio
  const care = quote.carePlan?.included !== false
    ? { included: true, tier: careTierKey, label: careDef.label, price: quote.carePlan?.price || careDef.price, minMonths: quote.carePlan?.minMonths || 3, includes: careDef.includes }
    : { included: false, price: careDef.price, minMonths: 3, includes: careDef.includes }

  const finalInUSD  = isUSD ? final : final / rate
  const showUSDHint = !isUSD

  const today      = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
  const validUntil = new Date(Date.now() + 15 * 86400000)
    .toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

  const fmt    = (n) => `${symShort}${Math.round(n).toLocaleString('es-AR')}`
  const fmtUSD = (n) => `USD $${Math.round(n).toLocaleString('en-US')}`

  const quoteNumber = String(Date.now()).slice(-6)
  const logoImg = quote.clientLogo
    ? `<img src="${quote.clientLogo}" class="client-logo" alt="Logo" />`
    : ''

  const rec = quote.aiProposal?.whyItFits
    ? {
        headline: quote.aiProposal.headline || 'Propuesta',
        intro: quote.aiProposal.whyItFits,
        chosen: `${quote.aiProposal.planLabel || ''} · ${quote.aiProposal.categoryLabel || ''}`.trim(),
        plan: quote.aiProposal.recommendedPlan || quote.selectedPlan || 'media',
        sections: [
          { title: 'Por qué te conviene', body: quote.aiProposal.whyItFits },
          quote.aiProposal.howItWorks && { title: 'Cómo lo llevamos a cabo', body: quote.aiProposal.howItWorks },
          quote.aiProposal.considerations?.length && {
            title: 'Qué hay que tener en cuenta',
            body: quote.aiProposal.considerations.join(' '),
          },
          quote.aiProposal.outOfScope?.length && {
            title: 'Qué no está incluido',
            body: quote.aiProposal.outOfScope.join(' '),
          },
          quote.aiProposal.nextSteps?.length && {
            title: 'Próximos pasos',
            body: quote.aiProposal.nextSteps.join(' '),
          },
        ].filter(Boolean),
        faqs: [],
      }
    : buildRecommendation(quote, {
        plan: quote.selectedPlan || quote.recommendedPlan || 'media',
        projectCategory: quote.projectCategory,
        premiumType: quote.premiumType || 'tienda',
        careIncluded: care.included,
      })
  const recKey = rec.plan
  const uniqueNames = []
  if (plans) {
    plans.forEach((p) => {
      planItems(p).forEach((f) => {
        if (!uniqueNames.includes(f.name)) uniqueNames.push(f.name)
      })
    })
  }

  const byCategory = allFeatures.reduce((acc, f) => {
    const cat = f.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(f)
    return acc
  }, {})

  const featuresRows = Object.entries(byCategory).map(([cat, items]) => `
    <tr class="cat-row"><td colspan="2">${cat}</td></tr>
    ${items.map((f) => `
      <tr>
        <td>${f.name}</td>
        <td class="num">${fmt(f.price * rate)}</td>
      </tr>`).join('')}
  `).join('')

  const plansHeader = plans ? `
    <table class="plans-head">
      <tr>
        ${plans.map((p) => {
          const isRec = p.key === recKey
          return `<td class="${isRec ? 'rec' : ''}">
            ${isRec ? '<div class="badge">Recomendada</div>' : '<div class="badge badge-empty">&nbsp;</div>'}
            <div class="pname">${p.label || p.key}</div>
            <div class="pprice">${fmt(p.finalPrice || 0)}</div>
            <div class="pmeta">${p.deadline || 30} días · ${p.revisions || 3} revisiones</div>
          </td>`
        }).join('')}
      </tr>
    </table>
    <table class="compare">
      <thead>
        <tr>
          <th>Incluye</th>
          ${plans.map((p) => `<th class="${p.key === recKey ? 'rec' : ''}">${p.label || p.key}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${uniqueNames.map((name) => `
          <tr>
            <td class="fname">${name}</td>
            ${plans.map((p) => `<td class="tick ${p.key === recKey ? 'rec' : ''}">${hasItem(p, name) ? '●' : '–'}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : `
    <table class="feats">${featuresRows}</table>
  `

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Cotización — ${quote.clientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body { background: #fff; }

    body {
      font-family: Inter, Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      font-size: 10.5px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Márgenes visuales en el propio header/footer (no @page),
       para que se vean aunque Chrome ponga márgenes en Ninguno.
       thead/tfoot reservan el hueco para que el texto no se corte. */
    .page-header {
      position: fixed;
      top: 12mm;
      left: 14mm;
      right: 14mm;
      height: 18mm;
      background: #0f0f0f;
      color: #fff;
      z-index: 10;
    }
    .page-header-inner {
      height: 16mm;
      padding: 0 6mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-header .accent {
      height: 2mm;
      background: #e8141e;
    }
    .brand { font-size: 18px; font-weight: 800; letter-spacing: -0.4px; line-height: 1; }
    .brand span { color: #e8141e; }
    .brand-sub { font-size: 8px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-top: 3px; }
    .meta { text-align: right; color: rgba(255,255,255,0.55); font-size: 9px; line-height: 1.35; }
    .meta strong { display: block; color: #fff; font-size: 11px; margin-bottom: 2px; font-weight: 700; }

    .page-footer {
      position: fixed;
      bottom: 10mm;
      left: 14mm;
      right: 14mm;
      height: 12mm;
      background: #fafafa;
      border-top: 1px solid #ececec;
      z-index: 10;
    }
    .page-footer-inner {
      height: 12mm;
      padding: 0 6mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #888;
      font-size: 9px;
    }
    .page-footer b { color: #111; }
    .page-footer .dot { color: #e8141e; }

    .print-wrap {
      width: 100%;
      border-collapse: collapse;
    }
    .print-wrap td { border: none; padding: 0; vertical-align: top; }
    .print-wrap thead { display: table-header-group; }
    .print-wrap tfoot { display: table-footer-group; }
    .header-space { height: 34mm; } /* 12 margen + 18 header + 4 aire */
    .footer-space { height: 26mm; } /* 10 margen + 12 footer + 4 aire */
    .print-body { padding: 0 14mm; }

    .pair {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .pair td { width: 50%; vertical-align: top; padding-right: 16px; }
    .pair td:last-child { padding-right: 0; padding-left: 16px; border-left: 1px solid #eee; }
    .lbl { font-size: 8.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #999; margin-bottom: 3px; }
    .val { font-size: 14px; font-weight: 700; }
    .sub { font-size: 10px; color: #666; margin-top: 2px; }
    .client-logo { max-height: 36px; max-width: 110px; object-fit: contain; display: block; margin-bottom: 6px; }

    h2 {
      font-size: 9px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #e8141e;
      margin: 0 0 8px;
    }

    .lead { color: #666; font-size: 10.5px; margin: -4px 0 10px; }

    .plans-head { width: 100%; border-collapse: separate; border-spacing: 8px 0; margin: 0 0 8px; }
    .plans-head td {
      width: 33.33%;
      background: #f7f7f7;
      border: 1px solid #ececec;
      border-radius: 8px;
      padding: 10px 10px 12px;
      text-align: center;
      vertical-align: top;
    }
    .plans-head td.rec { background: #fff5f5; border: 1.5px solid #e8141e; }
    .badge { font-size: 8px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #e8141e; height: 12px; }
    .badge-empty { color: transparent; }
    .pname { font-size: 13px; font-weight: 800; margin: 2px 0 4px; }
    .pprice { font-size: 18px; font-weight: 800; color: #e8141e; line-height: 1.1; }
    .pmeta { font-size: 9px; color: #777; margin-top: 4px; }

    .compare { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    .compare th, .compare td { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }
    .compare th {
      font-size: 8.5px; letter-spacing: 0.08em; text-transform: uppercase;
      color: #888; font-weight: 700; text-align: center; width: 16%;
    }
    .compare th:first-child, .compare td.fname { text-align: left; width: 52%; color: #333; font-weight: 500; }
    .compare td.tick { text-align: center; color: #bbb; font-size: 11px; }
    .compare td.tick:not(:empty) { color: #e8141e; }
    .compare .rec { background: #fffafa; }
    .compare tbody tr:last-child td { border-bottom: none; }

    .feats { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    .feats td { padding: 6px 0; border-bottom: 1px solid #f2f2f2; }
    .feats .num { text-align: right; font-weight: 700; }
    .feats .cat-row td { font-size: 8.5px; letter-spacing: 0.1em; text-transform: uppercase; color: #aaa; padding-top: 10px; }

    .care {
      border: 1px solid #ececec;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
      background: #fafafa;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .care-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
    .care-top strong { font-size: 12px; }
    .care-top em { font-style: normal; font-weight: 800; color: #e8141e; font-size: 13px; }
    .care ul { margin: 0; padding-left: 16px; columns: 2; }
    .care li { margin-bottom: 3px; color: #555; }
    .care-note { font-size: 9.5px; color: #888; margin-top: 6px; }

    .rec-box { margin: 12px 0 14px; padding: 12px 14px; border: 1px solid #ececec; border-radius: 8px; background: #fff; }
    .rec-box h3 { font-size: 13px; margin: 0 0 6px; }
    .rec-box .lead { margin-bottom: 10px; }
    .rec-box h4 { font-size: 10px; margin: 10px 0 3px; color: #e8141e; letter-spacing: 0.06em; text-transform: uppercase; }
    .rec-box p { color: #444; font-size: 10.5px; line-height: 1.45; margin: 0; }
    .faq { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .faq tr { break-inside: avoid; page-break-inside: avoid; }
    .faq td { padding: 7px 0; border-bottom: 1px solid #f2f2f2; vertical-align: top; }
    .faq td:first-child { width: 34%; font-weight: 700; padding-right: 10px; color: #222; }
    .faq td:last-child { color: #555; }

    .terms { width: 100%; border-collapse: separate; border-spacing: 8px 8px; margin: 0 0 6px -8px; }
    .terms td {
      width: 50%;
      background: #f7f7f7;
      border-radius: 8px;
      padding: 10px 12px;
      vertical-align: top;
    }
    .terms b { display: block; font-size: 10px; margin-bottom: 3px; }
    .terms span { color: #666; font-size: 9.5px; line-height: 1.45; }

    .single-total {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .single-total td { vertical-align: top; }
    .box {
      background: #111;
      color: #fff;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .box small { display: block; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,.45); font-size: 8.5px; }
    .box strong { display: block; font-size: 22px; margin: 4px 0 2px; }

    @media screen {
      body {
        padding: 34mm 14mm 26mm;
        min-height: 100vh;
      }
      .header-space, .footer-space { display: none; }
      .print-body { padding: 0; }
    }

    @media print {
      html, body { margin: 0; padding: 0; width: 210mm; }
      .page-header, .page-footer { position: fixed; }
      p, li, h2, h3, h4 { orphans: 3; widows: 3; }
    }
  </style>
</head>
<body>
  <header class="page-header">
    <div class="page-header-inner">
      <div>
        <div class="brand">GB<span>.</span>Dev</div>
        <div class="brand-sub">${settings.title || 'Desarrollador Web Full Stack'}</div>
      </div>
      <div class="meta">
        <strong>Cotización #${quoteNumber}</strong>
        ${today}<br>
        Válida hasta el ${validUntil}
      </div>
    </div>
    <div class="accent"></div>
  </header>

  <footer class="page-footer">
    <div class="page-footer-inner">
      <div><b>GB<span class="dot">.</span>Dev</b>${settings.name ? ` — ${settings.name}` : ''}</div>
      <div>${settings.email || 'gianbuzzelatto@gmail.com'}${settings.location ? ` · ${settings.location}` : ''}</div>
    </div>
  </footer>

  <table class="print-wrap">
    <thead>
      <tr><td><div class="header-space">&nbsp;</div></td></tr>
    </thead>
    <tfoot>
      <tr><td><div class="footer-space">&nbsp;</div></td></tr>
    </tfoot>
    <tbody>
      <tr>
        <td class="print-body">

  <table class="pair">
    <tr>
      <td>
        ${logoImg}
        <div class="lbl">Cliente</div>
        <div class="val">${quote.clientName}</div>
        <div class="sub">${quote.email}${quote.whatsapp ? ` · ${quote.whatsapp}` : ''}</div>
      </td>
      <td>
        <div class="lbl">Proyecto</div>
        <div class="val">${quote.projectName || quote.projectType}</div>
        <div class="sub">${quote.projectType}</div>
      </td>
    </tr>
  </table>

  <h2>${plans ? 'Opciones de inversión' : 'Alcance y precio'}</h2>
  ${plans ? `<p class="lead">Tres alternativas. Te marco <strong>${rec.chosen}</strong> porque encaja con lo que necesitás hoy. Abajo te explico por qué.</p>` : ''}
  ${plansHeader}

  <div class="rec-box">
    <h3>${rec.headline}</h3>
    <p class="lead">${rec.intro}</p>
    ${rec.sections.map((s) => `<h4>${s.title}</h4><p>${s.body}</p>`).join('')}
    ${rec.faqs?.length ? `
    <h4>Preguntas que suele hacerse un cliente</h4>
    <table class="faq">
      ${rec.faqs.map((f) => `<tr><td>${f.q}</td><td>${f.a}</td></tr>`).join('')}
    </table>` : ''}
  </div>

  ${!plans ? `
  <table class="single-total">
    <tr>
      <td style="width:58%;padding-right:12px;">
        ${quote.discount > 0 ? `<div class="sub">Incluye descuento ${quote.discount}%</div>` : ''}
        ${quote.urgency && quote.urgency !== 'normal' ? `<div class="sub">${URGENCY_LABEL[quote.urgency]}</div>` : ''}
      </td>
      <td>
        <div class="box">
          <small>Total estimado</small>
          <strong>${fmt(final)}</strong>
          <small>${cur}${showUSDHint ? ` · ${fmtUSD(finalInUSD)}` : ''}</small>
        </div>
      </td>
    </tr>
  </table>` : ''}

  ${care.included ? `
  <div class="care">
    <div class="care-top">
      <strong>Mantenimiento ${care.label} (opcional, recomendado)</strong>
      <em>${fmt(care.price * rate)} ${cur}/mes</em>
    </div>
    <ul>
      ${care.includes.map((item) => `<li>${item}</li>`).join('')}
    </ul>
    <div class="care-note">Arranca al publicar. Mínimo ${care.minMonths} meses. El sitio es tuyo: si cortás el plan, te paso hosting y dominio a tu nombre. Funciones nuevas se cotizan aparte.</div>
  </div>` : ''}

  <h2>Condiciones</h2>
  <table class="terms">
    <tr>
      <td><b>Pago del proyecto</b><span>40% al arrancar, 30% a mitad de proyecto y 30% contra entrega.</span></td>
      <td><b>Alcance</b><span>Lo que no está en el plan elegido se presupuesta aparte.</span></td>
    </tr>
    <tr>
      <td><b>Validez</b><span>15 días desde la fecha de esta cotización.</span></td>
      <td><b>Revisiones</b><span>Las rondas de cada plan están incluidas. Extra se cotiza.</span></td>
    </tr>
  </table>

  ${quote.description ? `<p class="lead" style="margin-top:8px;"><b>Brief: </b>${quote.description}</p>` : ''}

        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`

  const win = window.open('', '_blank', 'width=920,height=1100')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 250)
}
