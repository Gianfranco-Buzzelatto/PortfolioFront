import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import api from '../../hooks/useApi'
import { generatePDF, calcPricing } from '../../utils/quotePDF'
import './AdminQuotes.css'

// ── Catálogo ─────────────────────────────────────────────────────────────────
const CATALOG = {
  'Diseño & UI': [
    { name: 'Diseño UI personalizado (Figma)', price: 300 },
    { name: 'Diseño responsivo mobile', price: 150 },
    { name: 'Dark mode / Light mode', price: 80 },
    { name: 'Animaciones y micro-interacciones', price: 120 },
    { name: 'Landing page con hero + secciones', price: 200 },
  ],
  'Páginas & Contenido': [
    { name: 'Hasta 5 páginas', price: 150 },
    { name: 'Páginas adicionales (x5)', price: 100 },
    { name: 'Blog con categorías y etiquetas', price: 180 },
    { name: 'Galería de imágenes / portfolio', price: 120 },
    { name: 'FAQ', price: 60 },
  ],
  'E-commerce': [
    { name: 'Catálogo de productos', price: 250 },
    { name: 'Carrito de compras', price: 200 },
    { name: 'Pasarela de pago (MercadoPago/Stripe)', price: 300 },
    { name: 'Gestión de stock', price: 150 },
    { name: 'Cupones y descuentos', price: 100 },
  ],
  'Usuarios & Auth': [
    { name: 'Registro e inicio de sesión', price: 200 },
    { name: 'Login con Google', price: 150 },
    { name: 'Roles y permisos', price: 180 },
    { name: 'Panel de usuario / dashboard', price: 220 },
    { name: 'Recuperación de contraseña', price: 80 },
  ],
  'Funciones Avanzadas': [
    { name: 'Buscador interno', price: 150 },
    { name: 'Filtros y orden dinámico', price: 120 },
    { name: 'Mapa interactivo (Google Maps)', price: 100 },
    { name: 'Chat / WhatsApp widget', price: 60 },
    { name: 'Multilenguaje (i18n)', price: 200 },
  ],
  'CMS & Admin': [
    { name: 'Panel de administración', price: 350 },
    { name: 'CMS headless', price: 280 },
    { name: 'Editor visual de contenido', price: 180 },
    { name: 'Reportes y analytics', price: 200 },
  ],
  'Integraciones': [
    { name: 'Google Analytics 4', price: 60 },
    { name: 'Email marketing (Mailchimp/Brevo)', price: 120 },
    { name: 'CRM (HubSpot / Zoho)', price: 200 },
    { name: 'API externa personalizada', price: 250 },
    { name: 'Notificaciones push', price: 150 },
  ],
  'Hosting & Deploy': [
    { name: 'Deploy en Vercel / Railway', price: 60 },
    { name: 'Dominio y SSL configurados', price: 50 },
    { name: 'Optimización de velocidad', price: 150 },
    { name: 'SEO técnico básico', price: 120 },
    { name: 'Mantenimiento mensual', price: 100 },
  ],
}

const PROJECT_TYPES = [
  'Landing page', 'Sitio corporativo', 'E-commerce',
  'Web App / SaaS', 'Blog / Revista', 'Portfolio', 'A medida',
]

const STATUS_LABEL = { pending: 'Pendiente', reviewed: 'Revisado', quoted: 'Cotizado', sent: 'Enviado', accepted: 'Aceptado', rejected: 'Rechazado' }
const STATUS_COLOR = { pending: '#ffc107', reviewed: '#17a2b8', quoted: '#6f42c1', sent: '#0d6efd', accepted: '#28a745', rejected: '#dc3545' }
const STATUS_OPTIONS = Object.keys(STATUS_LABEL)

const URGENCY = [
  { key: 'normal',      label: 'Normal',           mult: 1    },
  { key: 'urgente',     label: 'Urgente +15%',      mult: 1.15 },
  { key: 'muy-urgente', label: 'Muy urgente +30%',  mult: 1.30 },
]

const CURRENCIES = ['USD', 'ARS', 'EUR']
const SYM = { USD: '$', ARS: '$', EUR: '€' }
const STEP_LABELS = ['Cliente', 'Funciones', 'Precio', 'Vista previa']

const defaultWizard = () => ({
  // client fields (editable when creating from admin)
  clientName:  '',
  email:       '',
  whatsapp:    '',
  projectType: '',
  description: '',
  // admin fields
  projectName:    '',
  features:       [],
  customFeatures: [],
  discount:     0,
  margin:       0,
  urgency:      'normal',
  deadline:     30,
  revisions:    3,
  currency:     'USD',
  exchangeRate: 1,
  adminNotes:   '',
})

const fmt = (n, sym) => `${sym}${Math.round(n).toLocaleString('es-AR')}`

export default function AdminQuotes() {
  const [quotes, setQuotes]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState('')
  const [toast, setToast]       = useState('')
  const [settings, setSettings] = useState({})

  // Wizard
  const [wizardOpen, setWizardOpen]   = useState(false)
  const [isNew, setIsNew]             = useState(false) // true = crear desde admin
  const [step, setStep]               = useState(0)
  const [wd, setWd]                   = useState(defaultWizard())
  const [customName, setCustomName]   = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [saving, setSaving]           = useState(false)

  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = () => {
    setLoading(true)
    api.get('/quotes').then(r => setQuotes(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {})
  }, [])

  const filtered = filter ? quotes.filter(q => q.status === filter) : quotes

  // ── Abrir wizard sobre un lead existente ──────────────────────────────────
  const openWizardOnLead = (lead) => {
    setSelected(lead)
    setIsNew(false)
    setWd({
      clientName:     lead.clientName  || '',
      email:          lead.email       || '',
      whatsapp:       lead.whatsapp    || '',
      projectType:    lead.projectType || '',
      description:    lead.description || '',
      projectName:    lead.projectName    || '',
      features:       lead.features       || [],
      customFeatures: lead.customFeatures || [],
      discount:       lead.discount     || 0,
      margin:         lead.margin       || 0,
      urgency:        lead.urgency      || 'normal',
      deadline:       lead.deadline     || 30,
      revisions:      lead.revisions    || 3,
      currency:       lead.currency     || 'USD',
      exchangeRate:   lead.exchangeRate || 1,
      adminNotes:     lead.adminNotes   || '',
    })
    setStep(0)
    setWizardOpen(true)
  }

  // ── Abrir wizard en blanco (crear desde admin) ────────────────────────────
  const openWizardNew = () => {
    setSelected(null)
    setIsNew(true)
    setWd(defaultWizard())
    setStep(0)
    setWizardOpen(true)
  }

  const closeWizard = () => { setWizardOpen(false); setStep(0) }

  // ── Features ──────────────────────────────────────────────────────────────
  const isFeatureSelected = name => wd.features.some(f => f.name === name)

  const toggleFeature = (name, price, category) => {
    setWd(w => ({
      ...w,
      features: w.features.some(f => f.name === name)
        ? w.features.filter(f => f.name !== name)
        : [...w.features, { name, price, category }]
    }))
  }

  const addCustom = () => {
    const n = customName.trim()
    const p = parseFloat(customPrice) || 0
    if (!n) return
    setWd(w => ({ ...w, customFeatures: [...w.customFeatures, { name: n, price: p, category: 'Personalizado' }] }))
    setCustomName(''); setCustomPrice('')
  }

  const removeCustom = idx => setWd(w => ({ ...w, customFeatures: w.customFeatures.filter((_, i) => i !== idx) }))

  // ── Pricing ───────────────────────────────────────────────────────────────
  const sym = SYM[wd.currency] || '$'
  const { base, final } = calcPricing(wd)
  const allCount = wd.features.length + wd.customFeatures.length

  // ── Guardar ───────────────────────────────────────────────────────────────
  const saveQuote = async () => {
    if (!wd.clientName || !wd.email || !wd.projectType) {
      notify('Completá nombre, email y tipo de proyecto')
      setStep(0)
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...wd,
        basePrice:  Math.round(base),
        finalPrice: Math.round(final),
        status:     'quoted',
      }
      if (isNew) {
        const r = await api.post('/quotes', payload)
        setSelected(r.data)
        setIsNew(false)
      } else {
        await api.put(`/quotes/${selected._id}`, {
          ...payload,
          status: selected.status === 'pending' ? 'quoted' : selected.status,
        })
      }
      notify('Cotización guardada ✓')
      load()
      closeWizard()
    } catch { notify('Error al guardar') }
    finally { setSaving(false) }
  }

  const handleGeneratePDF = () => {
    const quoteData = isNew
      ? { ...wd, finalPrice: Math.round(final), basePrice: Math.round(base) }
      : { ...selected, ...wd, finalPrice: Math.round(final), basePrice: Math.round(base) }
    generatePDF(quoteData, settings)
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="Cotizaciones">
      {toast && <div className="toast success">{toast}</div>}

      {/* Header con botón nueva cotización */}
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
        <button className="btn btn-primary btn-sm" onClick={openWizardNew}>
          <i className="fas fa-plus" /> Nueva cotización
        </button>
      </div>

      <div className="quotes-layout">
        {/* Lista */}
        <div className="quotes-list">
          {loading ? (
            <div className="ql-loading">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="ql-empty"><i className="fas fa-inbox" /><p>Sin cotizaciones</p></div>
          ) : filtered.map(q => (
            <div key={q._id}
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
                <span className="tag">{q.projectType}</span>
                {q.finalPrice ? <span className="quote-item__price">${q.finalPrice.toLocaleString()} {q.currency || 'USD'}</span> : null}
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
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn btn-primary btn-sm" onClick={() => openWizardOnLead(selected)}>
                  <i className="fas fa-magic" /> {selected.finalPrice ? 'Editar' : 'Cotizar'}
                </button>
                {selected.finalPrice && (
                  <button className="btn btn-outline btn-sm" onClick={() => generatePDF(selected, settings)}>
                    <i className="fas fa-file-pdf" /> PDF
                  </button>
                )}
                <button className="modal__close" onClick={() => setSelected(null)}><i className="fas fa-times" /></button>
              </div>
            </div>

            <div className="quote-detail__body">
              {selected.finalPrice && (
                <div className="quote-detail__price">${selected.finalPrice.toLocaleString()} {selected.currency || 'USD'}</div>
              )}

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

              {selected.description && (
                <div className="quote-detail__section"><label>Descripción</label><p>{selected.description}</p></div>
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
                <div className="quote-detail__section"><label>Notas internas</label><p>{selected.adminNotes}</p></div>
              )}

              <div className="quote-detail__section">
                <label>Cambiar estado</label>
                <div className="quote-status-buttons">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s}
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

      {/* ── WIZARD ────────────────────────────────────────────────────────── */}
      {wizardOpen && (
        <div className="wizard-overlay">
          <div className="wizard">

            <div className="wizard__header">
              <div>
                <h2 className="wizard__title">{isNew ? 'Nueva cotización' : 'Editar cotización'}</h2>
                {!isNew && selected && <p className="wizard__sub">{selected.clientName} — {selected.projectType}</p>}
              </div>
              <button className="modal__close" onClick={closeWizard}><i className="fas fa-times" /></button>
            </div>

            {/* Progress */}
            <div className="wizard__progress">
              {STEP_LABELS.map((label, i) => (
                <div key={i}
                  className={`wizard__step ${i < step ? 'wizard__step--done' : ''} ${i === step ? 'wizard__step--active' : ''}`}
                  onClick={() => i < step && setStep(i)}
                >
                  <div className="wizard__step-dot">{i < step ? <i className="fas fa-check" /> : i + 1}</div>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="wizard__body">

              {/* STEP 0 — Cliente */}
              {step === 0 && (
                <div className="wizard-step-content">
                  <h3 className="wstep-title">Datos del cliente</h3>
                  <div className="wform-grid">
                    <div className="form-group">
                      <label className="form-label">Nombre / Empresa *</label>
                      <input className="form-control" placeholder="Ej: Café El Refugio"
                        value={wd.clientName}
                        onChange={e => setWd(w => ({ ...w, clientName: e.target.value }))}
                        disabled={!isNew && !!selected?.clientName}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input className="form-control" type="email" placeholder="cliente@email.com"
                        value={wd.email}
                        onChange={e => setWd(w => ({ ...w, email: e.target.value }))}
                        disabled={!isNew && !!selected?.email}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">WhatsApp</label>
                      <input className="form-control" placeholder="+54 9 11 ..."
                        value={wd.whatsapp}
                        onChange={e => setWd(w => ({ ...w, whatsapp: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tipo de proyecto *</label>
                      {isNew ? (
                        <select className="form-control" value={wd.projectType}
                          onChange={e => setWd(w => ({ ...w, projectType: e.target.value }))}>
                          <option value="">Seleccioná una opción</option>
                          {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ) : (
                        <input className="form-control" value={wd.projectType} disabled />
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nombre del proyecto</label>
                      <input className="form-control" placeholder="Ej: Sitio web institucional"
                        value={wd.projectName}
                        onChange={e => setWd(w => ({ ...w, projectName: e.target.value }))}
                      />
                    </div>
                    <div className="form-group wform-full">
                      <label className="form-label">Descripción</label>
                      <textarea className="form-control" rows={3}
                        placeholder="Descripción del proyecto..."
                        value={wd.description}
                        onChange={e => setWd(w => ({ ...w, description: e.target.value }))}
                        disabled={!isNew && !!selected?.description}
                      />
                    </div>
                    <div className="form-group wform-full">
                      <label className="form-label">Notas internas <small style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(no aparecen en el PDF)</small></label>
                      <textarea className="form-control" rows={2}
                        placeholder="Notas solo para vos..."
                        value={wd.adminNotes}
                        onChange={e => setWd(w => ({ ...w, adminNotes: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1 — Funcionalidades */}
              {step === 1 && (
                <div className="wizard-step-content">
                  <div className="wfeatures-header">
                    <h3 className="wstep-title">Funcionalidades</h3>
                    <span className="wbadge">{allCount} seleccionadas · {fmt(base, '$')} USD base</span>
                  </div>

                  <div className="wcat-grid">
                    {Object.entries(CATALOG).map(([cat, items]) => (
                      <div key={cat} className="wcat-card">
                        <div className="wcat-label">{cat}</div>
                        {items.map(item => (
                          <div key={item.name}
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
                    <div className="wcat-label">Funcionalidad personalizada</div>
                    <div className="wcustom-row">
                      <input className="form-control" placeholder="Nombre de la función"
                        value={customName} onChange={e => setCustomName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustom()}
                      />
                      <input className="form-control" type="number" placeholder="$ USD"
                        value={customPrice} onChange={e => setCustomPrice(e.target.value)}
                        style={{ width: 120 }}
                      />
                      <button className="btn btn-outline btn-sm" onClick={addCustom}><i className="fas fa-plus" /> Agregar</button>
                    </div>
                    {wd.customFeatures.length > 0 && (
                      <div className="wcustom-list">
                        {wd.customFeatures.map((f, i) => (
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
                    <div className="wslider-group">
                      <div className="wslider-header">
                        <label className="form-label">Descuento</label>
                        <span className="wslider-val">{wd.discount}%</span>
                      </div>
                      <input type="range" min={0} max={40} step={5} value={wd.discount}
                        onChange={e => setWd(w => ({ ...w, discount: +e.target.value }))} />
                    </div>
                    <div className="wslider-group">
                      <div className="wslider-header">
                        <label className="form-label">Margen extra</label>
                        <span className="wslider-val">{wd.margin}%</span>
                      </div>
                      <input type="range" min={0} max={50} step={5} value={wd.margin}
                        onChange={e => setWd(w => ({ ...w, margin: +e.target.value }))} />
                    </div>
                    <div className="wslider-group">
                      <div className="wslider-header">
                        <label className="form-label">Entrega</label>
                        <span className="wslider-val">{wd.deadline} días</span>
                      </div>
                      <input type="range" min={7} max={120} step={7} value={wd.deadline}
                        onChange={e => setWd(w => ({ ...w, deadline: +e.target.value }))} />
                    </div>
                    <div className="wslider-group">
                      <div className="wslider-header">
                        <label className="form-label">Revisiones</label>
                        <span className="wslider-val">{wd.revisions}</span>
                      </div>
                      <input type="range" min={1} max={10} value={wd.revisions}
                        onChange={e => setWd(w => ({ ...w, revisions: +e.target.value }))} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Urgencia</label>
                    <div className="wurgency-flags">
                      {URGENCY.map(u => (
                        <button key={u.key}
                          className={`wurgency-flag ${wd.urgency === u.key ? 'wurgency-flag--on' : ''}`}
                          onClick={() => setWd(w => ({ ...w, urgency: u.key }))}
                        >{u.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="wprice-grid" style={{ marginTop: 20 }}>
                    <div className="form-group">
                      <label className="form-label">Moneda</label>
                      <select className="form-control" value={wd.currency}
                        onChange={e => setWd(w => ({ ...w, currency: e.target.value }))}>
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tipo de cambio (1 USD = X)</label>
                      <input className="form-control" type="number" value={wd.exchangeRate}
                        onChange={e => setWd(w => ({ ...w, exchangeRate: +e.target.value || 1 }))} />
                    </div>
                  </div>

                  <div className="wprice-summary">
                    <div className="wprice-row"><span>Precio base</span><span>{fmt(base, '$')} USD</span></div>
                    {wd.discount > 0 && <div className="wprice-row wprice-row--discount"><span>Descuento ({wd.discount}%)</span><span>− {fmt(base * wd.discount / 100, '$')} USD</span></div>}
                    {wd.margin > 0 && <div className="wprice-row"><span>Margen ({wd.margin}%)</span><span>+ {fmt(base * (1 - wd.discount / 100) * wd.margin / 100, '$')} USD</span></div>}
                    <div className="wprice-total"><span>Total ({wd.currency})</span><span>{fmt(final, sym)}</span></div>
                  </div>
                </div>
              )}

              {/* STEP 3 — Preview */}
              {step === 3 && (
                <div className="wizard-step-content">
                  <h3 className="wstep-title">Vista previa</h3>

                  <div className="wpreview-card">
                    <div className="wpreview-header">
                      <div>
                        <div className="wpreview-client">{wd.clientName}</div>
                        <div className="wpreview-project">{wd.projectName || wd.projectType}</div>
                      </div>
                      <div className="wpreview-total">
                        <div className="wpreview-total-label">Total</div>
                        <div className="wpreview-total-amount">{fmt(final, sym)}</div>
                        <div className="wpreview-total-cur">{wd.currency}</div>
                      </div>
                    </div>

                    <div className="wpreview-meta">
                      <div><span>{wd.deadline} días</span><small>Entrega</small></div>
                      <div><span>{wd.revisions}</span><small>Revisiones</small></div>
                      <div><span>{allCount}</span><small>Funcionalidades</small></div>
                      <div><span>{wd.discount > 0 ? `${wd.discount}%` : '—'}</span><small>Descuento</small></div>
                    </div>

                    {allCount > 0 && (
                      <div className="wpreview-features">
                        <div className="wcat-label">Funcionalidades incluidas</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                          {[...wd.features, ...wd.customFeatures].map((f, i) => (
                            <span key={i} className="tag">{f.name} · {fmt(f.price * wd.exchangeRate, sym)}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="wpreview-actions">
                    <button className="btn btn-primary" onClick={handleGeneratePDF}>
                      <i className="fas fa-file-pdf" /> Generar PDF
                    </button>
                    <button className="btn btn-outline" onClick={saveQuote} disabled={saving}>
                      {saving ? 'Guardando...' : <><i className="fas fa-save" /> Guardar cotización</>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="wizard__footer">
              <button className="btn btn-outline" onClick={() => step === 0 ? closeWizard() : setStep(s => s - 1)}>
                {step === 0 ? 'Cancelar' : '← Atrás'}
              </button>
              {step < 3 ? (
                <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Siguiente →</button>
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
