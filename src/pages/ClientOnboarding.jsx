import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../hooks/useApi'
import Seo from '../seo/Seo'
import './AcceptProposal.css'

const EMPTY = {
  brand: { hasLogo: '', hasColors: '', hasFonts: '', assetLinks: '', notes: '' },
  content: { hasTexts: '', hasPhotos: '', hasVideos: '', notes: '' },
  infra: { domain: '', hosting: '', emailProvider: '', paymentAccount: '', notes: '' },
  approver: { name: '', role: '' },
  billing: { businessName: '', taxId: '', email: '' },
  accessesNotes: '',
  references: '',
  extra: '',
}

const YES_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'no', label: 'No' },
]

function Choice({ name, value, onChange }) {
  return (
    <div className="choice-row" role="group">
      {YES_NO.map((opt) => (
        <label key={opt.value} className={value === opt.value ? 'choice-row__opt is-on' : 'choice-row__opt'}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}

export default function ClientOnboarding() {
  const { token } = useParams()
  const [meta, setMeta] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [portalPath, setPortalPath] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    api
      .get(`/quotes/proposal/${token}/onboarding`)
      .then((res) => {
        if (!alive) return
        setMeta(res.data)
        setDone(Boolean(res.data.submitted))
        if (res.data.onboarding) {
          setForm({
            ...EMPTY,
            ...res.data.onboarding,
            brand: { ...EMPTY.brand, ...(res.data.onboarding.brand || {}) },
            content: { ...EMPTY.content, ...(res.data.onboarding.content || {}) },
            infra: { ...EMPTY.infra, ...(res.data.onboarding.infra || {}) },
            approver: { ...EMPTY.approver, ...(res.data.onboarding.approver || {}) },
            billing: { ...EMPTY.billing, ...(res.data.onboarding.billing || {}) },
          })
        }
      })
      .catch((err) => {
        if (!alive) return
        setError(err.response?.data?.message || 'Onboarding no disponible.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => { alive = false }
  }, [token])

  const setBrand = (key, value) => setForm((f) => ({ ...f, brand: { ...f.brand, [key]: value } }))
  const setContent = (key, value) => setForm((f) => ({ ...f, content: { ...f.content, [key]: value } }))
  const setInfra = (key, value) => setForm((f) => ({ ...f, infra: { ...f.infra, [key]: value } }))

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post(`/quotes/proposal/${token}/onboarding`, form)
      setDone(true)
      setPortalPath(res.data.portalPath || '')
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar el onboarding.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="accept-page">
        <div className="container accept-page__box">Cargando onboarding…</div>
      </main>
    )
  }

  if (error && !meta) {
    return (
      <main className="accept-page">
        <Seo title="Onboarding" path={`/onboarding/${token}`} noindex />
        <div className="container accept-page__box">
          <h1>Onboarding no disponible</h1>
          <p>{error}</p>
          <Link to={`/contrato/${token}`} className="btn btn-primary">Ir al contrato</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="accept-page">
      <Seo
        title="Onboarding del proyecto"
        description="Completá marca, contenidos e infraestructura para arrancar el desarrollo."
        path={`/onboarding/${token}`}
        noindex
      />

      <section className="page-hero texture-bg">
        <div className="container page-hero__content">
          <p className="section-label">Onboarding</p>
          <h1 className="page-hero__title">{done ? 'Onboarding recibido' : 'Datos para arrancar'}</h1>
          <p className="page-hero__sub">
            {done
              ? 'Gracias. Con esto armamos la ficha técnica y coordinamos el inicio del desarrollo.'
              : `${meta.projectName} · ${meta.business || meta.clientName}. Completá lo que tengas; lo que falte lo vemos juntos.`}
          </p>
        </div>
      </section>

      <div className="container onboard-wrap">
        {done && (
          <div className="accept-card accept-done" style={{ marginBottom: 22 }}>
            <i className="fas fa-check-circle" aria-hidden />
            <p>
              {portalPath
                ? 'Ya tenemos tu onboarding. Podés seguir el proyecto en el portal.'
                : 'Ya tenemos tu onboarding. El portal queda disponible cuando se inicia el proyecto.'}
            </p>
            {portalPath ? (
              <Link to={portalPath} className="btn btn-primary">Ir al portal</Link>
            ) : null}
            <Link to="/" className="btn btn-outline">Volver al inicio</Link>
          </div>
        )}

        <article className="accept-card">
          <h3>Marca</h3>
          <div className="onboard-grid">
            <label>¿Hay logo? <Choice name="logo" value={form.brand.hasLogo} onChange={(v) => setBrand('hasLogo', v)} /></label>
            <label>¿Hay colores? <Choice name="colors" value={form.brand.hasColors} onChange={(v) => setBrand('hasColors', v)} /></label>
            <label>¿Hay tipografías? <Choice name="fonts" value={form.brand.hasFonts} onChange={(v) => setBrand('hasFonts', v)} /></label>
          </div>
          <label className="onboard-block">
            Links a Drive / Figma / archivos
            <input className="form-control" value={form.brand.assetLinks} onChange={(e) => setBrand('assetLinks', e.target.value)} />
          </label>
          <label className="onboard-block">
            Notas de marca
            <textarea className="form-control" rows={3} value={form.brand.notes} onChange={(e) => setBrand('notes', e.target.value)} />
          </label>
        </article>

        <article className="accept-card">
          <h3>Contenidos</h3>
          <div className="onboard-grid">
            <label>¿Hay textos? <Choice name="texts" value={form.content.hasTexts} onChange={(v) => setContent('hasTexts', v)} /></label>
            <label>¿Hay fotos? <Choice name="photos" value={form.content.hasPhotos} onChange={(v) => setContent('hasPhotos', v)} /></label>
            <label>¿Hay videos? <Choice name="videos" value={form.content.hasVideos} onChange={(v) => setContent('hasVideos', v)} /></label>
          </div>
          <label className="onboard-block">
            Notas de contenido
            <textarea className="form-control" rows={3} value={form.content.notes} onChange={(e) => setContent('notes', e.target.value)} />
          </label>
        </article>

        <article className="accept-card">
          <h3>Infraestructura</h3>
          <div className="onboard-grid">
            <label className="onboard-block">Dominio<input className="form-control" value={form.infra.domain} onChange={(e) => setInfra('domain', e.target.value)} /></label>
            <label className="onboard-block">Hosting<input className="form-control" value={form.infra.hosting} onChange={(e) => setInfra('hosting', e.target.value)} /></label>
            <label className="onboard-block">Emails<input className="form-control" value={form.infra.emailProvider} onChange={(e) => setInfra('emailProvider', e.target.value)} /></label>
            <label className="onboard-block">Pagos (MP, etc.)<input className="form-control" value={form.infra.paymentAccount} onChange={(e) => setInfra('paymentAccount', e.target.value)} /></label>
          </div>
          <label className="onboard-block">
            Notas de infraestructura
            <textarea className="form-control" rows={2} value={form.infra.notes} onChange={(e) => setInfra('notes', e.target.value)} />
          </label>
        </article>

        <article className="accept-card">
          <h3>Quién aprueba y facturación</h3>
          <p style={{ margin: '0 0 12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Necesario para arrancar sin fricciones. No pedimos contraseñas acá.
          </p>
          <div className="onboard-grid">
            <label className="onboard-block">
              Persona que aprueba cambios
              <input
                className="form-control"
                value={form.approver.name}
                onChange={(e) => setForm((f) => ({ ...f, approver: { ...f.approver, name: e.target.value } }))}
                placeholder="Nombre y apellido"
              />
            </label>
            <label className="onboard-block">
              Rol / cargo
              <input
                className="form-control"
                value={form.approver.role}
                onChange={(e) => setForm((f) => ({ ...f, approver: { ...f.approver, role: e.target.value } }))}
                placeholder="Dueño, marketing, socio…"
              />
            </label>
            <label className="onboard-block">
              Razón social / nombre para factura
              <input
                className="form-control"
                value={form.billing.businessName}
                onChange={(e) => setForm((f) => ({ ...f, billing: { ...f.billing, businessName: e.target.value } }))}
              />
            </label>
            <label className="onboard-block">
              CUIT / documento
              <input
                className="form-control"
                value={form.billing.taxId}
                onChange={(e) => setForm((f) => ({ ...f, billing: { ...f.billing, taxId: e.target.value } }))}
              />
            </label>
            <label className="onboard-block">
              Email de facturación
              <input
                className="form-control"
                type="email"
                value={form.billing.email}
                onChange={(e) => setForm((f) => ({ ...f, billing: { ...f.billing, email: e.target.value } }))}
              />
            </label>
          </div>
        </article>

        <article className="accept-card">
          <h3>Accesos y referencias</h3>
          <label className="onboard-block">
            Accesos (sin contraseñas: decí dónde están, no las pegues acá)
            <textarea className="form-control" rows={3} value={form.accessesNotes} onChange={(e) => setForm((f) => ({ ...f, accessesNotes: e.target.value }))} />
          </label>
          <label className="onboard-block">
            Referencias / sitios que te gustan
            <textarea className="form-control" rows={2} value={form.references} onChange={(e) => setForm((f) => ({ ...f, references: e.target.value }))} />
          </label>
          <label className="onboard-block">
            Extra
            <textarea className="form-control" rows={2} value={form.extra} onChange={(e) => setForm((f) => ({ ...f, extra: e.target.value }))} />
          </label>

          {error && <p className="accept-error" role="alert">{error}</p>}

          <button type="button" className="btn btn-primary btn-lg" onClick={submit} disabled={submitting}>
            {submitting ? 'Enviando…' : done ? 'Actualizar onboarding' : 'Enviar onboarding'}
          </button>
        </article>
      </div>
    </main>
  )
}
