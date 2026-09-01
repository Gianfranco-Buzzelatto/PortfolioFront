import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../hooks/useApi'
import { useSettings } from '../context/SettingsContext'
import { whatsappHref } from '../utils/whatsapp'
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
} from '../data/quoteBrief'
import { scrollToId } from '../components/ScrollToHash'
import Seo from '../seo/Seo'
import './Quote.css'

const TOTAL_STEPS = 5

const EMPTY_FORM = {
  objective: '',
  business: '',
  need: '',
  audience: '',
  servicesProducts: '',
  details: '',
  requestedFeatures: [],
  infra: { ...EMPTY_INFRA },
  needs: { ...EMPTY_NEEDS },
  successMetric: '',
  outOfScope: '',
  presence: '',
  budget: '',
  launchDate: '',
  references: '',
  name: '',
  email: '',
  whatsapp: '',
}

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
const onlyDigits = (value) => String(value || '').replace(/[^\d]/g, '')
const formatWhatsApp = (value) => {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  const hasPlus = trimmed.startsWith('+')
  const digits = onlyDigits(trimmed)
  return (hasPlus ? '+' : '') + digits
}

const STEP_META = [
  { label: 'Objetivo', sub: 'Qué necesitás lograr con el proyecto.' },
  { label: 'Negocio', sub: 'Rubro, problema y a quién le hablás.' },
  { label: 'Funciones', sub: 'Marcá lo que creés que vas a necesitar.' },
  { label: 'Situación', sub: 'Infraestructura, presupuesto y plazos.' },
  { label: 'Contacto', sub: 'Cómo te escribo la propuesta.' },
]

export default function Quote() {
  const settings = useSettings()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [touched, setTouched] = useState({})

  // Tras enviar (o al cambiar de paso), subir el scroll: Lenis deja la vista abajo.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => scrollToId('', 'smooth'))
    return () => window.cancelAnimationFrame(frame)
  }, [submitted, step])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setInfra = (key, value) => setForm((f) => ({ ...f, infra: { ...f.infra, [key]: value } }))
  const setNeed = (key, value) => setForm((f) => ({ ...f, needs: { ...f.needs, [key]: value } }))

  const toggleFeature = (id) => {
    setForm((f) => {
      const has = f.requestedFeatures.includes(id)
      return {
        ...f,
        requestedFeatures: has
          ? f.requestedFeatures.filter((x) => x !== id)
          : [...f.requestedFeatures, id],
      }
    })
  }

  const errors = useMemo(() => {
    const e = {}
    if (!form.objective) e.objective = 'Elegí una opción para poder orientarte.'
    if (!form.business.trim()) e.business = 'Este dato me ayuda a entender tu rubro.'
    if (!form.need.trim()) e.need = 'Contame el problema o la necesidad principal.'
    if (!form.name.trim()) e.name = 'Escribí tu nombre.'
    if (!form.email.trim()) e.email = 'Escribí tu email.'
    else if (!isEmail(form.email)) e.email = 'Revisá el email.'
    if (!onlyDigits(form.whatsapp).trim()) e.whatsapp = 'Dejá un WhatsApp para coordinar.'
    return e
  }, [form])

  const canStep = {
    1: !errors.objective,
    2: !errors.business && !errors.need,
    3: true,
    4: true,
    5: !errors.name && !errors.email && !errors.whatsapp,
  }

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  const prev = () => setStep((s) => Math.max(1, s - 1))

  const markTouched = (keys) => {
    setTouched((t) => {
      const nextT = { ...t }
      keys.forEach((k) => { nextT[k] = true })
      return nextT
    })
  }

  const handleNext = () => {
    if (step === 1) {
      markTouched(['objective'])
      if (!canStep[1]) return
      next()
      return
    }
    if (step === 2) {
      markTouched(['business', 'need'])
      if (!canStep[2]) return
      next()
      return
    }
    next()
  }

  const resetForm = () => {
    setSubmitted(false)
    setStep(1)
    setTouched({})
    setSubmitError('')
    setForm({
      ...EMPTY_FORM,
      infra: { ...EMPTY_INFRA },
      needs: { ...EMPTY_NEEDS },
      requestedFeatures: [],
    })
  }

  const handleSubmit = async () => {
    markTouched(['name', 'email', 'whatsapp'])
    if (!canStep[5]) return

    setSubmitting(true)
    setSubmitError('')
    try {
      await api.post('/quotes', {
        clientName: form.name.trim(),
        email: form.email.trim(),
        whatsapp: formatWhatsApp(form.whatsapp),
        projectType: OBJECTIVE_LABEL[form.objective] || form.objective,
        description: form.details.trim() || form.need.trim(),
        budget: form.budget,
        objective: form.objective,
        business: form.business.trim(),
        presence: form.presence,
        need: form.need.trim(),
        audience: form.audience.trim(),
        servicesProducts: form.servicesProducts.trim(),
        requestedFeatures: form.requestedFeatures,
        infra: form.infra,
        needs: form.needs,
        successMetric: form.successMetric.trim(),
        outOfScope: form.outOfScope.trim(),
        launchDate: form.launchDate.trim(),
        references: form.references.trim(),
        source: 'portfolio_onboarding',
      })
      setSubmitted(true)
    } catch (err) {
      const msg = err.response?.data?.message
      setSubmitError(msg || 'No pude enviar el formulario ahora. Probá de nuevo o escribinme por WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="quote-page">
        <Seo
          title="Solicitud enviada"
          description="Recibimos tu brief. Te armamos una propuesta personalizada en 24–48 hs hábiles."
          path="/cotizar"
          noindex
        />
        <section className="page-hero texture-bg">
          <div className="container page-hero__content">
            <p className="section-label">Listo</p>
            <h1 className="page-hero__title">¡Gracias!</h1>
            <p className="page-hero__sub">
              Con este brief ya puedo orientarte mejor. Te preparo una propuesta personalizada.
            </p>
          </div>
        </section>

        <div className="container quote-success quote-success--dark">
          <div className="quote-success__icon" aria-hidden>
            <i className="fas fa-check-circle" />
          </div>
          <h2>¡Gracias! Recibimos tu solicitud</h2>
          <p>
            Te respondo en 24–48 hs hábiles. Si querés acelerar, escribinos por WhatsApp.
          </p>
          <div className="quote-success__actions">
            <a
              className="btn btn-whatsapp"
              href={whatsappHref(settings.phone, 'Hola Gianfranco, acabo de dejar un brief en GB.Dev y quiero coordinar.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp" /> WhatsApp
            </a>
            <Link to="/proyectos" className="btn btn-outline">
              Ver casos
            </Link>
          </div>
          <button type="button" className="btn btn-dark mt-3" onClick={resetForm}>
            Enviar otra solicitud
          </button>
        </div>
      </main>
    )
  }

  const meta = STEP_META[step - 1]

  return (
    <main className="quote-page">
      <Seo
        title="Quiero mi proyecto"
        description="Brief para calificar tu proyecto: objetivo, funcionalidades, infraestructura y presupuesto. Respuesta en 24–48 hs hábiles."
        path="/cotizar"
      />
      <section className="page-hero texture-bg">
        <div className="container page-hero__content">
          <p className="section-label">Brief</p>
          <h1 className="page-hero__title">Quiero mi proyecto</h1>
          <p className="page-hero__sub">
            No es un formulario de contacto: es un brief corto para entender tu negocio y armarte una propuesta concreta.
          </p>
        </div>
      </section>

      <div className="container quote-container">
        <div className="quote-progress">
          <div className="quote-progress__top">
            <p className="quote-progress__title">
              Paso <strong>{step}</strong> de <strong>{TOTAL_STEPS}</strong>
              <span className="quote-progress__dot" aria-hidden>·</span>
              <span className="quote-progress__step">{meta.label}</span>
            </p>
            <p className="quote-progress__sub">{meta.sub}</p>
          </div>

          <div className="quote-steps" aria-label="Progreso del formulario">
            {STEP_META.map((s, idx) => {
              const n = idx + 1
              return (
                <div
                  key={s.label}
                  className={`quote-step ${step >= n ? 'quote-step--active' : ''} ${step > n ? 'quote-step--done' : ''} ${step === n ? 'quote-step--current' : ''}`}
                >
                  <div className="quote-step__row">
                    <div className="quote-step__num">{step > n ? <i className="fas fa-check" /> : n}</div>
                    {n < TOTAL_STEPS && (
                      <div
                        className={`quote-step__connector ${step > n ? 'quote-step__connector--done' : ''}`}
                        aria-hidden
                      />
                    )}
                  </div>
                  <span className="quote-step__label">{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="quote-body">
          {step === 1 && (
            <div className="quote-step-content animate-fadeInUp">
              <h2>¿Cuál es tu objetivo?</h2>
              <p className="quote-microcopy">
                Elegí la opción más parecida. Así oriento el tipo de solución antes de hablar de precio.
              </p>
              <div className="quote-choice-grid" role="group" aria-label="Objetivo">
                {OBJECTIVES.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`quote-choice ${form.objective === opt.id ? 'quote-choice--selected' : ''}`}
                    onClick={() => {
                      set('objective', opt.id)
                      setTouched((t) => ({ ...t, objective: true }))
                      setTimeout(() => setStep(2), 280)
                    }}
                  >
                    <span className="quote-choice__icon" aria-hidden>
                      <i className={`fas ${opt.icon}`} />
                    </span>
                    <span className="quote-choice__text">{opt.label}</span>
                    <span className="quote-choice__hint">{opt.hint}</span>
                  </button>
                ))}
              </div>
              {touched.objective && errors.objective && <p className="quote-error">{errors.objective}</p>}
              <div className="quote-nav">
                <span />
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Siguiente <i className="fas fa-arrow-right" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="quote-step-content animate-fadeInUp">
              <h2>Contame de tu negocio</h2>
              <p className="quote-microcopy">
                Con esto entiendo el problema real — no solo “quiero una web”.
              </p>

              <div className="form-group">
                <label className="form-label">Empresa / negocio *</label>
                <input
                  className={`form-control ${touched.business && errors.business ? 'form-control--error' : ''}`}
                  placeholder="Ej: peluquería en Palermo, fábrica de velas, consultorio…"
                  value={form.business}
                  onChange={(e) => set('business', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, business: true }))}
                />
                {touched.business && errors.business && <p className="quote-error">{errors.business}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">¿Qué problema querés solucionar? *</label>
                <textarea
                  className={`form-control ${touched.need && errors.need ? 'form-control--error' : ''}`}
                  rows={3}
                  placeholder='Ej: "Me escriben por Instagram y se pierden los pedidos / turnos."'
                  value={form.need}
                  onChange={(e) => set('need', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, need: true }))}
                />
                {touched.need && errors.need && <p className="quote-error">{errors.need}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">¿A quién le hablás? (público objetivo)</label>
                <input
                  className="form-control"
                  placeholder="Ej: vecinos del barrio, pymes, clientas de 25–45…"
                  value={form.audience}
                  onChange={(e) => set('audience', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Servicios o productos principales</label>
                <input
                  className="form-control"
                  placeholder="Ej: cortes y color; velas aromáticas; delivery de hamburguesas…"
                  value={form.servicesProducts}
                  onChange={(e) => set('servicesProducts', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Algo más que quieras aclarar (opcional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Detalles, restricciones, ideas…"
                  value={form.details}
                  onChange={(e) => set('details', e.target.value)}
                />
              </div>

              <div className="quote-nav">
                <button type="button" className="btn btn-outline" onClick={prev}>
                  <i className="fas fa-arrow-left" /> Atrás
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Siguiente <i className="fas fa-arrow-right" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="quote-step-content animate-fadeInUp">
              <h2>¿Qué funcionalidades te interesan?</h2>
              <p className="quote-microcopy">
                Marcá todo lo que suene útil. Después afinamos qué entra y qué no.
              </p>
              <div className="quote-feature-grid" role="group" aria-label="Funcionalidades">
                {FEATURE_OPTIONS.map((opt) => {
                  const on = form.requestedFeatures.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`quote-feature ${on ? 'quote-feature--on' : ''}`}
                      onClick={() => toggleFeature(opt.id)}
                      aria-pressed={on}
                    >
                      <i className={`fas ${on ? 'fa-check-square' : 'fa-square'}`} aria-hidden />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              <div className="quote-nav">
                <button type="button" className="btn btn-outline" onClick={prev}>
                  <i className="fas fa-arrow-left" /> Atrás
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Siguiente <i className="fas fa-arrow-right" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="quote-step-content animate-fadeInUp">
              <h2>Situación actual y plazos</h2>
              <p className="quote-microcopy">
                Esto define si arrancamos rápido o si hay que sumar identidad, contenido u hosting.
              </p>

              <div className="quote-infra">
                {INFRA_QUESTIONS.map((q) => (
                  <div key={q.id} className="quote-infra__row">
                    <p className="quote-infra__label">{q.label}</p>
                    <div className="quote-pill-group" role="group" aria-label={q.label}>
                      {INFRA_ANSWERS.map((ans) => (
                        <button
                          key={ans.id}
                          type="button"
                          className={`quote-pill ${form.infra[q.id] === ans.id ? 'quote-pill--selected' : ''}`}
                          onClick={() => setInfra(q.id, ans.id)}
                        >
                          {ans.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ marginTop: 22 }}>
                <label className="form-label">¿Necesitás algo de esto? (opcional)</label>
                <p className="quote-hint">Sirve para no olvidar SEO, idiomas o integraciones en la propuesta.</p>
                <div className="quote-infra">
                  {NEED_FLAGS.map((q) => (
                    <div key={q.id} className="quote-infra__row">
                      <p className="quote-infra__label">{q.label}</p>
                      <div className="quote-pill-group" role="group" aria-label={q.label}>
                        {INFRA_ANSWERS.map((ans) => (
                          <button
                            key={ans.id}
                            type="button"
                            className={`quote-pill ${form.needs[q.id] === ans.id ? 'quote-pill--selected' : ''}`}
                            onClick={() => setNeed(q.id, ans.id)}
                          >
                            {ans.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">¿Cómo medirías el éxito? (opcional)</label>
                <input
                  className="form-control"
                  placeholder="Ej: más consultas por WhatsApp, vender online, menos trabajo manual…"
                  value={form.successMetric}
                  onChange={(e) => set('successMetric', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">¿Qué NO debería entrar en esta etapa? (opcional)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Ej: app móvil nativa, multiidioma, integración con un ERP…"
                  value={form.outOfScope}
                  onChange={(e) => set('outOfScope', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginTop: 22 }}>
                <label className="form-label">¿Ya tenés presencia online? (opcional)</label>
                <div className="quote-pill-group" role="group" aria-label="Presencia online">
                  {PRESENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`quote-pill ${form.presence === opt.id ? 'quote-pill--selected' : ''}`}
                      onClick={() => set('presence', opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Presupuesto estimado (opcional)</label>
                <div className="quote-pill-group" role="group" aria-label="Presupuesto estimado">
                  {BUDGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`quote-pill ${form.budget === opt.id ? 'quote-pill--selected' : ''}`}
                      onClick={() => set('budget', opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="quote-hint">Sirve para sugerirte la opción más conveniente. No es un compromiso.</p>
              </div>

              <div className="form-group">
                <label className="form-label">Fecha ideal de lanzamiento (opcional)</label>
                <input
                  className="form-control"
                  placeholder="Ej: antes de diciembre / en 30 días / sin apuro"
                  value={form.launchDate}
                  onChange={(e) => set('launchDate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Webs de referencia (opcional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Links o nombres de sitios que te gusten y por qué."
                  value={form.references}
                  onChange={(e) => set('references', e.target.value)}
                />
              </div>

              <div className="quote-nav">
                <button type="button" className="btn btn-outline" onClick={prev}>
                  <i className="fas fa-arrow-left" /> Atrás
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Siguiente <i className="fas fa-arrow-right" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="quote-step-content animate-fadeInUp">
              <h2>¿Cómo te contacto?</h2>
              <p className="quote-microcopy">
                Te respondo dentro de 24–48 hs hábiles con una propuesta clara.
              </p>

              <div className="form-group">
                <label className="form-label">WhatsApp *</label>
                <input
                  className={`form-control ${touched.whatsapp && errors.whatsapp ? 'form-control--error' : ''}`}
                  inputMode="tel"
                  placeholder="Ej: +54 11 4160 9741"
                  value={form.whatsapp}
                  onChange={(e) => set('whatsapp', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))}
                />
                {touched.whatsapp && errors.whatsapp && <p className="quote-error">{errors.whatsapp}</p>}
                <p className="quote-hint">Por acá te escribo primero. Sin spam.</p>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    className={`form-control ${touched.name && errors.name ? 'form-control--error' : ''}`}
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  />
                  {touched.name && errors.name && <p className="quote-error">{errors.name}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    className={`form-control ${touched.email && errors.email ? 'form-control--error' : ''}`}
                    type="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  />
                  {touched.email && errors.email && <p className="quote-error">{errors.email}</p>}
                </div>
              </div>

              {submitError && (
                <div className="quote-submit-error" role="alert">
                  <i className="fas fa-exclamation-triangle" aria-hidden /> {submitError}
                </div>
              )}

              <div className="quote-nav">
                <button type="button" className="btn btn-outline" onClick={prev} disabled={submitting}>
                  <i className="fas fa-arrow-left" /> Atrás
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Enviando…' : (
                    <>
                      <i className="fas fa-paper-plane" /> Enviar brief
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
