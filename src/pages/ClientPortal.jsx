import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../hooks/useApi'
import Seo from '../seo/Seo'
import { whatsappHref } from '../utils/whatsapp'
import { useSettings } from '../context/SettingsContext'
import './AcceptProposal.css'
import './Portal.css'

const PAYMENTS = [
  { key: 'startPaid', label: '40% al arrancar' },
  { key: 'midPaid', label: '30% a mitad' },
  { key: 'endPaid', label: '30% contra entrega' },
]

const REV_LABEL = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  'fuera-de-alcance': 'Fuera de alcance',
}

export default function ClientPortal() {
  const { token } = useParams()
  const settings = useSettings()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [request, setRequest] = useState('')
  const [warrantyNote, setWarrantyNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    api
      .get(`/portal/${token}`)
      .then((res) => {
        if (!alive) return
        setData(res.data)
      })
      .catch((err) => {
        if (!alive) return
        setError(err.response?.data?.message || 'No encontramos este portal.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => { alive = false }
  }, [token])

  const sendWarranty = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post(`/portal/${token}/warranty`, { description: warrantyNote })
      setData(res.data.portal)
      setWarrantyNote('')
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar el pedido de garantía.')
    } finally {
      setSubmitting(false)
    }
  }

  const sendRevision = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post(`/portal/${token}/revision`, { description: request })
      setData(res.data.portal)
      setRequest('')
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar el pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="accept-page">
        <div className="container accept-page__box">Cargando portal…</div>
      </main>
    )
  }

  if (error && !data) {
    return (
      <main className="accept-page">
        <Seo title="Portal del cliente" path={`/portal/${token}`} noindex />
        <div className="container accept-page__box">
          <h1>Link no válido</h1>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">Volver al inicio</Link>
        </div>
      </main>
    )
  }

  const wa = whatsappHref(
    settings.phone,
    `Hola Gianfranco, te escribo por el proyecto ${data.projectName}.`
  )

  return (
    <main className="accept-page">
      <Seo
        title="Portal del proyecto"
        description="Seguimiento de etapa, pagos, revisiones y links de tu proyecto con GB.Dev."
        path={`/portal/${token}`}
        noindex
      />

      <section className="page-hero texture-bg">
        <div className="container page-hero__content">
          <p className="section-label">Portal del cliente</p>
          <h1 className="page-hero__title">Hola, {data.clientName.split(' ')[0]}</h1>
          <p className="page-hero__sub">
            {data.projectName} · {data.stageLabel}
            {data.deadline ? ` · ${data.deadline} días de referencia` : ''}
          </p>
        </div>
      </section>

      <div className="container portal-grid">
        <article className="accept-card">
          <h3>Etapa actual</h3>
          <p className="portal-stage">{data.stageLabel}</p>
          <ul className="accept-card__meta">
            {data.hints.map((hint) => <li key={hint}>{hint}</li>)}
          </ul>
        </article>

        {data.kickoff && !data.kickoff.ready && (data.stage === 'activo' || data.kickoff.pendingClient?.length > 0) && (
          <article className="accept-card portal-span">
            <h3>Para arrancar necesitamos…</h3>
            <p className="portal-muted" style={{ marginTop: 0 }}>
              {data.kickoff.doneCount}/{data.kickoff.total} listos.
              Completá lo pendiente (onboarding, materiales, accesos) para que podamos codear sin fricción.
            </p>
            <ul className="portal-kickoff">
              {(data.kickoff.items || []).map((item) => (
                <li key={item.id} className={item.done ? 'is-done' : ''}>
                  <i className={`fas ${item.done ? 'fa-check-circle' : 'fa-circle'}`} aria-hidden />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            {!data.kickoff.items?.find((i) => i.id === 'onboarding')?.done && (
              <p className="portal-muted">
                Si todavía no enviaste el onboarding, pedile el link a Gianfranco o revisá el mail del contrato.
              </p>
            )}
          </article>
        )}

        {data.kickoff?.ready && data.stage === 'activo' && (
          <article className="accept-card">
            <h3>Arranque</h3>
            <p className="portal-muted" style={{ marginTop: 0 }}>
              Checklist completo. Ya tenemos lo necesario para avanzar el desarrollo.
            </p>
          </article>
        )}

        {(data.warranty?.started || data.stage === 'entregado' || data.stage === 'mantenimiento') && (
          <article className="accept-card">
            <h3>Garantía</h3>
            {data.warranty?.active ? (
              <p className="portal-muted">
                Activa · {data.warranty.daysLeft} día{data.warranty.daysLeft === 1 ? '' : 's'} · hasta{' '}
                {new Date(data.warranty.endsAt).toLocaleDateString('es-AR')}
              </p>
            ) : data.warranty?.expired ? (
              <p className="portal-muted">
                Cerró el {new Date(data.warranty.endsAt).toLocaleDateString('es-AR')}. Los bugs de lo entregado ya no entran; el plan de cuidado cubre el después.
              </p>
            ) : (
              <p className="portal-muted">Se activa cuando el proyecto se entrega.</p>
            )}
            {(data.warrantyTickets || []).length > 0 && (
              <ul className="portal-revs" style={{ marginTop: 12 }}>
                {data.warrantyTickets.map((item, i) => (
                  <li key={`${item.date}-${i}`}>
                    <span className={`portal-rev-status portal-rev-status--${item.status === 'cubierto' ? 'aprobado' : item.status}`}>
                      {item.status === 'cubierto' ? 'Cubierto' : REV_LABEL[item.status] || item.status}
                    </span>
                    <p>{item.description}</p>
                  </li>
                ))}
              </ul>
            )}
            {data.canReportWarranty && (
              <div className="portal-request">
                <label>
                  Reportar un bug de lo entregado
                  <textarea
                    className="form-control"
                    rows={3}
                    value={warrantyNote}
                    onChange={(e) => setWarrantyNote(e.target.value)}
                    placeholder="Qué se rompió y dónde se ve…"
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={sendWarranty}
                  disabled={submitting || warrantyNote.trim().length < 8}
                >
                  {submitting ? 'Enviando…' : 'Enviar a garantía'}
                </button>
              </div>
            )}
          </article>
        )}

        <article className="accept-card">
          <h3>Pagos (40 / 30 / 30)</h3>
          <ul className="portal-payments">
            {PAYMENTS.map((item) => {
              const paid = Boolean(data.payments?.[item.key])
              return (
                <li key={item.key} className={paid ? 'is-paid' : ''}>
                  <i className={`fas ${paid ? 'fa-check-circle' : 'fa-circle'}`} aria-hidden />
                  {item.label}
                </li>
              )
            })}
          </ul>
          {data.finalPrice != null && (
            <p className="portal-muted">
              Total de referencia: {data.currency} {Number(data.finalPrice).toLocaleString('es-AR')}
            </p>
          )}
        </article>

        <article className="accept-card">
          <h3>Links</h3>
          {data.stagingUrl || data.productionUrl ? (
            <ul className="accept-card__meta">
              {data.stagingUrl ? (
                <li>
                  Staging:{' '}
                  <a href={data.stagingUrl} target="_blank" rel="noreferrer">{data.stagingUrl}</a>
                </li>
              ) : null}
              {data.productionUrl ? (
                <li>
                  Producción:{' '}
                  <a href={data.productionUrl} target="_blank" rel="noreferrer">{data.productionUrl}</a>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="portal-muted">Todavía no hay URLs publicadas. Te las dejamos acá cuando estén.</p>
          )}
        </article>

        <article className="accept-card">
          <h3>Novedades</h3>
          {data.updates?.length ? (
            <ul className="portal-updates">
              {data.updates.map((item) => (
                <li key={`${item.date}-${item.message}`}>
                  <span>{item.date ? new Date(item.date).toLocaleDateString('es-AR') : ''}</span>
                  <p>{item.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="portal-muted">Cuando haya un avance, lo vas a ver acá.</p>
          )}
        </article>

        <article className="accept-card portal-span">
          <h3>Revisiones</h3>
          <p className="portal-muted">
            {data.revisionsUsed} usadas / {data.revisions} incluidas
          </p>
          {(data.revisionsList || []).length ? (
            <ul className="portal-revs">
              {data.revisionsList.map((item, i) => (
                <li key={`${item.date}-${i}`}>
                  <span className={`portal-rev-status portal-rev-status--${item.status}`}>
                    {REV_LABEL[item.status] || item.status}
                  </span>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="portal-muted">Todavía no hay pedidos de cambio.</p>
          )}

          {data.canRequestRevision ? (
            <div className="portal-request">
              <label>
                Pedir un cambio
                <textarea
                  className="form-control"
                  rows={3}
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  placeholder="Qué hay que corregir o ajustar…"
                />
              </label>
              {error && <p className="accept-error" role="alert">{error}</p>}
              <button
                type="button"
                className="btn btn-primary"
                onClick={sendRevision}
                disabled={submitting || request.trim().length < 8}
              >
                {submitting ? 'Enviando…' : 'Enviar pedido'}
              </button>
            </div>
          ) : (
            <p className="portal-muted">En esta etapa los extras se coordinan por WhatsApp.</p>
          )}
        </article>

        {(data.maintenancePlan || data.care?.status === 'offered' || data.care?.status === 'active' || data.warranty?.expired) && (
          <article className="accept-card">
            <h3>Cuidado del sitio</h3>
            {data.care?.status === 'active' && data.maintenancePlan ? (
              <>
                <p>
                  Plan activo · {data.maintenancePlan.currency} {data.maintenancePlan.price}/mes
                </p>
                {data.maintenancePlan.includes?.length ? (
                  <ul className="accept-card__meta">
                    {data.maintenancePlan.includes.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : null}
              </>
            ) : (
              <>
                <p className="portal-muted">
                  El desarrollo no incluye mantenimiento indefinido. El plan cubre backups, monitoreo y cambios chicos.
                </p>
                <Link to="/cuidado" className="btn btn-outline">Ver planes</Link>
              </>
            )}
          </article>
        )}

        <article className="accept-card">
          <h3>¿Hablamos?</h3>
          <p className="portal-muted">Si algo no está claro, escribime y lo vemos.</p>
          <a className="btn btn-primary" href={wa} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </article>
      </div>
    </main>
  )
}
