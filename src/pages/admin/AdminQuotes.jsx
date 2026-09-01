import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import api from '../../hooks/useApi'
import { generatePDF, calcPricing, formatMoney } from '../../utils/quotePDF'
import './AdminQuotes.css'
import { generateAgreementPDF } from '../../utils/documentPDF'
import { TIER_KEYS, TIER_META, CARE_PLAN, buildDefaultPlans, emptyPlans, resolveCategory } from '../../data/quoteTiers'
import { PROJECT_CATEGORIES, ADDON_CATALOG, CARE_PLANS, formatPriceRange } from '../../data/quoteCatalog2026'
import { suggestRecommendation, buildRecommendation, detectCategory } from '../../data/quoteRecommendation'
import { LEAD_SCORE_META, SUGGESTED_ACTION_LABEL } from '../../data/leadScore'

const CATALOG = ADDON_CATALOG

const STATUS_LABEL = { pending: 'Pendiente', reviewed: 'Revisado', quoted: 'Cotizado', sent: 'Enviado', accepted: 'Aceptado', rejected: 'Rechazado' }
const STATUS_COLOR = { pending: '#ffc107', reviewed: '#17a2b8', quoted: '#6f42c1', sent: '#0d6efd', accepted: '#28a745', rejected: '#dc3545' }
const STATUS_OPTIONS = Object.keys(STATUS_LABEL)

const URGENCY = [
  { key: 'normal', label: 'Normal', mult: 1 },
  { key: 'urgente', label: 'Urgente +15%', mult: 1.15 },
  { key: 'muy-urgente', label: 'Muy urgente +30%', mult: 1.30 },
]

const CURRENCIES = ['USD', 'ARS', 'EUR']
const SYM = { USD: '$', ARS: '$', EUR: '€' }

const STEP_LABELS = ['Cliente', 'Planes', 'Precio', 'Vista previa']

const defaultWizard = () => ({
  projectName: '',
  clientLogo: '',
  projectCategory: 'landing',
  plans: buildDefaultPlans('landing'),
  activeTier: 'media',
  premiumType: 'tienda',
  recommendedPlan: 'media',
  carePlanIncluded: true,
  carePlanTier: 'intermedio',
  discount: 0,
  margin: 0,
  urgency: 'normal',
  deadline: 25,
  revisions: 3,
  currency: 'USD',
  exchangeRate: 1,
  adminNotes: '',
  proposalCopy: null,
  proposalDirty: false,
})

const fmt = (n, sym) => `${sym}${Math.round(n).toLocaleString('es-AR')}`

export default function AdminQuotes() {
  const [quotes, setQuotes]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState('')
  const [scoreFilter, setScoreFilter] = useState('')
  const [toast, setToast]       = useState('')
  const [shareBusy, setShareBusy] = useState(false)
  const [discoveryDraft, setDiscoveryDraft] = useState({ scheduledAt: '', notes: '', done: false })

  // Wizard
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep]             = useState(0)
  const [wd, setWd]                 = useState(defaultWizard()) // wizard data
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [saving, setSaving]         = useState(false)
  const [settings, setSettings]     = useState({})

  const [starting, setStarting]   = useState(false)
  const [generatingAi, setGeneratingAi] = useState(false)

  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // ── Iniciar proyecto (cotización aceptada → cliente activo) ──────────────
  const startProject = async (quote) => {
    if (!confirm(`¿Confirmar inicio de proyecto para ${quote.clientName}?\nSe generará el acuerdo de trabajo y se registrará el cliente en el sistema.`)) return
    setStarting(true)
    try {
      const res = await api.post('/clients', {
        quoteRef:    quote._id,
        clientName:  quote.clientName,
        email:       quote.email,
        projectType: quote.projectType,
        tech:        quote.projectName || '',
        projectName: quote.projectName || '',
        finalPrice:  quote.finalPrice,
        currency:    quote.currency || 'USD',
        deadline:    quote.deadline,
        revisions:   quote.revisions,
        features:    quote.features || [],
        stage:       'activo',
        maintenancePlan: quote.carePlan?.included !== false ? {
          price: quote.carePlan?.price || CARE_PLAN.price,
          currency: quote.currency || 'USD',
          includes: CARE_PLAN.includes,
          startDate: new Date(),
        } : undefined,
      })
      await api.put(`/quotes/${quote._id}`, { stage: 'activo' })
      if (res.data.portalPath && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${window.location.origin}${res.data.portalPath}`)
        notify('Proyecto iniciado ✓ — Link del portal copiado')
      } else {
        notify('Proyecto iniciado ✓ — Cliente registrado en el sistema')
      }
      load()
      generateAgreementPDF(quote, settings)
    } catch {
      notify('Error al iniciar proyecto')
    } finally {
      setStarting(false)
    }
  }

  const generateWithAi = async (quote) => {
    setGeneratingAi(true)
    try {
      const res = await api.post(`/quotes/${quote._id}/generate-ai`, {}, { timeout: 45000 })
      const draft = res.data
      setSelected(draft)
      notify('Borrador del asistente listo. Revisalo y guardá para aprobarlo.')
      load()
      openWizard(draft)
    } catch {
      notify('No pude armar el borrador con el asistente')
    } finally {
      setGeneratingAi(false)
    }
  }

  const load = () => {
    setLoading(true)
    api.get('/quotes').then(r => setQuotes(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {})
  }, [])

  const filtered = quotes.filter((q) => {
    if (filter && q.status !== filter) return false
    if (scoreFilter && q.leadScore !== scoreFilter) return false
    return true
  })

  useEffect(() => {
    if (!selected) return
    setDiscoveryDraft({
      scheduledAt: selected.discovery?.scheduledAt || '',
      notes: selected.discovery?.notes || '',
      done: Boolean(selected.discovery?.done),
    })
  }, [selected?._id])

  const saveDiscovery = async () => {
    if (!selected) return
    try {
      const res = await api.put(`/quotes/${selected._id}`, { discovery: discoveryDraft })
      setSelected(res.data)
      setQuotes((list) => list.map((q) => (q._id === res.data._id ? res.data : q)))
      notify('Discovery guardado')
    } catch {
      notify('No pude guardar discovery')
    }
  }

  const shareProposalLink = async () => {
    if (!selected) return
    setShareBusy(true)
    try {
      const res = await api.post(`/quotes/${selected._id}/share-link`)
      const path = res.data.path || `/propuesta/${res.data.token}`
      const url = `${window.location.origin}${path}`
      setSelected(res.data.quote)
      setQuotes((list) => list.map((q) => (q._id === res.data.quote._id ? res.data.quote : q)))
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        notify('Link copiado al portapapeles')
      } else {
        notify(url)
      }
    } catch (err) {
      notify(err.response?.data?.message || 'No pude generar el link')
    } finally {
      setShareBusy(false)
    }
  }

  const setLeadScore = async (leadScore) => {
    if (!selected) return
    const suggestedAction =
      leadScore === 'green' ? 'contactar' : leadScore === 'red' ? 'archivar' : 'pedir_info'
    const res = await api.put(`/quotes/${selected._id}`, { leadScore, suggestedAction })
    setSelected(res.data)
    setQuotes((list) => list.map((q) => (q._id === res.data._id ? res.data : q)))
  }

  // ── Wizard ───────────────────────────────────────────────────────────────
  const openWizard = (lead) => {
    setSelected(lead)
    const suggestion = suggestRecommendation(lead)
    const category = resolveCategory({ ...lead, projectCategory: lead.projectCategory || suggestion.projectCategory })
    if (lead.plans?.length === 3) {
      const mapped = emptyPlans(category)
      lead.plans.forEach((p) => {
        mapped[p.key] = {
          features: p.features || [],
          customFeatures: p.customFeatures || [],
          fixedPrice: p.fixedPrice ?? p.basePrice ?? mapped[p.key].fixedPrice,
          priceRange: p.priceRange ?? mapped[p.key].priceRange,
          deadline: p.deadline || mapped[p.key].deadline || 25,
          revisions: p.revisions || mapped[p.key].revisions || 3,
        }
      })
      setWd({
        projectName:    lead.projectName || '',
        clientLogo:     lead.clientLogo  || '',
        projectCategory: category,
        plans:          mapped,
        activeTier:     lead.selectedPlan || suggestion.plan,
        recommendedPlan: lead.selectedPlan || suggestion.plan,
        premiumType:    lead.premiumType || suggestion.premiumType,
        carePlanIncluded: lead.carePlan?.included !== false,
        carePlanTier: lead.carePlan?.tier || 'intermedio',
        discount:       lead.discount || 0,
        margin:         lead.margin || 0,
        urgency:        lead.urgency || 'normal',
        deadline:       lead.deadline || 25,
        revisions:      lead.revisions || 3,
        currency:       lead.currency || 'USD',
        exchangeRate:   lead.exchangeRate || 1,
        adminNotes:     lead.adminNotes || '',
        proposalCopy:   lead.proposalCopy || null,
        proposalDirty:  Boolean(lead.proposalCopy?.headline),
      })
    } else if (lead.features?.length > 0 || lead.projectName) {
      const plans = buildDefaultPlans(category)
      plans.media.features = lead.features || plans.media.features
      plans.media.customFeatures = lead.customFeatures || []
      setWd({
        ...defaultWizard(),
        projectName:    lead.projectName || '',
        clientLogo:     lead.clientLogo  || '',
        projectCategory: category,
        plans,
        recommendedPlan: suggestion.plan,
        activeTier: suggestion.plan,
        premiumType: suggestion.premiumType,
        discount:       lead.discount || 0,
        margin:         lead.margin || 0,
        urgency:        lead.urgency || 'normal',
        deadline:       lead.deadline || 25,
        revisions:      lead.revisions || 3,
        currency:       lead.currency || 'USD',
        exchangeRate:   lead.exchangeRate || 1,
        adminNotes:     lead.adminNotes || '',
        proposalCopy:   lead.proposalCopy || null,
        proposalDirty:  Boolean(lead.proposalCopy?.headline),
      })
    } else {
      const preset = defaultWizard()
      setWd({
        ...preset,
        projectCategory: category,
        plans: buildDefaultPlans(category),
        recommendedPlan: suggestion.plan,
        activeTier: suggestion.plan,
        premiumType: suggestion.premiumType,
        proposalCopy: lead.proposalCopy || null,
        proposalDirty: Boolean(lead.proposalCopy?.headline),
      })
    }
    setStep(0)
    setWizardOpen(true)
  }

  const closeWizard = () => { setWizardOpen(false); setStep(0) }

  const activePlan = wd.plans?.[wd.activeTier] || { features: [], customFeatures: [] }

  const isFeatureSelected = (name) => activePlan.features.some(f => f.name === name)

  const toggleFeature = (name, price, category) => {
    setWd(w => {
      const plan = w.plans[w.activeTier]
      const exists = plan.features.some(f => f.name === name)
      return {
        ...w,
        plans: {
          ...w.plans,
          [w.activeTier]: {
            ...plan,
            features: exists
              ? plan.features.filter(f => f.name !== name)
              : [...plan.features, { name, price, category }],
          },
        },
      }
    })
  }

  const addCustom = () => {
    const n = customName.trim()
    const p = parseFloat(customPrice) || 0
    if (!n) return
    setWd(w => {
      const plan = w.plans[w.activeTier]
      return {
        ...w,
        plans: {
          ...w.plans,
          [w.activeTier]: {
            ...plan,
            customFeatures: [...plan.customFeatures, { name: n, price: p, category: 'Personalizado' }],
          },
        },
      }
    })
    setCustomName(''); setCustomPrice('')
  }

  const removeCustom = (idx) => setWd(w => {
    const plan = w.plans[w.activeTier]
    return {
      ...w,
      plans: {
        ...w.plans,
        [w.activeTier]: {
          ...plan,
          customFeatures: plan.customFeatures.filter((_, i) => i !== idx),
        },
      },
    }
  })

  const setProjectCategory = (projectCategory) => {
    const suggestion = suggestRecommendation({ ...selected, projectCategory })
    setWd(w => ({
      ...w,
      projectCategory,
      premiumType: suggestion.premiumType,
      plans: buildDefaultPlans(projectCategory),
      recommendedPlan: suggestion.plan,
      activeTier: suggestion.plan,
    }))
  }

  const resetTemplates = () => {
    setWd(w => ({ ...w, plans: buildDefaultPlans(w.projectCategory || 'landing') }))
  }

  const pricingFor = (plan) => calcPricing({
    ...wd,
    features: plan.features,
    customFeatures: plan.customFeatures,
    fixedPrice: plan.fixedPrice,
  })

  const activeCategory = PROJECT_CATEGORIES[wd.projectCategory] || PROJECT_CATEGORIES.landing
  const careTier = CARE_PLANS[wd.carePlanTier || 'intermedio'] || CARE_PLANS.intermedio

  const pricedPlans = TIER_KEYS.map((key) => {
    const plan = wd.plans[key]
    const { base, final } = pricingFor(plan)
    const catTier = activeCategory?.tiers?.[key]
    return {
      key,
      ...TIER_META[key],
      recommended: key === (wd.recommendedPlan || 'media'),
      ...plan,
      fixedPrice: plan.fixedPrice ?? catTier?.price,
      priceRange: plan.priceRange ?? catTier?.priceRange,
      base,
      final,
    }
  })

  const sym = SYM[wd.currency] || '$'
  const { base, final } = pricingFor(activePlan)
  const allCount = activePlan.features.length + activePlan.customFeatures.length

  const serializedPlans = () => pricedPlans.map((p) => ({
    key: p.key,
    label: p.label,
    features: p.features,
    customFeatures: p.customFeatures,
    fixedPrice: p.fixedPrice,
    priceRange: p.priceRange,
    deadline: p.deadline,
    revisions: p.revisions,
    basePrice: Math.round(p.base),
    finalPrice: Math.round(p.final),
  }))

  const recPlan = pricedPlans.find((p) => p.key === (wd.recommendedPlan || 'media')) || pricedPlans[1]
  const autoRecCopy = selected ? buildRecommendation(selected, {
    plan: wd.recommendedPlan || 'media',
    projectCategory: wd.projectCategory,
    premiumType: wd.premiumType,
    careIncluded: wd.carePlanIncluded,
  }) : null
  const recCopy = wd.proposalCopy || autoRecCopy

  // Sembrar / refrescar texto automático si el usuario no lo editó
  useEffect(() => {
    if (!wizardOpen || step !== 3 || !selected || !autoRecCopy) return
    setWd((w) => {
      if (w.proposalDirty && w.proposalCopy) return w
      return { ...w, proposalCopy: autoRecCopy, proposalDirty: false }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- solo cuando cambia el contexto de la propuesta
  }, [wizardOpen, step, selected?._id, wd.recommendedPlan, wd.projectCategory, wd.premiumType, wd.carePlanIncluded])

  const patchProposal = (patch) => {
    setWd((w) => ({
      ...w,
      proposalDirty: true,
      proposalCopy: { ...(w.proposalCopy || autoRecCopy || {}), ...patch },
    }))
  }

  const patchProposalSection = (index, field, value) => {
    setWd((w) => {
      const base = w.proposalCopy || autoRecCopy
      if (!base) return w
      const sections = (base.sections || []).map((s, i) => (
        i === index ? { ...s, [field]: value } : s
      ))
      return { ...w, proposalDirty: true, proposalCopy: { ...base, sections } }
    })
  }

  const patchProposalFaq = (index, field, value) => {
    setWd((w) => {
      const base = w.proposalCopy || autoRecCopy
      if (!base) return w
      const faqs = (base.faqs || []).map((f, i) => (
        i === index ? { ...f, [field]: value } : f
      ))
      return { ...w, proposalDirty: true, proposalCopy: { ...base, faqs } }
    })
  }

  const resetProposalCopy = () => {
    if (!autoRecCopy) return
    setWd((w) => ({ ...w, proposalCopy: autoRecCopy, proposalDirty: false }))
    notify('Texto restablecido al automático')
  }

  const saveQuote = async () => {
    setSaving(true)
    try {
      const plans = serializedPlans()
      const payload = {
        projectName: wd.projectName,
        clientLogo: wd.clientLogo,
        discount: wd.discount,
        margin: wd.margin,
        urgency: wd.urgency,
        currency: wd.currency,
        exchangeRate: wd.exchangeRate,
        adminNotes: wd.adminNotes,
        premiumType: wd.premiumType,
        projectCategory: wd.projectCategory,
        carePlan: {
          included: wd.carePlanIncluded,
          tier: wd.carePlanTier || 'intermedio',
          price: careTier.price,
          minMonths: CARE_PLAN.minMonths,
        },
        plans,
        selectedPlan: wd.recommendedPlan || 'media',
        features: recPlan.features,
        customFeatures: recPlan.customFeatures,
        deadline: recPlan.deadline,
        revisions: recPlan.revisions,
        basePrice:  Math.round(recPlan.base),
        finalPrice: Math.round(recPlan.final),
        proposalCopy: wd.proposalCopy || autoRecCopy || null,
        status: selected.status === 'pending' ? 'quoted' : selected.status,
      }
      await api.put(`/quotes/${selected._id}`, payload)
      setSelected((s) => (s ? { ...s, ...payload } : s))
      notify('Cotización guardada ✓')
      load()
      closeWizard()
    } catch { notify('Error al guardar') }
    finally { setSaving(false) }
  }

  const handleGeneratePDF = async () => {
    const proposalCopy = wd.proposalCopy || autoRecCopy || null
    // Guardar el texto editado antes de bajar el PDF
    try {
      await api.put(`/quotes/${selected._id}`, { proposalCopy })
      setSelected((s) => (s ? { ...s, proposalCopy } : s))
    } catch { /* igual generamos el PDF con el texto actual */ }

    generatePDF({
      ...selected,
      ...wd,
      plans: serializedPlans(),
      features: recPlan.features,
      customFeatures: recPlan.customFeatures,
      deadline: recPlan.deadline,
      revisions: recPlan.revisions,
      finalPrice: Math.round(recPlan.final),
      basePrice: Math.round(recPlan.base),
      selectedPlan: wd.recommendedPlan || 'media',
      proposalCopy,
      carePlan: {
        included: wd.carePlanIncluded,
        tier: wd.carePlanTier || 'intermedio',
        price: careTier.price,
        minMonths: CARE_PLAN.minMonths,
      },
    }, settings)
  }

  const updateStatus = async (id, status) => {
    await api.put(`/quotes/${id}`, { status })
    notify('Estado actualizado ✓')
    setQuotes(q => q.map(x => x._id === id ? { ...x, status } : x))
    if (selected?._id === id) setSelected(s => ({ ...s, status }))
  }

  const deleteQuote = async (id) => {
    if (!confirm('¿Eliminar esta cotización?')) return
    await api.delete(`/quotes/${id}`)
    notify('Eliminada')
    setSelected(null)
    load()
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="Cotizaciones">
      {toast && <div className="toast success">{toast}</div>}

      {/* Filtros */}
      <div className="quotes-header">
        <div className="filter-tabs">
          <button className={`filter-tab ${!filter ? 'filter-tab--active' : ''}`} onClick={() => setFilter('')}>
            Todas ({quotes.length})
          </button>
          {STATUS_OPTIONS.map(s => (
            <button key={s} className={`filter-tab ${filter === s ? 'filter-tab--active' : ''}`} onClick={() => setFilter(s)}>
              {STATUS_LABEL[s]} ({quotes.filter(q => q.status === s).length})
            </button>
          ))}
        </div>
        <div className="filter-tabs" style={{ marginTop: 8 }}>
          <button className={`filter-tab ${!scoreFilter ? 'filter-tab--active' : ''}`} onClick={() => setScoreFilter('')}>
            Score: todos
          </button>
          {Object.entries(LEAD_SCORE_META).map(([key, meta]) => (
            <button
              key={key}
              className={`filter-tab ${scoreFilter === key ? 'filter-tab--active' : ''}`}
              onClick={() => setScoreFilter(key)}
            >
              {meta.emoji} {meta.label} ({quotes.filter((q) => q.leadScore === key).length})
            </button>
          ))}
        </div>
      </div>

      <div className="quotes-layout">
        {/* Lista */}
        <div className="quotes-list">
          {loading ? (
            <div className="ql-loading">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="ql-empty"><i className="fas fa-inbox" /><p>Sin cotizaciones</p></div>
          ) : filtered.map(q => (
            <div
              key={q._id}
              className={`quote-item ${selected?._id === q._id ? 'quote-item--active' : ''}`}
              onClick={() => setSelected(q)}
            >
              <div className="quote-item__top">
                <div className="quote-item__avatar">{q.clientName.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="quote-item__name">{q.clientName}</p>
                  <p className="quote-item__email">{q.email}</p>
                </div>
                <span className="qstatus-dot" style={{ background: STATUS_COLOR[q.status] }} title={STATUS_LABEL[q.status]} />
              </div>
              <div className="quote-item__bottom">
                {q.leadScore && LEAD_SCORE_META[q.leadScore] && (
                  <span className="tag" title={LEAD_SCORE_META[q.leadScore].hint} style={{ borderColor: LEAD_SCORE_META[q.leadScore].color }}>
                    {LEAD_SCORE_META[q.leadScore].emoji} {LEAD_SCORE_META[q.leadScore].label}
                  </span>
                )}
                {q.contract?.acceptedAt && <span className="tag">Contrato</span>}
                {q.onboarding?.submittedAt && <span className="tag">Onboarding</span>}
                <span className="tag">{q.projectType}</span>
                {q.plans?.length === 3 ? (
                  <span className="quote-item__price">
                    ${Math.min(...q.plans.map(p => p.finalPrice || 0)).toLocaleString()}–${Math.max(...q.plans.map(p => p.finalPrice || 0)).toLocaleString()}
                  </span>
                ) : q.finalPrice ? (
                  <span className="quote-item__price">${q.finalPrice.toLocaleString()} {q.currency || 'USD'}</span>
                ) : null}
                <span className="quote-item__date">{new Date(q.createdAt).toLocaleDateString('es-AR')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detalle */}
        {selected ? (
          <div className="quote-detail">
            <div className="quote-detail__header">
              <div className="quote-detail__client">
                <div className="quote-detail__avatar">{selected.clientName.charAt(0).toUpperCase()}</div>
                <div>
                  <h2>{selected.clientName}</h2>
                  <a href={`mailto:${selected.email}`}>{selected.email}</a>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => openWizard(selected)}>
                  <i className="fas fa-magic" /> {selected.finalPrice ? 'Editar cotización' : 'Cotizar'}
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => generateWithAi(selected)}
                  disabled={generatingAi}
                  title="Arma un borrador según el brief. Vos lo revisás y lo aprobás antes de enviarlo."
                >
                  <i className="fas fa-robot" /> {generatingAi ? 'Armando borrador…' : selected.aiProposal ? 'Regenerar borrador' : 'Asistente: armar borrador'}
                </button>
                {selected.finalPrice && (
                  <button className="btn btn-outline btn-sm" onClick={() => generatePDF({ ...selected }, settings)}>
                    <i className="fas fa-file-pdf" /> PDF
                  </button>
                )}
                {(selected.finalPrice || selected.plans?.length) && (
                  <button className="btn btn-outline btn-sm" onClick={shareProposalLink} disabled={shareBusy}>
                    <i className="fas fa-link" /> {shareBusy ? 'Generando…' : 'Link aceptar'}
                  </button>
                )}
                {selected.status === 'accepted' && selected.stage !== 'activo' && (
                  <button
                    className="btn btn-sm"
                    style={{ background: '#28a745', color: '#fff', border: 'none' }}
                    onClick={() => startProject(selected)}
                    disabled={starting}
                  >
                    <i className="fas fa-rocket" /> {starting ? 'Iniciando...' : 'Iniciar proyecto'}
                  </button>
                )}
                {selected.stage === 'activo' && (
                  <span style={{ fontSize: '0.78rem', color: '#28a745', fontWeight: 600, padding: '6px 10px' }}>
                    <i className="fas fa-check-circle" /> Proyecto activo
                  </span>
                )}
                <button className="modal__close" onClick={() => setSelected(null)}><i className="fas fa-times" /></button>
              </div>
            </div>

            <div className="quote-detail__body">
              {selected.plans?.length === 3 ? (
                <div className="quote-detail__plans">
                  {selected.plans.map((p) => (
                    <div key={p.key} className={`quote-detail__plan ${p.key === 'media' ? 'quote-detail__plan--rec' : ''}`}>
                      <span>{p.label || p.key}</span>
                      <strong>${(p.finalPrice || 0).toLocaleString()} {selected.currency || 'USD'}</strong>
                    </div>
                  ))}
                </div>
              ) : selected.finalPrice ? (
                <div className="quote-detail__price">
                  ${selected.finalPrice.toLocaleString()} {selected.currency || 'USD'}
                </div>
              ) : null}

              {selected.carePlan?.included !== false && (selected.finalPrice || selected.plans?.length) ? (
                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  + Mantenimiento {selected.carePlan?.tier || 'intermedio'} ·{' '}
                  {formatMoney(
                    CARE_PLANS[selected.carePlan?.tier]?.price || selected.carePlan?.price || 55,
                    selected.currency || 'USD',
                    selected.exchangeRate,
                  ).perMonth}
                </p>
              ) : null}

              <div className="quote-detail__grid">
                <div className="quote-detail__field"><label>Tipo</label><span>{selected.projectType}</span></div>
                <div className="quote-detail__field"><label>Estado</label>
                  <span style={{ color: STATUS_COLOR[selected.status], fontWeight: 700 }}>{STATUS_LABEL[selected.status]}</span>
                </div>
                {selected.budget && <div className="quote-detail__field"><label>Presupuesto cliente</label><span>{selected.budget}</span></div>}
                <div className="quote-detail__field"><label>Fecha</label><span>{new Date(selected.createdAt).toLocaleDateString('es-AR')}</span></div>
                {selected.deadline && <div className="quote-detail__field"><label>Entrega</label><span>{selected.deadline} días</span></div>}
                {selected.revisions && <div className="quote-detail__field"><label>Revisiones</label><span>{selected.revisions}</span></div>}
              </div>

              <div className="quote-detail__section">
                <label>Calificación del lead</label>
                <div className="quote-status-buttons" style={{ marginBottom: 10 }}>
                  {Object.entries(LEAD_SCORE_META).map(([key, meta]) => (
                    <button
                      key={key}
                      type="button"
                      className={`quote-status-btn ${selected.leadScore === key ? 'quote-status-btn--active' : ''}`}
                      style={{ '--c': meta.color }}
                      onClick={() => setLeadScore(key)}
                    >
                      {meta.emoji} {meta.label}
                    </button>
                  ))}
                </div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Acción sugerida:{' '}
                  <strong>{SUGGESTED_ACTION_LABEL[selected.suggestedAction] || selected.suggestedAction || '—'}</strong>
                </p>
                {selected.leadScoreReasons?.length > 0 && (
                  <ul style={{ margin: '8px 0 0', paddingLeft: 18, color: 'var(--text-faint)', fontSize: '0.84rem' }}>
                    {selected.leadScoreReasons.map((r) => <li key={r}>{r}</li>)}
                  </ul>
                )}
                {selected.acceptToken && (
                  <p style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                    Link público: <a href={`/propuesta/${selected.acceptToken}`} target="_blank" rel="noreferrer">/propuesta/{selected.acceptToken.slice(0, 8)}…</a>
                  </p>
                )}
                {selected.acceptance?.acceptedAt && (
                  <p style={{ marginTop: 8, fontSize: '0.84rem', color: '#22c55e' }}>
                    Aceptada el {new Date(selected.acceptance.acceptedAt).toLocaleString('es-AR')}
                    {selected.acceptance.selectedPlan ? ` · plan ${selected.acceptance.selectedPlan}` : ''}
                  </p>
                )}
                {selected.status === 'accepted' && selected.acceptToken && (
                  <p style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Contrato:{' '}
                    {selected.contract?.acceptedAt ? 'aceptado' : 'pendiente'} ·{' '}
                    <a href={`/contrato/${selected.acceptToken}`} target="_blank" rel="noreferrer">abrir</a>
                    {' · '}Onboarding:{' '}
                    {selected.onboarding?.submittedAt ? 'enviado' : 'pendiente'} ·{' '}
                    <a href={`/onboarding/${selected.acceptToken}`} target="_blank" rel="noreferrer">abrir</a>
                  </p>
                )}
              </div>

              <div className="quote-detail__section">
                <label>Discovery / reunión</label>
                <div className="grid-2" style={{ gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Fecha / horario</label>
                    <input
                      className="form-control"
                      placeholder="Ej: martes 10:00"
                      value={discoveryDraft.scheduledAt}
                      onChange={(e) => setDiscoveryDraft((d) => ({ ...d, scheduledAt: e.target.value }))}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                      <input
                        type="checkbox"
                        checked={discoveryDraft.done}
                        onChange={(e) => setDiscoveryDraft((d) => ({ ...d, done: e.target.checked }))}
                      />
                      Reunión hecha
                    </label>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 10 }}>
                  <label className="form-label">Notas</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Alcance, dudas, próximos pasos…"
                    value={discoveryDraft.notes}
                    onChange={(e) => setDiscoveryDraft((d) => ({ ...d, notes: e.target.value }))}
                  />
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={saveDiscovery}>
                  Guardar discovery
                </button>
              </div>

              <div className="quote-detail__grid">
                {selected.business && <div className="quote-detail__field"><label>Negocio</label><span>{selected.business}</span></div>}
                {selected.objective && <div className="quote-detail__field"><label>Objetivo</label><span>{selected.objective}</span></div>}
                {selected.audience && <div className="quote-detail__field"><label>Público</label><span>{selected.audience}</span></div>}
                {selected.launchDate && <div className="quote-detail__field"><label>Fecha ideal</label><span>{selected.launchDate}</span></div>}
                {selected.presence && <div className="quote-detail__field"><label>Presencia online</label><span>{selected.presence}</span></div>}
                {selected.servicesProducts && <div className="quote-detail__field"><label>Servicios/productos</label><span>{selected.servicesProducts}</span></div>}
              </div>

              {selected.need && (
                <div className="quote-detail__section">
                  <label>Problema / necesidad</label>
                  <p>{selected.need}</p>
                </div>
              )}

              {selected.description && (
                <div className="quote-detail__section">
                  <label>Detalle del cliente</label>
                  <p>{selected.description}</p>
                </div>
              )}

              {selected.requestedFeatures?.length > 0 && (
                <div className="quote-detail__section">
                  <label>Funcionalidades pedidas</label>
                  <p>{selected.requestedFeatures.join(' · ')}</p>
                </div>
              )}

              {selected.infra && Object.values(selected.infra).some(Boolean) && (
                <div className="quote-detail__section">
                  <label>Infraestructura actual</label>
                  <p>
                    {Object.entries(selected.infra)
                      .filter(([, v]) => v)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')}
                  </p>
                </div>
              )}

              {selected.needs && Object.values(selected.needs).some(Boolean) && (
                <div className="quote-detail__section">
                  <label>Necesidades extra</label>
                  <p>
                    {Object.entries(selected.needs)
                      .filter(([, v]) => v)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')}
                  </p>
                </div>
              )}

              {selected.successMetric && (
                <div className="quote-detail__section">
                  <label>Éxito / KPI</label>
                  <p>{selected.successMetric}</p>
                </div>
              )}

              {selected.outOfScope && (
                <div className="quote-detail__section">
                  <label>Fuera de alcance</label>
                  <p>{selected.outOfScope}</p>
                </div>
              )}

              {selected.references && (
                <div className="quote-detail__section">
                  <label>Referencias</label>
                  <p>{selected.references}</p>
                </div>
              )}

              {selected.aiProposal && (
                <div className="quote-detail__section">
                  <label>Borrador del asistente (interno — no enviado al cliente)</label>
                  <p><strong>{selected.aiProposal.headline}</strong></p>
                  {selected.aiProposal.whyItFits && <p>{selected.aiProposal.whyItFits}</p>}
                  {selected.aiProposal.howItWorks && (
                    <>
                      <label style={{ display: 'block', marginTop: 12 }}>Cómo se lleva a cabo</label>
                      <p>{selected.aiProposal.howItWorks}</p>
                    </>
                  )}
                  {selected.aiProposal.considerations?.length > 0 && (
                    <>
                      <label style={{ display: 'block', marginTop: 12 }}>Qué hay que tener en cuenta</label>
                      <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {selected.aiProposal.considerations.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--text-faint)' }}>
                    Revisá el wizard, ajustá lo que haga falta y guardá. Recién ahí queda cotizado para enviar.
                  </p>
                </div>
              )}

              {selected.features?.length > 0 && (
                <div className="quote-detail__section">
                  <label>Funcionalidades ({selected.features.length})</label>
                  <div className="quote-detail__features">
                    {selected.features.map((f, i) => <span key={i} className="tag">{f.name}</span>)}
                  </div>
                </div>
              )}

              {selected.adminNotes && (
                <div className="quote-detail__section">
                  <label>Notas internas</label>
                  <p>{selected.adminNotes}</p>
                </div>
              )}

              <div className="quote-detail__section">
                <label>Cambiar estado</label>
                <div className="quote-status-buttons">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      className={`quote-status-btn ${selected.status === s ? 'quote-status-btn--active' : ''}`}
                      style={{ '--c': STATUS_COLOR[s] }}
                      onClick={() => updateStatus(selected._id, s)}
                    >{STATUS_LABEL[s]}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-danger btn-sm" onClick={() => deleteQuote(selected._id)}>
                  <i className="fas fa-trash" /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="quote-detail quote-detail--empty">
            <i className="fas fa-envelope-open-text" />
            <p>Seleccioná una cotización para ver el detalle</p>
          </div>
        )}
      </div>

      {/* ── WIZARD OVERLAY ─────────────────────────────────────────────────── */}
      {wizardOpen && selected && (
        <div className="wizard-overlay">
          <div className="wizard">

            {/* Header */}
            <div className="wizard__header">
              <div>
                <h2 className="wizard__title">Generador de cotización</h2>
                <p className="wizard__sub">{selected.clientName} — {selected.projectType}</p>
              </div>
              <button className="modal__close" onClick={closeWizard}><i className="fas fa-times" /></button>
            </div>

            {selected.aiProposal && (
              <div className="wizard-ai-banner">
                <i className="fas fa-robot" />
                <span>
                  Borrador del asistente según el brief. Revisá precios y texto. Guardar aprueba la cotización; el cliente no ve nada hasta que la envíes.
                </span>
              </div>
            )}

            {/* Progress */}
            <div className="wizard__progress">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className={`wizard__step ${i <= step ? 'wizard__step--done' : ''} ${i === step ? 'wizard__step--active' : ''}`} onClick={() => i < step && setStep(i)}>
                  <div className="wizard__step-dot">{i < step ? <i className="fas fa-check" /> : i + 1}</div>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="wizard__body">

              {/* STEP 0 — Cliente */}
              {step === 0 && (
                <div className="wizard-step-content">
                  <h3 className="wstep-title">Datos del cliente</h3>
                  <div className="wform-grid">
                    <div className="form-group">
                      <label className="form-label">Cliente</label>
                      <input className="form-control" value={selected.clientName} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-control" value={selected.email} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nombre del proyecto</label>
                      <input className="form-control" placeholder="Ej: Sitio web institucional" value={wd.projectName} onChange={e => setWd(w => ({ ...w, projectName: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tipo de proyecto</label>
                      <input className="form-control" value={selected.projectType} disabled />
                    </div>
                    {selected.description && (
                      <div className="form-group wform-full">
                        <label className="form-label">Descripción del cliente</label>
                        <textarea className="form-control" rows={3} value={selected.description} disabled />
                      </div>
                    )}
                    <div className="form-group wform-full">
                      <label className="form-label">Notas internas</label>
                      <textarea className="form-control" rows={2} placeholder="Notas para vos (no aparecen en el PDF)" value={wd.adminNotes} onChange={e => setWd(w => ({ ...w, adminNotes: e.target.value }))} />
                    </div>

                    {/* Logo del cliente */}
                    <div className="form-group wform-full">
                      <label className="form-label">Logo del cliente <small style={{color:'var(--text-faint)',fontWeight:400}}>(aparece en el PDF)</small></label>
                      <div className="wlogo-upload">
                        {wd.clientLogo ? (
                          <div className="wlogo-preview">
                            <img src={wd.clientLogo} alt="Logo" />
                            <button className="btn-icon-remove" onClick={() => setWd(w => ({ ...w, clientLogo: '' }))}>
                              <i className="fas fa-times" /> Quitar
                            </button>
                          </div>
                        ) : (
                          <label className="wlogo-drop">
                            <i className="fas fa-image" />
                            <span>Subir logo (PNG, JPG, SVG)</span>
                            <input
                              type="file" accept="image/*" style={{ display: 'none' }}
                              onChange={e => {
                                const file = e.target.files[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = ev => setWd(w => ({ ...w, clientLogo: ev.target.result }))
                                reader.readAsDataURL(file)
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1 — 3 planes */}
              {step === 1 && (
                <div className="wizard-step-content">
                  <div className="wfeatures-header">
                    <h3 className="wstep-title">Tipo de proyecto y planes</h3>
                    <div className="wtier-actions">
                      <button type="button" className="btn btn-outline btn-sm" onClick={resetTemplates}>
                        Restaurar plantillas
                      </button>
                    </div>
                  </div>

                  <div className="wcategory-box">
                    <label className="form-label">Categoría (catálogo 2026)</label>
                    <div className="wcategory-grid">
                      {Object.values(PROJECT_CATEGORIES).map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          className={`wcategory-card ${wd.projectCategory === cat.key ? 'wcategory-card--on' : ''}`}
                          onClick={() => setProjectCategory(cat.key)}
                        >
                          <strong>{cat.label}</strong>
                          <small>{formatPriceRange(cat.tiers.media.priceRange)}</small>
                        </button>
                      ))}
                    </div>
                    <p className="wtier-hint"><b>¿Es esto para vos?</b> {activeCategory.fitFor}</p>
                    <p className="wtier-hint" style={{ marginTop: 4 }}>{activeCategory.notFor}</p>
                    {selected && (
                      <p className="wtier-hint" style={{ marginTop: 8, color: 'var(--primary)' }}>
                        Sugerencia del brief: {detectCategory(selected).replace('_', ' ')} → plan {TIER_META[suggestRecommendation(selected).plan]?.label}
                      </p>
                    )}
                  </div>

                  <p className="wtier-hint" style={{ marginTop: 14 }}>
                    Tres planes (Básico / Intermedio / Premium). Tocá una tarjeta para editar add-ons y usá “Recomendar esta” para el PDF.
                  </p>

                  <div className="wtier-cards">
                    {pricedPlans.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        className={`wtier-card ${wd.activeTier === p.key ? 'wtier-card--on' : ''} ${p.recommended ? 'wtier-card--rec' : ''}`}
                        onClick={() => setWd(w => ({ ...w, activeTier: p.key }))}
                      >
                        {p.recommended && <span className="wtier-rec">Recomendada al cliente</span>}
                        <strong>{p.label}</strong>
                        <small>{p.tagline}</small>
                        <em>{fmt(p.final, '$')} {wd.currency}</em>
                        <span>{formatPriceRange(p.priceRange || [p.final, p.final])}</span>
                        <span>{p.features.length + p.customFeatures.length} ítems · {p.deadline} días</span>
                        <span
                          className="wtier-pick"
                          onClick={(e) => {
                            e.stopPropagation()
                            setWd(w => ({ ...w, recommendedPlan: p.key, activeTier: p.key }))
                          }}
                        >
                          {p.recommended ? 'Esta es la recomendada' : 'Recomendar esta'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="wfeatures-header" style={{ marginTop: 18 }}>
                    <h4 className="wstep-title" style={{ fontSize: '1rem' }}>Add-ons del plan {TIER_META[wd.activeTier].label}</h4>
                    <span className="wbadge">Base catálogo · {fmt(activePlan.fixedPrice || base, '$')} USD + extras</span>
                  </div>

                  <div className="wcat-grid">
                    {Object.entries(CATALOG).map(([cat, items]) => (
                      <div key={cat} className="wcat-card">
                        <div className="wcat-label">{cat}</div>
                        {items.map(item => (
                          <div
                            key={item.name}
                            className={`wfeat-item ${isFeatureSelected(item.name) ? 'wfeat-item--on' : ''}`}
                            onClick={() => toggleFeature(item.name, item.price, cat)}
                          >
                            <div className="wfeat-check">{isFeatureSelected(item.name) && <i className="fas fa-check" />}</div>
                            <span className="wfeat-name">{item.name}</span>
                            <span className="wfeat-price">${item.price}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="wcustom-section">
                    <div className="wcat-label">Funcionalidad personalizada ({TIER_META[wd.activeTier].label})</div>
                    <div className="wcustom-row">
                      <input className="form-control" placeholder="Nombre" value={customName} onChange={e => setCustomName(e.target.value)} />
                      <input className="form-control" type="number" placeholder="$ USD" value={customPrice} onChange={e => setCustomPrice(e.target.value)} style={{ width: 120 }} />
                      <button className="btn btn-outline btn-sm" onClick={addCustom}><i className="fas fa-plus" /> Agregar</button>
                    </div>
                    {activePlan.customFeatures.length > 0 && (
                      <div className="wcustom-list">
                        {activePlan.customFeatures.map((f, i) => (
                          <div key={i} className="wcustom-item">
                            <span>{f.name}</span>
                            <span style={{ color: 'var(--primary)' }}>${f.price}</span>
                            <button className="btn-icon-remove" onClick={() => removeCustom(i)}><i className="fas fa-times" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2 — Precio */}
              {step === 2 && (
                <div className="wizard-step-content">
                  <h3 className="wstep-title">Configurar precio</h3>

                  <div className="wprice-grid">
                    {/* Descuento */}
                    <div className="wslider-group">
                      <div className="wslider-header">
                        <label className="form-label">Descuento</label>
                        <span className="wslider-val">{wd.discount}%</span>
                      </div>
                      <input type="range" min={0} max={40} step={5} value={wd.discount} onChange={e => setWd(w => ({ ...w, discount: +e.target.value }))} />
                    </div>

                    {/* Margen */}
                    <div className="wslider-group">
                      <div className="wslider-header">
                        <label className="form-label">Margen extra</label>
                        <span className="wslider-val">{wd.margin}%</span>
                      </div>
                      <input type="range" min={0} max={50} step={5} value={wd.margin} onChange={e => setWd(w => ({ ...w, margin: +e.target.value }))} />
                    </div>

                    {/* Entrega */}
                    <div className="wslider-group">
                      <div className="wslider-header">
                        <label className="form-label">Entrega</label>
                        <span className="wslider-val">{activePlan.deadline} días</span>
                      </div>
                      <input type="range" min={7} max={120} step={7} value={activePlan.deadline} onChange={e => setWd(w => ({
                        ...w,
                        plans: { ...w.plans, [w.activeTier]: { ...w.plans[w.activeTier], deadline: +e.target.value } },
                      }))} />
                    </div>

                    {/* Revisiones */}
                    <div className="wslider-group">
                      <div className="wslider-header">
                        <label className="form-label">Revisiones</label>
                        <span className="wslider-val">{activePlan.revisions}</span>
                      </div>
                      <input type="range" min={1} max={10} value={activePlan.revisions} onChange={e => setWd(w => ({
                        ...w,
                        plans: { ...w.plans, [w.activeTier]: { ...w.plans[w.activeTier], revisions: +e.target.value } },
                      }))} />
                    </div>
                  </div>

                  {/* Urgencia */}
                  <div className="form-group">
                    <label className="form-label">Urgencia</label>
                    <div className="wurgency-flags">
                      {URGENCY.map(u => (
                        <button
                          key={u.key}
                          className={`wurgency-flag ${wd.urgency === u.key ? 'wurgency-flag--on' : ''}`}
                          onClick={() => setWd(w => ({ ...w, urgency: u.key }))}
                        >{u.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Moneda */}
                  <div className="wprice-grid" style={{ marginTop: 20 }}>
                    <div className="form-group">
                      <label className="form-label">Moneda</label>
                      <select className="form-control" value={wd.currency} onChange={e => setWd(w => ({ ...w, currency: e.target.value }))}>
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tipo de cambio (1 USD = X)</label>
                      <input className="form-control" type="number" value={wd.exchangeRate} onChange={e => setWd(w => ({ ...w, exchangeRate: +e.target.value || 1 }))} />
                    </div>
                  </div>

                  {/* Resumen live */}
                  <label className={`wcare-toggle ${wd.carePlanIncluded ? 'wcare-toggle--on' : ''}`}>
                    <input
                      type="checkbox"
                      checked={wd.carePlanIncluded}
                      onChange={e => setWd(w => ({ ...w, carePlanIncluded: e.target.checked }))}
                    />
                    <div>
                      <strong>Mantenimiento mensual (opcional, siempre ofrecer)</strong>
                      <span>Se cobra aparte del desarrollo. Arranca al publicar. Mínimo {CARE_PLAN.minMonths} meses.</span>
                    </div>
                  </label>

                  {wd.carePlanIncluded && (
                    <div className="wcare-tiers">
                      {Object.values(CARE_PLANS).map((plan) => (
                        <button
                          key={plan.key}
                          type="button"
                          className={`wcare-tier ${wd.carePlanTier === plan.key ? 'wcare-tier--on' : ''}`}
                          onClick={() => setWd(w => ({ ...w, carePlanTier: plan.key }))}
                        >
                          <strong>{plan.label}</strong>
                          <em>{formatMoney(plan.price, wd.currency, wd.exchangeRate).perMonth}</em>
                          <small>{formatPriceRange(plan.priceRange)}</small>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="wprice-summary">
                    {pricedPlans.map((p) => (
                      <div key={p.key} className={`wprice-row ${p.recommended ? 'wprice-row--rec' : ''}`}>
                        <span>{p.label}{p.recommended ? ' · recomendada' : ''}</span>
                        <span>{fmt(p.final, '$')} {wd.currency}</span>
                      </div>
                    ))}
                    <div className="wprice-total"><span>Plan que estás editando ({TIER_META[wd.activeTier].label})</span><span>{fmt(final, sym)}</span></div>
                  </div>
                </div>
              )}

              {/* STEP 3 — Preview */}
              {step === 3 && (
                <div className="wizard-step-content">
                  <h3 className="wstep-title">Vista previa de las 3 opciones</h3>

                  <div className="wpreview-plans">
                    {pricedPlans.map((p) => (
                      <article key={p.key} className={`wpreview-plan ${p.recommended ? 'wpreview-plan--rec' : ''}`}>
                        {p.recommended && <span className="wtier-rec">Recomendada</span>}
                        <h4>{p.label}</h4>
                        <p>{p.tagline}</p>
                        <strong>{fmt(p.final, sym)} {wd.currency}</strong>
                        <small>{p.deadline} días · {p.revisions} revisiones</small>
                        <ul>
                          {[...p.features, ...p.customFeatures].map((f, i) => (
                            <li key={i}>{f.name}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>

                  {wd.carePlanIncluded && (
                    <div className="wcare-preview">
                      <strong>Mantenimiento {careTier.label} · {formatMoney(careTier.price, wd.currency, wd.exchangeRate).perMonth}</strong>
                      <p>{careTier.includes.join(' · ')}</p>
                    </div>
                  )}

                  {recCopy && (
                    <div className="wrec-copy wrec-copy--edit">
                      <div className="wfeatures-header">
                        <h4 className="wstep-title" style={{ fontSize: '1rem', margin: 0 }}>
                          Texto de la propuesta
                          {wd.proposalDirty ? <span className="wrec-dirty"> · editado</span> : null}
                        </h4>
                        <div className="wrec-actions">
                          <button type="button" className="btn btn-outline btn-sm" onClick={resetProposalCopy}>
                            Restablecer
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              const text = [
                                recCopy.headline,
                                recCopy.intro,
                                ...(recCopy.sections || []).map((s) => `${s.title}\n${s.body}`),
                                'Preguntas frecuentes',
                                ...(recCopy.faqs || []).map((f) => `${f.q}\n${f.a}`),
                              ].join('\n\n')
                              navigator.clipboard.writeText(text)
                              notify('Texto copiado para WhatsApp o mail')
                            }}
                          >
                            Copiar texto
                          </button>
                        </div>
                      </div>
                      <p className="wtier-hint" style={{ marginBottom: 12 }}>
                        Editá lo que haga falta. Se guarda con la cotización y se usa en el PDF.
                      </p>

                      <label className="wrec-field">
                        Título
                        <input
                          className="form-control"
                          value={recCopy.headline || ''}
                          onChange={(e) => patchProposal({ headline: e.target.value })}
                        />
                      </label>
                      <label className="wrec-field">
                        Intro
                        <textarea
                          className="form-control"
                          rows={3}
                          value={recCopy.intro || ''}
                          onChange={(e) => patchProposal({ intro: e.target.value })}
                        />
                      </label>

                      {(recCopy.sections || []).map((s, i) => (
                        <div key={`sec-${i}`} className="wrec-block wrec-block--edit">
                          <label className="wrec-field">
                            Sección {i + 1} — título
                            <input
                              className="form-control"
                              value={s.title || ''}
                              onChange={(e) => patchProposalSection(i, 'title', e.target.value)}
                            />
                          </label>
                          <label className="wrec-field">
                            Texto
                            <textarea
                              className="form-control"
                              rows={3}
                              value={s.body || ''}
                              onChange={(e) => patchProposalSection(i, 'body', e.target.value)}
                            />
                          </label>
                        </div>
                      ))}

                      <h5 className="wrec-faq-title">Preguntas frecuentes</h5>
                      <div className="wrec-faqs">
                        {(recCopy.faqs || []).map((f, i) => (
                          <div key={`faq-${i}`} className="wrec-block wrec-block--edit">
                            <label className="wrec-field">
                              Pregunta
                              <input
                                className="form-control"
                                value={f.q || ''}
                                onChange={(e) => patchProposalFaq(i, 'q', e.target.value)}
                              />
                            </label>
                            <label className="wrec-field">
                              Respuesta
                              <textarea
                                className="form-control"
                                rows={2}
                                value={f.a || ''}
                                onChange={(e) => patchProposalFaq(i, 'a', e.target.value)}
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="wpreview-actions">
                    <button className="btn btn-primary" onClick={handleGeneratePDF}>
                      <i className="fas fa-file-pdf" /> Generar PDF (3 planes)
                    </button>
                    <button className="btn btn-outline" onClick={saveQuote} disabled={saving}>
                      {saving ? 'Guardando...' : <><i className="fas fa-save" /> Guardar cotización</>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer nav */}
            <div className="wizard__footer">
              <button className="btn btn-outline" onClick={() => step === 0 ? closeWizard() : setStep(s => s - 1)}>
                {step === 0 ? 'Cancelar' : '← Atrás'}
              </button>
              {step < 3 ? (
                <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
                  Siguiente →
                </button>
              ) : (
                <button className="btn btn-primary" onClick={saveQuote} disabled={saving}>
                  {saving ? 'Guardando...' : <><i className="fas fa-save" /> Guardar</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}