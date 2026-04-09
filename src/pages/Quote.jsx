import { useMemo, useState } from 'react'
import api from '../hooks/useApi'
import './Quote.css'

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
const onlyDigits = (value) => String(value || '').replace(/[^\d]/g, '')
const formatWhatsApp = (value) => {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  const hasPlus = trimmed.startsWith('+')
  const digits = onlyDigits(trimmed)
  return (hasPlus ? '+' : '') + digits
}

// Mapeo de objective a projectType legible
const OBJECTIVE_LABEL = {
  mas_clientes:    'Conseguir más clientes',
  mostrar_negocio: 'Mostrar mi negocio',
  vender_online:   'Vender productos online',
  automatizar:     'Automatizar procesos',
  asesoramiento:   'Asesoramiento / No estoy seguro',
}

export default function Quote() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [form, setForm] = useState({
    objective: '',
    business: '',
    details: '',
    presence: '',
    budget: '',
    name: '',
    email: '',
    whatsapp: '',
  })

  const [touched, setTouched] = useState({})

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const stepLabel = useMemo(() => {
    if (step === 1) return 'Objetivo'
    if (step === 2) return 'Contexto'
    return 'Contacto'
  }, [step])

  const errors = useMemo(() => {
    const e = {}
    if (!form.objective) e.objective = 'Elegí una opción para poder orientarte.'
    if (!form.business.trim()) e.business = 'Este dato me ayuda a entender tu rubro.'
    if (!form.details.trim()) e.details = 'Contame un poco más para armar una propuesta a medida.'
    if (!form.presence) e.presence = 'Elegí una opción.'
    if (!form.name.trim()) e.name = 'Escribí tu nombre.'
    if (!form.email.trim()) e.email = 'Escribí tu email.'
    else if (!isEmail(form.email)) e.email = 'Revisá el email.'
    if (!onlyDigits(form.whatsapp).trim()) e.whatsapp = 'Dejá un WhatsApp para coordinar.'
    return e
  }, [form])

  const canGoStep2 = !errors.objective
  const canGoStep3 = !errors.business && !errors.details && !errors.presence
  const canSubmit = !errors.name && !errors.email && !errors.whatsapp

  const next = () => setStep((s) => Math.min(3, s + 1))
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
      if (!canGoStep2) return
      next()
      return
    }
    if (step === 2) {
      markTouched(['business', 'details', 'presence'])
      if (!canGoStep3) return
      next()
    }
  }

  const handleSubmit = async () => {
    markTouched(['name', 'email', 'whatsapp'])
    if (!canSubmit) return

    setSubmitting(true)
    setSubmitError('')
    try {
      // BUG FIX: el modelo requiere clientName (no name) y projectType (requerido)
      // También guardamos los campos extra del formulario en description
      await api.post('/quotes', {
        clientName:  form.name.trim(),
        email:       form.email.trim(),
        whatsapp:    formatWhatsApp(form.whatsapp),
        projectType: OBJECTIVE_LABEL[form.objective] || form.objective,
        description: form.details.trim(),
        budget:      form.budget,
        // Campos extra mapeados a description compuesta
        // Los guardamos también separados para el admin
        objective:   form.objective,
        business:    form.business.trim(),
        presence:    form.presence,
        source:      'portfolio_onboarding',
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError('No pude enviar el formulario ahora. Probá de nuevo o escribime por WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="quote-page">
        <section className="page-hero texture-bg">
          <div className="container page-hero__content">
            <p className="section-label">Listo</p>
            <h1 className="page-hero__title">¡Gracias!</h1>
            <p className="page-hero__sub">
              En base a lo que nos contaste, te voy a preparar una propuesta personalizada.
            </p>
          </div>
        </section>

        <div className="container quote-success quote-success--dark">
          <div className="quote-success__icon" aria-hidden>
            <i className="fas fa-check-circle" />
          </div>
          <h2>Gracias 🙌</h2>
          <p>Si querés acelerar, podés mandarme un mensaje y coordinamos.</p>
          <div className="quote-success__actions">
            <a className="btn btn-primary" href="tel:+541141609741">
              <i className="fas fa-phone" /> Llamar
            </a>
            <a className="btn btn-outline" href="mailto:gianbuzzelatto@gmail.com?subject=Consulta%20desde%20portfolio">
              <i className="fas fa-envelope" /> Enviar email
            </a>
          </div>

          <button
            className="btn btn-dark mt-3"
            onClick={() => {
              setSubmitted(false)
              setStep(1)
              setTouched({})
              setSubmitError('')
              setForm({
                objective: '',
                business: '',
                details: '',
                presence: '',
                budget: '',
                name: '',
                email: '',
                whatsapp: '',
              })
            }}
          >
            Enviar otra consulta
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="quote-page">
      <section className="page-hero texture-bg">
        <div className="container page-hero__content">
          <p className="section-label">Propuesta</p>
          <h1 className="page-hero__title">Pedí presupuesto para tu web o sistema</h1>
          <p className="page-hero__sub">
            Brief corto y estimación orientativa al instante. Sin compromiso: revisamos juntos alcance y próximos pasos.
          </p>
        </div>
      </section>

      <div className="container quote-container">
        <div className="quote-progress">
          <div className="quote-progress__top">
            <p className="quote-progress__title">
              Paso <strong>{step}</strong> de <strong>3</strong>
              <span className="quote-progress__dot" aria-hidden>·</span>
              <span className="quote-progress__step">{stepLabel}</span>
            </p>
            <p className="quote-progress__sub">
              {step === 1
                ? 'Elegí el objetivo principal. Esto define la mejor estrategia.'
                : step === 2
                  ? 'Un poco de contexto para que la propuesta sea precisa.'
                  : 'Dejame tus datos y te respondo dentro de 24–48 hs hábiles.'}
            </p>
          </div>

          <div className="quote-steps" aria-label="Progreso del formulario">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`quote-step ${step >= s ? 'quote-step--active' : ''} ${step > s ? 'quote-step--done' : ''} ${step === s ? 'quote-step--current' : ''}`}
              >
                <div className="quote-step__row">
                  <div className="quote-step__num">{step > s ? <i className="fas fa-check" /> : s}</div>
                  {s < 3 && (
                    <div
                      className={`quote-step__connector ${step > s ? 'quote-step__connector--done' : ''}`}
                      aria-hidden
                    />
                  )}
                </div>
                <span className="quote-step__label">{s === 1 ? 'Objetivo' : s === 2 ? 'Contexto' : 'Contacto'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="quote-body">
          {step === 1 && (
            <div className="quote-step-content animate-fadeInUp">
              <h2>¿Qué querés lograr con tu web?</h2>
              <p className="quote-microcopy">
                Elegí la opción que más se parezca a tu situación. Si no estás seguro, te asesoro.
              </p>

              <div className="quote-choice-grid" role="group" aria-label="Objetivo">
                {[
                  { id: 'mas_clientes', label: 'Conseguir más clientes', icon: 'fa-chart-line' },
                  { id: 'mostrar_negocio', label: 'Mostrar mi negocio', icon: 'fa-store' },
                  { id: 'vender_online', label: 'Vender productos online', icon: 'fa-shopping-cart' },
                  { id: 'automatizar', label: 'Automatizar procesos', icon: 'fa-cogs' },
                  { id: 'asesoramiento', label: 'No estoy seguro (necesito asesoramiento)', icon: 'fa-comments' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`quote-choice ${form.objective === opt.id ? 'quote-choice--selected' : ''}`}
                    onClick={() => {
                      set('objective', opt.id)
                      setTouched((t) => ({ ...t, objective: true }))
                    }}
                  >
                    <span className="quote-choice__icon" aria-hidden>
                      <i className={`fas ${opt.icon}`} />
                    </span>
                    <span className="quote-choice__text">{opt.label}</span>
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
              <h2>Contame un poco para orientarme</h2>
              <p className="quote-microcopy">
                Con 2–3 frases alcanza. Esto me ayuda a proponerte la mejor solución y estimar tiempos.
              </p>

              <div className="form-group">
                <label className="form-label">¿A qué se dedica tu negocio? *</label>
                <input
                  className={`form-control ${touched.business && errors.business ? 'form-control--error' : ''}`}
                  placeholder="Ej: perfumería, metalúrgica, estudio contable…"
                  value={form.business}
                  onChange={(e) => set('business', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, business: true }))}
                />
                {touched.business && errors.business && <p className="quote-error">{errors.business}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Contame un poco más sobre lo que necesitás *</label>
                <textarea
                  className={`form-control ${touched.details && errors.details ? 'form-control--error' : ''}`}
                  rows={5}
                  placeholder={`Ej: "Tengo Instagram, pero me escriben y no cierro ventas. Quiero una web simple con servicios, casos y un formulario que llegue a WhatsApp. También me interesa que cargue rápido en celular."`}
                  value={form.details}
                  onChange={(e) => set('details', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, details: true }))}
                />
                {touched.details && errors.details && <p className="quote-error">{errors.details}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">¿Ya tenés presencia online? *</label>
                <div className="quote-pill-group" role="group" aria-label="Presencia online">
                  {[
                    { id: 'no', label: 'No' },
                    { id: 'si_mejorar', label: 'Sí, pero quiero mejorar' },
                    { id: 'si_no_funciona', label: 'Sí, pero no funciona' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`quote-pill ${form.presence === opt.id ? 'quote-pill--selected' : ''}`}
                      onClick={() => {
                        set('presence', opt.id)
                        setTouched((t) => ({ ...t, presence: true }))
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {touched.presence && errors.presence && <p className="quote-error">{errors.presence}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">¿Tenés un presupuesto estimado? (opcional)</label>
                <div className="quote-pill-group" role="group" aria-label="Presupuesto estimado">
                  {[
                    { id: 'menos_200', label: 'Menos de $200.000' },
                    { id: '200_500', label: '$200.000 – $500.000' },
                    { id: 'mas_500', label: 'Más de $500.000' },
                    { id: 'no_se', label: 'No estoy seguro' },
                  ].map((opt) => (
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
              <h2>¿Cómo te contacto?</h2>
              <p className="quote-microcopy">
                Te respondo dentro de 24–48 hs hábiles con una propuesta simple y clara.
              </p>

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
                <p className="quote-hint">Solo para coordinar. No spam.</p>
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
                      <i className="fas fa-paper-plane" /> Solicitar propuesta
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