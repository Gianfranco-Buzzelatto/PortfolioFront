import { buildRecommendation } from '../data/quoteRecommendation'
import { CARE_PLANS } from '../data/quoteCatalog2026'
import { baseHTML } from './documentPDF.js'
import { downloadHtmlAsPdf, pdfFilename } from './pdfDownload.js'

const SYM_SHORT = { USD: '$', ARS: '$', EUR: '€' }
const URGENCY_LABEL = { normal: 'Normal', urgente: 'Urgente (+15%)', 'muy-urgente': 'Muy urgente (+30%)' }

/** Precios del catálogo están en USD. exchangeRate = unidades de `currency` por 1 USD. */
export function effectiveRate(currency, exchangeRate) {
  return (currency || 'USD') === 'USD' ? 1 : (Number(exchangeRate) || 1)
}

/** Formatea un monto en USD del catálogo a la moneda de la cotización. */
export function formatMoney(amountUSD, currency = 'USD', exchangeRate = 1) {
  const cur = currency || 'USD'
  const rate = effectiveRate(cur, exchangeRate)
  const amount = Math.round((Number(amountUSD) || 0) * rate)
  const sym = SYM_SHORT[cur] || '$'
  const value = `${sym}${amount.toLocaleString('es-AR')}`
  return {
    amount,
    currency: cur,
    value,
    label: `${value} ${cur}`,
    perMonth: `${value} ${cur}/mes`,
  }
}

export function calcPricing(q) {
  const urgencyMult   = q.urgency === 'muy-urgente' ? 1.30 : q.urgency === 'urgente' ? 1.15 : 1
  const featureSum    = (q.features || []).reduce((s, f) => s + (f.price || 0), 0)
  const customSum     = (q.customFeatures || []).reduce((s, f) => s + (f.price || 0), 0)
  const base          = q.fixedPrice != null ? q.fixedPrice + featureSum + customSum : featureSum + customSum
  const afterDiscount = base * (1 - (q.discount || 0) / 100)
  const afterMargin   = afterDiscount * (1 + (q.margin || 0) / 100)
  const afterUrgency  = afterMargin * urgencyMult
  const rate          = effectiveRate(q.currency, q.exchangeRate)
  const final         = afterUrgency * rate
  return { base, final, urgencyMult, rate }
}

const planItems = (p) => [...(p.features || []), ...(p.customFeatures || [])]
const hasItem = (p, name) => planItems(p).some((f) => f.name === name)

const QUOTE_EXTRA_CSS = `
  .lead { color: #666; font-size: 12px; margin: -4px 0 14px; }
  .plans-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .plan-card {
    background: #f8f8f8; border: 1px solid #efefef; border-radius: 10px;
    padding: 14px 12px; text-align: center;
  }
  .plan-card.rec { background: #fff5f5; border: 1.5px solid #e8141e; }
  .plan-card .badge {
    font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    color: #e8141e; min-height: 14px; margin-bottom: 4px;
  }
  .plan-card .pname { font-size: 14px; font-weight: 800; margin-bottom: 4px; }
  .plan-card .pprice { font-size: 20px; font-weight: 900; color: #e8141e; line-height: 1.1; }
  .plan-card .pmeta { font-size: 11px; color: #777; margin-top: 6px; }
  .compare { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  .compare th, .compare td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
  .compare th {
    font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
    color: #888; font-weight: 700; text-align: center; width: 16%;
  }
  .compare th:first-child, .compare td.fname { text-align: left; width: 52%; color: #333; font-weight: 500; }
  .compare td.tick { text-align: center; color: #bbb; }
  .compare td.tick.on { color: #e8141e; font-weight: 700; }
  .compare .rec { background: #fffafa; }
  .feats { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  .feats td { padding: 8px 0; border-bottom: 1px solid #f2f2f2; font-size: 12px; }
  .feats .num { text-align: right; font-weight: 700; }
  .feats .cat-row td {
    font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #aaa; padding-top: 14px;
  }
  .care {
    border: 1px solid #efefef; border-radius: 10px; padding: 16px 18px;
    margin-bottom: 8px; background: #fafafa;
  }
  .care-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; gap: 12px; }
  .care-top strong { font-size: 13px; }
  .care-top em { font-style: normal; font-weight: 800; color: #e8141e; font-size: 14px; }
  .care ul { margin: 0; padding-left: 18px; columns: 2; }
  .care li { margin-bottom: 4px; color: #555; font-size: 12px; }
  .care-note { font-size: 11px; color: #888; margin-top: 10px; }
  .rec-box {
    margin: 0 0 8px; padding: 16px 18px; border: 1px solid #efefef;
    border-radius: 10px; background: #fff;
  }
  .rec-box h3 { font-size: 15px; margin: 0 0 8px; color: #0f0f0f; }
  .rec-box h4 {
    font-size: 10px; margin: 14px 0 4px; color: #e8141e;
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .rec-box p { color: #555; font-size: 12px; line-height: 1.65; margin: 0 0 6px; }
  .faq { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .faq td { padding: 8px 0; border-bottom: 1px solid #f2f2f2; vertical-align: top; font-size: 12px; }
  .faq td:first-child { width: 34%; font-weight: 700; padding-right: 12px; color: #222; }
  .faq td:last-child { color: #555; }
  .client-logo { max-height: 40px; max-width: 120px; object-fit: contain; display: block; margin-bottom: 8px; }
  .content-section { page-break-inside: auto; break-inside: auto; }
  .plans-grid, .plan-card, .care, .highlight-box { page-break-inside: avoid; break-inside: avoid; }
`

export function buildQuoteHTML(quote, settings = {}) {
  const cur      = quote.currency || 'USD'
  const rate     = effectiveRate(cur, quote.exchangeRate)
  const symShort = SYM_SHORT[cur] || '$'
  const isUSD    = cur === 'USD'

  const { final } = calcPricing(quote)
  const allFeatures = [...(quote.features || []), ...(quote.customFeatures || [])]
  const plans = quote.plans?.length === 3 ? quote.plans : null
  const careTierKey = quote.carePlan?.tier || 'intermedio'
  const careDef = CARE_PLANS[careTierKey] || CARE_PLANS.intermedio
  // Precio de cuidado del catálogo siempre en USD; se convierte una sola vez
  const carePriceUSD = careDef.price
  const careMoney = formatMoney(carePriceUSD, cur, quote.exchangeRate)
  const care = quote.carePlan?.included !== false
    ? {
        included: true,
        label: careDef.label,
        priceUSD: carePriceUSD,
        minMonths: quote.carePlan?.minMonths || 3,
        includes: careDef.includes,
        money: careMoney,
      }
    : { included: false, priceUSD: carePriceUSD, minMonths: 3, includes: careDef.includes, money: careMoney }

  const finalInUSD  = isUSD ? final : final / rate
  const showUSDHint = !isUSD

  const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
  const validUntil = new Date(Date.now() + 15 * 86400000)
    .toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

  const fmt = (n) => `${symShort}${Math.round(n).toLocaleString('es-AR')}`
  const quoteNumber = String(Date.now()).slice(-6)

  const logoImg = quote.clientLogo
    ? `<img src="${quote.clientLogo}" class="client-logo" alt="Logo" />`
    : ''

  const fallbackRec = buildRecommendation(quote, {
    plan: quote.selectedPlan || quote.recommendedPlan || 'media',
    projectCategory: quote.projectCategory,
    premiumType: quote.premiumType || 'tienda',
    careIncluded: care.included,
  })

  const rec = quote.proposalCopy?.headline
    ? {
        ...fallbackRec,
        ...quote.proposalCopy,
        sections: Array.isArray(quote.proposalCopy.sections)
          ? quote.proposalCopy.sections
          : fallbackRec.sections,
        faqs: Array.isArray(quote.proposalCopy.faqs)
          ? quote.proposalCopy.faqs
          : fallbackRec.faqs,
      }
    : quote.aiProposal?.whyItFits
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
          faqs: fallbackRec.faqs || [],
        }
      : fallbackRec

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

  const plansBlock = plans ? `
    <div class="content-section">
      <div class="section-title">Opciones de inversión</div>
      <p class="lead">Tres alternativas. Te marco <strong>${rec.chosen}</strong> porque encaja con lo que necesitás hoy.</p>
      <div class="plans-grid">
        ${plans.map((p) => {
          const isRec = p.key === recKey
          return `<div class="plan-card ${isRec ? 'rec' : ''}">
            <div class="badge">${isRec ? 'Recomendada' : '&nbsp;'}</div>
            <div class="pname">${p.label || p.key}</div>
            <div class="pprice">${fmt(p.finalPrice || 0)} <span style="font-size:11px;font-weight:700;color:#888;">${cur}</span></div>
            <div class="pmeta">${p.deadline || 30} días · ${p.revisions || 3} revisiones</div>
          </div>`
        }).join('')}
      </div>
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
              ${plans.map((p) => {
                const on = hasItem(p, name)
                return `<td class="tick ${on ? 'on' : ''} ${p.key === recKey ? 'rec' : ''}">${on ? '●' : '–'}</td>`
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : `
    <div class="content-section">
      <div class="section-title">Alcance y precio</div>
      <table class="feats">${featuresRows}</table>
      <div class="highlight-box">
        <div class="hl-label">Total estimado</div>
        <div class="hl-value">${fmt(final)} ${cur}</div>
        <div class="hl-sub">${showUSDHint ? `≈ ${formatMoney(finalInUSD, 'USD', 1).label}` : cur}${quote.discount > 0 ? ` · Descuento ${quote.discount}%` : ''}${quote.urgency && quote.urgency !== 'normal' ? ` · ${URGENCY_LABEL[quote.urgency]}` : ''}</div>
      </div>
    </div>
  `

  const content = `
    ${plansBlock}

    <div class="content-section">
      <div class="section-title">Recomendación</div>
      <div class="rec-box">
        <h3>${rec.headline}</h3>
        <p>${rec.intro}</p>
        ${rec.sections.map((s) => `<h4>${s.title}</h4><p>${s.body}</p>`).join('')}
        ${rec.faqs?.length ? `
          <h4>Preguntas frecuentes</h4>
          <table class="faq">
            ${rec.faqs.map((f) => `<tr><td>${f.q}</td><td>${f.a}</td></tr>`).join('')}
          </table>` : ''}
      </div>
    </div>

    ${care.included ? `
    <div class="content-section">
      <div class="section-title">Plan de cuidado</div>
      <div class="care">
        <div class="care-top">
          <strong>Mantenimiento ${care.label} (opcional, recomendado)</strong>
          <em>${care.money.perMonth}</em>
        </div>
        <ul>
          ${care.includes.map((item) => `<li>${item}</li>`).join('')}
        </ul>
        <div class="care-note">Arranca al publicar. Mínimo ${care.minMonths} meses. El sitio es tuyo: si cortás el plan, te paso hosting y dominio a tu nombre. Funciones nuevas se cotizan aparte.</div>
      </div>
    </div>` : ''}

    <div class="content-section">
      <div class="section-title">Condiciones</div>
      <div class="terms-grid">
        <div class="term-item">
          <div class="term-title">Pago del proyecto</div>
          <div class="term-text">40% al arrancar, 30% a mitad de proyecto y 30% contra entrega.</div>
        </div>
        <div class="term-item">
          <div class="term-title">Alcance</div>
          <div class="term-text">Lo que no está en el plan elegido se presupuesta aparte.</div>
        </div>
        <div class="term-item">
          <div class="term-title">Validez</div>
          <div class="term-text">15 días desde la fecha de esta cotización (${validUntil}).</div>
        </div>
        <div class="term-item">
          <div class="term-title">Revisiones</div>
          <div class="term-text">Las rondas de cada plan están incluidas. Extra se cotiza.</div>
        </div>
      </div>
    </div>

    ${quote.description ? `
    <div class="content-section">
      <div class="section-title">Brief</div>
      <p>${quote.description}</p>
    </div>` : ''}
  `

  const clientSub = [quote.email, quote.whatsapp].filter(Boolean).join(' · ')

  return baseHTML({
    clientName: quote.clientName,
    docLabel: 'Cotización',
    docNum: quoteNumber,
    content: `${logoImg}${content}`,
    settings,
    includeSignature: false,
    metaSub: `${today} · Válida hasta ${validUntil}`,
    infoLeft: {
      label: 'Cliente',
      value: quote.clientName,
      sub: clientSub,
    },
    infoRight: {
      label: 'Proyecto',
      value: quote.projectName || quote.projectType || 'Proyecto',
      sub: quote.projectType || '',
    },
    extraCss: QUOTE_EXTRA_CSS,
  })
}

export function generatePDF(quote, settings = {}) {
  return downloadHtmlAsPdf(
    buildQuoteHTML(quote, settings),
    pdfFilename('Cotizacion', quote.clientName),
  )
}
