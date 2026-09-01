import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import api from '../../hooks/useApi'
import './Dashboard.css'

function StatCard({ icon, label, value, color, to }) {
  return (
    <Link to={to} className="dash-stat" style={{ '--accent': color }}>
      <div className="dash-stat__icon"><i className={`fas ${icon}`} /></div>
      <div>
        <p className="dash-stat__value">{value}</p>
        <p className="dash-stat__label">{label}</p>
      </div>
    </Link>
  )
}

const statusLabel = { pending: 'Pendiente', reviewed: 'Revisado', accepted: 'Aceptado', rejected: 'Rechazado' }
const statusColor = { pending: '#ffc107', reviewed: '#17a2b8', accepted: '#28a745', rejected: '#dc3545' }

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [quotes, setQuotes]     = useState([])
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([api.get('/projects/admin/all'), api.get('/quotes'), api.get('/clients')])
      .then(([p, q, c]) => { setProjects(p.data); setQuotes(q.data); setClients(c.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pendingQuotes  = quotes.filter(q => q.status === 'pending').length
  const featuredCount  = projects.filter(p => p.featured).length
  const recentQuotes   = quotes.slice(0, 5)
  const warrantySoon = clients.filter((c) => {
    if (!c.warranty?.endsAt) return false
    const ends = new Date(c.warranty.endsAt).getTime()
    const now = Date.now()
    return ends >= now && ends <= now + 7 * 24 * 60 * 60 * 1000
  })
  const careGap = clients.filter((c) => (
    (c.stage === 'entregado' || c.stage === 'mantenimiento')
    && c.care?.status !== 'active'
    && c.care?.status !== 'paused'
  ))

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="dash-loading">Cargando...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="dash-stats">
            <StatCard icon="fa-folder-open"   label="Proyectos totales"  value={projects.length}  color="var(--primary)"  to="/admin/proyectos" />
            <StatCard icon="fa-star"           label="Destacados"         value={featuredCount}     color="#f59e0b"         to="/admin/proyectos" />
            <StatCard icon="fa-file-invoice"   label="Cotizaciones"       value={quotes.length}     color="#6366f1"         to="/admin/cotizaciones" />
            <StatCard icon="fa-clock"          label="Pendientes"         value={pendingQuotes}     color="#ef4444"         to="/admin/cotizaciones" />
          </div>

          {(warrantySoon.length > 0 || careGap.length > 0) && (
            <div className="dash-card" style={{ marginBottom: 28 }}>
              <div className="dash-card__header">
                <h2>Postventa</h2>
                <Link to="/admin/clientes" className="dash-card__link">Clientes →</Link>
              </div>
              {warrantySoon.map((c) => (
                <p key={`w-${c._id}`} style={{ margin: '0 0 8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Garantía por vencer: <strong>{c.clientName}</strong> · {new Date(c.warranty.endsAt).toLocaleDateString('es-AR')}
                </p>
              ))}
              {careGap.map((c) => (
                <p key={`c-${c._id}`} style={{ margin: '0 0 8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Sin cuidado activo: <strong>{c.clientName}</strong>
                </p>
              ))}
            </div>
          )}

          <div className="dash-grid">
            {/* Recent quotes */}
            <div className="dash-card">
              <div className="dash-card__header">
                <h2>Cotizaciones recientes</h2>
                <Link to="/admin/cotizaciones" className="dash-card__link">Ver todas →</Link>
              </div>
              {recentQuotes.length === 0 ? (
                <p className="dash-empty">No hay cotizaciones todavía.</p>
              ) : (
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr><th>Cliente</th><th>Tipo</th><th>Estimado</th><th>Estado</th></tr>
                    </thead>
                    <tbody>
                      {recentQuotes.map(q => (
                        <tr key={q._id}>
                          <td>
                            <p className="fw-bold">{q.clientName}</p>
                            <small>{q.email}</small>
                          </td>
                          <td><span className="tag">{q.projectType}</span></td>
                          <td className="text-primary fw-bold">
                            {q.finalPrice ? `$${q.finalPrice.toLocaleString()}` : '-'}
                          </td>
                          <td>
                            <span className="dash-badge" style={{ background: statusColor[q.status] + '22', color: statusColor[q.status] }}>
                              {statusLabel[q.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="dash-card">
              <div className="dash-card__header">
                <h2>Acciones rápidas</h2>
              </div>
              <div className="dash-actions">
                <Link to="/admin/proyectos" className="dash-action">
                  <i className="fas fa-plus-circle" />
                  <span>Agregar proyecto</span>
                </Link>
                <Link to="/admin/configuracion" className="dash-action">
                  <i className="fas fa-edit" />
                  <span>Editar perfil</span>
                </Link>
                <Link to="/" target="_blank" className="dash-action">
                  <i className="fas fa-eye" />
                  <span>Ver portfolio</span>
                </Link>
                <Link to="/admin/cotizaciones" className="dash-action">
                  <i className="fas fa-envelope-open" />
                  <span>Ver cotizaciones</span>
                </Link>
              </div>

              {/* Category breakdown */}
              <div className="dash-card__header" style={{marginTop:32}}>
                <h2>Proyectos por categoría</h2>
              </div>
              <div className="dash-categories">
                {['web','fullstack','mobile','backend','design','otro'].map(cat => {
                  const count = projects.filter(p => p.category === cat).length
                  const pct = projects.length ? (count / projects.length) * 100 : 0
                  return (
                    <div key={cat} className="dash-category">
                      <div className="dash-category__info">
                        <span>{cat}</span>
                        <span>{count}</span>
                      </div>
                      <div className="dash-category__bar">
                        <div className="dash-category__fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
