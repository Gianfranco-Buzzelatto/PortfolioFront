import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../hooks/useApi'
import Seo from '../seo/Seo'
import { CARE_PLANS } from '../data/quoteCatalog2026'
import { formatMoney } from '../utils/quotePDF'
import ConnectionError from '../components/ConnectionError/ConnectionError'
import LoadingState from '../components/ConnectionError/LoadingState'
import { isConnectionError } from '../utils/apiError'
import { useSettings } from '../context/SettingsContext'
import { whatsappHref } from '../utils/whatsapp'
import './AcceptProposal.css'

const PLAN_LABEL = { base: 'Básico', media: 'Intermedio', premium: 'Premium' }

export default function AcceptProposal() {
  const { token } = useParams()
  const navigate = useNavigate()
  const settings = useSettings()
  const [proposal, setProposal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [offline, setOffline] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState('media')
  const [clientName, setClientName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    api
      .get(`/quotes/proposal/${token}`)
      .then((res) => {
        if (!alive) return
        setProposal(res.data)
        setSelectedPlan(res.data.selectedPlan || 'media')
        setClientName(res.data.clientName || '')
        setDone(Boolean(res.data.accepted))
        setOffline(false)
        setError('')
      })
      .catch((err) => {
        if (!alive) return
        // Sin esta distinción le decíamos "no encontramos esta propuesta" a un
        // cliente cuya propuesta existe y sólo estaba el backend caído.
        if (isConnectionError(err)) setOffline(true)
        else setError(err.response?.data?.message || 'No encontramos esta propuesta.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => { alive = false }
  }, [token, reloadKey])

  const accept = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post(`/quotes/proposal/${token}/accept`, {
        selectedPlan,
        clientName,
        email: email || undefined,
      })
      setProposal(res.data.proposal)
      setDone(true)
      navigate(res.data.nextPath || `/contrato/${token}`)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo aceptar. Probá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="accept-page">
        <div className="container">
          <LoadingState label="Cargando propuesta…" />
        </div>
      </main>
    )
  }

  if (offline && !proposal) {
    return (
      <main className="accept-page">
        <Seo title="Propuesta" path={`/propuesta/${token}`} noindex />
        <div className="container">
          <ConnectionError
            onRetry={() => setReloadKey((k) => k + 1)}
            retrying={loading}
            message="Tu propuesta está guardada, pero en este momento no podemos mostrarla. Es un problema técnico nuestro: probá de nuevo en unos minutos y el link va a seguir funcionando."
            whatsappHref={whatsappHref(settings.phone, 'Hola Gianfranco, quise abrir el link de la propuesta y no carga.')}
          />
        </div>
      </main>
    )
  }

  if (error && !proposal) {
    return (
      <main className="accept-page">
        <Seo title="Propuesta" path={`/propuesta/${token}`} noindex />
        <div className="container accept-page__box">
          <h1>Link no válido</h1>
          <p>{error}</p>
          <Link to="/cotizar" className="btn btn-primary">Quiero mi proyecto</Link>
        </div>
      </main>
    )
  }

  const plans = proposal.plans?.length
    ? proposal.plans
    : proposal.finalPrice != null
      ? [{ key: 'media', label: 'Propuesta', finalPrice: proposal.finalPrice }]
      : []

  return (
    <main className="accept-page">
      <Seo
        title="Aceptar propuesta"
        description="Revisá y aceptá la propuesta comercial de GB.Dev."
        path={`/propuesta/${token}`}
        noindex
      />

      <section className="page-hero texture-bg">
        <div className="container page-hero__content">
          <p className="section-label">Propuesta</p>
          <h1 className="page-hero__title">
            {done ? 'Propuesta aceptada' : `Hola, ${proposal.clientName.split(' ')[0]}`}
          </h1>
          <p className="page-hero__sub">
            {done
              ? 'Siguiente paso: revisar y aceptar el contrato de desarrollo.'
              : 'Revisá el alcance y el plan. Al aceptar, confirmás datos, precio y condiciones básicas.'}
          </p>
        </div>
      </section>

      <div className="container accept-page__grid">
        <article className="accept-card">
          <p className="accept-card__eyebrow">{proposal.business || 'Tu proyecto'}</p>
          <h2>{proposal.projectName}</h2>
          <p className="accept-card__type">{proposal.projectType}</p>
          <ul className="accept-card__meta">
            {proposal.deadline ? <li><strong>{proposal.deadline}</strong> días hábiles de referencia</li> : null}
            {proposal.revisions ? <li><strong>{proposal.revisions}</strong> rondas de revisión</li> : null}
            {proposal.carePlan?.included !== false ? (
              <li>
                Plan de cuidado {proposal.carePlan?.tier || 'intermedio'} ·{' '}
                {formatMoney(
                  CARE_PLANS[proposal.carePlan?.tier]?.price || proposal.carePlan?.price || 55,
                  proposal.currency || 'USD',
                  proposal.exchangeRate,
                ).perMonth}
              </li>
            ) : (
              <li>Sin plan de cuidado incluido</li>
            )}
            <li>Pago: 40% al arrancar · 30% a mitad · 30% contra entrega</li>
          </ul>
        </article>

        <article className="accept-card">
          <h3>Elegí el plan</h3>
          <div className="accept-plans">
            {plans.map((plan) => {
              const key = plan.key || 'media'
              const active = selectedPlan === key
              return (
                <button
                  key={key}
                  type="button"
                  className={`accept-plan ${active ? 'accept-plan--on' : ''}`}
                  onClick={() => !done && setSelectedPlan(key)}
                  disabled={done}
                >
                  <span>{plan.label || PLAN_LABEL[key] || key}</span>
                  <strong>
                    {(proposal.currency === 'EUR' ? '€' : '$')}
                    {(plan.finalPrice || 0).toLocaleString('es-AR')}{' '}
                    {proposal.currency || 'USD'}
                  </strong>
                </button>
              )
            })}
          </div>

          {!done && (
            <div className="accept-form">
              <label>
                Nombre
                <input
                  className="form-control"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </label>
              <label>
                Email (opcional si ya está en el brief)
                <input
                  className="form-control"
                  type="email"
                  placeholder={proposal.clientName ? 'Dejá vacío para usar el del brief' : 'tu@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>
          )}

          {error && <p className="accept-error" role="alert">{error}</p>}

          {done ? (
            <div className="accept-done">
              <i className="fas fa-check-circle" aria-hidden />
              <p>
                Aceptaste el plan <strong>{PLAN_LABEL[proposal.acceptance?.selectedPlan || selectedPlan] || selectedPlan}</strong>.
              </p>
              <Link to={proposal.nextPath || `/contrato/${token}`} className="btn btn-primary">
                Continuar al contrato
              </Link>
              <Link to="/" className="btn btn-outline">Volver al inicio</Link>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={accept}
              disabled={submitting || !clientName.trim()}
            >
              {submitting ? 'Confirmando…' : 'Aceptar propuesta'}
            </button>
          )}
        </article>
      </div>
    </main>
  )
}
