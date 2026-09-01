import { useState } from 'react'
import api from '../../hooks/useApi'
import {
  BUDGET_OPTIONS,
  EMPTY_INFRA,
  EMPTY_NEEDS,
  FEATURE_OPTIONS,
  INFRA_ANSWERS,
  INFRA_QUESTIONS,
  NEED_FLAGS,
  OBJECTIVES,
  OBJECTIVE_LABEL,
  PRESENCE_OPTIONS,
} from '../../data/quoteBrief'

/** Canales de entrada; los ids tienen que coincidir con MANUAL_SOURCES del backend. */
const SOURCES = [
  { id: 'admin_whatsapp', label: 'WhatsApp' },
  { id: 'admin_instagram', label: 'Instagram' },
  { id: 'admin_llamada', label: 'Llamada' },
  { id: 'admin_email', label: 'Email' },
  { id: 'admin_referido', label: 'Referido' },
  { id: 'admin_otro', label: 'Otro' },
]

const EMPTY_FORM = {
  source: 'admin_whatsapp',
  clientName: '',
  whatsapp: '',
  email: '',
  objective: '',
  business: '',
  need: '',
  budget: '',
  audience: '',
  servicesProducts: '',
  presence: '',
  successMetric: '',
  outOfScope: '',
  launchDate: '',
  references: '',
  requestedFeatures: [],
  infra: { ...EMPTY_INFRA },
  needs: { ...EMPTY_NEEDS },
}

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())

/** Mismo criterio que el formulario público: conserva el + y descarta el resto. */
const formatWhatsApp = (value) => {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  return (trimmed.startsWith('+') ? '+' : '') + trimmed.replace(/[^\d]/g, '')
}

export default function NewQuoteModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [showBrief, setShowBrief] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const setInfra = (key, value) => setForm((f) => ({ ...f, infra: { ...f.infra, [key]: value } }))
  const setNeed = (key, value) => setForm((f) => ({ ...f, needs: { ...f.needs, [key]: value } }))

  const toggleFeature = (id) =>
    setForm((f) => ({
      ...f,
      requestedFeatures: f.requestedFeatures.includes(id)
        ? f.requestedFeatures.filter((x) => x !== id)
        : [...f.requestedFeatures, id],
    }))

  const validate = () => {
    if (!form.clientName.trim()) return 'Poné el nombre del cliente'
    if (!form.objective) return 'Elegí qué necesita el cliente'
    if (!form.whatsapp.trim() && !form.email.trim()) return 'Cargá al menos un WhatsApp o un email'
    if (form.email.trim() && !isEmail(form.email)) return 'El email no parece válido'
    return ''
  }

  const submit = async (e) => {
    e.preventDefault()
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await api.post('/quotes/manual', {
        source: form.source,
        clientName: form.clientName.trim(),
        email: form.email.trim(),
        whatsapp: formatWhatsApp(form.whatsapp),
        projectType: OBJECTIVE_LABEL[form.objective] || form.objective,
        objective: form.objective,
        description: form.need.trim(),
        need: form.need.trim(),
        business: form.business.trim(),
        budget: form.budget,
        audience: form.audience.trim(),
        servicesProducts: form.servicesProducts.trim(),
        presence: form.presence,
        successMetric: form.successMetric.trim(),
        outOfScope: form.outOfScope.trim(),
        launchDate: form.launchDate.trim(),
        references: form.references.trim(),
        requestedFeatures: form.requestedFeatures,
        infra: form.infra,
        needs: form.needs,
      })
      onCreated(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'No pude guardar la cotización')
      setSaving(false)
    }
  }

  return (
    <div className="wizard-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="wizard" onSubmit={submit}>
        <div className="wizard__header">
          <div>
            <h3 className="wizard__title">Nueva cotización</h3>
            <p className="wizard__sub">
              Para cargar a mano un cliente que te escribió por fuera del sitio.
            </p>
          </div>
          <button type="button" className="modal__close" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="wizard__body">
          <div className="wform-grid">
            <div className="form-group">
              <label className="form-label">Cómo llegó</label>
              <select
                className="form-control"
                value={form.source}
                onChange={(e) => set('source', e.target.value)}
              >
                {SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del cliente *</label>
              <input
                className="form-control"
                value={form.clientName}
                onChange={(e) => set('clientName', e.target.value)}
                placeholder="Ej: Martina Gómez"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp</label>
              <input
                className="form-control"
                value={form.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
                placeholder="+54 9 11 5555 5555"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="Lo podés completar después"
              />
            </div>

            <div className="form-group wform-full">
              <label className="form-label">Qué necesita *</label>
              <select
                className="form-control"
                value={form.objective}
                onChange={(e) => set('objective', e.target.value)}
              >
                <option value="">Elegí una opción…</option>
                {OBJECTIVES.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Negocio / rubro</label>
              <input
                className="form-control"
                value={form.business}
                onChange={(e) => set('business', e.target.value)}
                placeholder="Ej: panadería en Caballito"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Presupuesto que mencionó</label>
              <select
                className="form-control"
                value={form.budget}
                onChange={(e) => set('budget', e.target.value)}
              >
                <option value="">Sin definir</option>
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group wform-full">
              <label className="form-label">Lo que te contó</label>
              <textarea
                className="form-control"
                rows={4}
                value={form.need}
                onChange={(e) => set('need', e.target.value)}
                placeholder="Pegá acá lo que te dijo por WhatsApp: qué problema tiene, qué vio, qué le urge…"
              />
            </div>
          </div>

          <button
            type="button"
            className="nq-toggle"
            onClick={() => setShowBrief((v) => !v)}
            aria-expanded={showBrief}
          >
            <i className={`fas fa-chevron-${showBrief ? 'up' : 'down'}`} />
            Resto del brief {showBrief ? '' : '(opcional, si ya lo tenés)'}
          </button>

          {showBrief && (
            <div className="nq-brief">
              <div className="wform-grid">
                <div className="form-group">
                  <label className="form-label">A quién le vende</label>
                  <input
                    className="form-control"
                    value={form.audience}
                    onChange={(e) => set('audience', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Qué vende / ofrece</label>
                  <input
                    className="form-control"
                    value={form.servicesProducts}
                    onChange={(e) => set('servicesProducts', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">¿Ya tiene presencia online?</label>
                  <select
                    className="form-control"
                    value={form.presence}
                    onChange={(e) => set('presence', e.target.value)}
                  >
                    <option value="">Sin datos</option>
                    {PRESENCE_OPTIONS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cuándo quiere lanzar</label>
                  <input
                    className="form-control"
                    value={form.launchDate}
                    onChange={(e) => set('launchDate', e.target.value)}
                    placeholder="Ej: antes de fin de mes"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Qué contaría como éxito</label>
                  <input
                    className="form-control"
                    value={form.successMetric}
                    onChange={(e) => set('successMetric', e.target.value)}
                    placeholder="Ej: 10 consultas por semana"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fuera de alcance</label>
                  <input
                    className="form-control"
                    value={form.outOfScope}
                    onChange={(e) => set('outOfScope', e.target.value)}
                    placeholder="Lo que aclaraste que no entra"
                  />
                </div>
                <div className="form-group wform-full">
                  <label className="form-label">Referencias que te pasó</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.references}
                    onChange={(e) => set('references', e.target.value)}
                    placeholder="Links de sitios que le gustan"
                  />
                </div>
              </div>

              <p className="nq-section">Funciones que va a necesitar</p>
              <div className="nq-chips">
                {FEATURE_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`filter-tab ${form.requestedFeatures.includes(f.id) ? 'filter-tab--active' : ''}`}
                    onClick={() => toggleFeature(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <p className="nq-section">Con qué cuenta hoy</p>
              <div className="wform-grid">
                {INFRA_QUESTIONS.map((q) => (
                  <div className="form-group" key={q.id}>
                    <label className="form-label">{q.label}</label>
                    <select
                      className="form-control"
                      value={form.infra[q.id]}
                      onChange={(e) => setInfra(q.id, e.target.value)}
                    >
                      <option value="">Sin datos</option>
                      {INFRA_ANSWERS.map((a) => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <p className="nq-section">Necesidades extra</p>
              <div className="wform-grid">
                {NEED_FLAGS.map((n) => (
                  <div className="form-group" key={n.id}>
                    <label className="form-label">{n.label}</label>
                    <select
                      className="form-control"
                      value={form.needs[n.id]}
                      onChange={(e) => setNeed(n.id, e.target.value)}
                    >
                      <option value="">Sin datos</option>
                      {INFRA_ANSWERS.map((a) => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="nq-error"><i className="fas fa-circle-exclamation" /> {error}</p>}
        </div>

        <div className="wizard__footer">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? 'Guardando…' : 'Crear y cotizar'}
          </button>
        </div>
      </form>
    </div>
  )
}
