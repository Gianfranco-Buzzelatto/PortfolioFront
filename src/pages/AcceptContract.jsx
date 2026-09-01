import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../hooks/useApi'
import Seo from '../seo/Seo'
import './AcceptProposal.css'

export default function AcceptContract() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clientName, setClientName] = useState('')
  const [email, setEmail] = useState('')
  const [agree, setAgree] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    api
      .get(`/quotes/proposal/${token}/contract`)
      .then((res) => {
        if (!alive) return
        setData(res.data)
        setClientName(res.data.contract?.clientName || '')
      })
      .catch((err) => {
        if (!alive) return
        setError(err.response?.data?.message || 'No encontramos este contrato.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => { alive = false }
  }, [token])

  const accept = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post(`/quotes/proposal/${token}/contract`, {
        accept: true,
        clientName,
        email: email || undefined,
      })
      navigate(res.data.nextPath || `/onboarding/${token}`)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo aceptar el contrato.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="accept-page">
        <div className="container accept-page__box">Cargando contrato…</div>
      </main>
    )
  }

  if (error && !data) {
    return (
      <main className="accept-page">
        <Seo title="Contrato" path={`/contrato/${token}`} noindex />
        <div className="container accept-page__box">
          <h1>Contrato no disponible</h1>
          <p>{error}</p>
          <Link to={`/propuesta/${token}`} className="btn btn-primary">Ir a la propuesta</Link>
        </div>
      </main>
    )
  }

  const contract = data.contract
  const done = Boolean(data.accepted)

  return (
    <main className="accept-page">
      <Seo
        title="Contrato de desarrollo"
        description="Revisá y aceptá las condiciones del proyecto con GB.Dev."
        path={`/contrato/${token}`}
        noindex
      />

      <section className="page-hero texture-bg">
        <div className="container page-hero__content">
          <p className="section-label">Contrato {contract.version}</p>
          <h1 className="page-hero__title">{done ? 'Contrato aceptado' : contract.title}</h1>
          <p className="page-hero__sub">
            {done
              ? 'Siguiente paso: completar el onboarding para arrancar con datos, marca e infraestructura.'
              : `Plan ${contract.planLabel} · ${contract.currency} ${Number(contract.price || 0).toLocaleString('es-AR')} · ${contract.deadline || '—'} días · ${contract.revisions} revisiones`}
          </p>
        </div>
      </section>

      <div className="container accept-page__grid accept-page__grid--wide">
        <article className="accept-card">
          {contract.sections?.map((section) => (
            <section key={section.title} className="contract-section">
              <h3>{section.title}</h3>
              <p>{section.body}</p>
              {section.list?.length ? (
                <ul>
                  {section.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : null}
            </section>
          ))}
        </article>

        <article className="accept-card accept-card--sticky">
          <h3>{done ? 'Confirmado' : 'Aceptar condiciones'}</h3>
          <p className="accept-card__type">
            Al aceptar, confirmás alcance, pagos 40/30/30, revisiones y las cláusulas de terceros, garantía y propiedad.
          </p>

          {error && <p className="accept-error" role="alert">{error}</p>}

          {done ? (
            <div className="accept-done">
              <i className="fas fa-check-circle" aria-hidden />
              <p>
                Aceptado por <strong>{data.acceptance?.clientName}</strong>
                {data.acceptance?.acceptedAt
                  ? ` el ${new Date(data.acceptance.acceptedAt).toLocaleString('es-AR')}`
                  : ''}
                .
              </p>
              <Link to={data.nextPath || `/onboarding/${token}`} className="btn btn-primary">
                Ir al onboarding
              </Link>
            </div>
          ) : (
            <>
              <div className="accept-form">
                <label>
                  Nombre
                  <input className="form-control" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </label>
                <label>
                  Email (si no usamos el del brief)
                  <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label className="accept-check">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  Leí y acepto estas condiciones de trabajo.
                </label>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={accept}
                disabled={submitting || !agree || !clientName.trim()}
              >
                {submitting ? 'Confirmando…' : 'Aceptar contrato'}
              </button>
            </>
          )}
        </article>
      </div>
    </main>
  )
}
