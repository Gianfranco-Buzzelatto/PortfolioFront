import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import api from '../../hooks/useApi'
import ConnectionError from '../../components/ConnectionError/ConnectionError'
import { isConnectionError } from '../../utils/apiError'
import {
  generateAgreementPDF,
  generateRevisionsPDF,
  generateDeliveryPDF,
  generateUserGuidePDF,
  generateMaintenancePDF,
} from '../../utils/documentPDF'
import {
  generateStartEmail,
  generateRevisionEmail,
  generateDeliveryEmail,
  generateMaintenanceEmail,
} from '../../utils/emailTemplates'
import './AdminClients.css'

// ── Constantes ───────────────────────────────────────────────────────────────
const STAGES = [
  { key: 'activo',        label: 'Proyecto activo',  color: '#28a745' },
  { key: 'revision',      label: 'Revisión / QA',    color: '#fd7e14' },
  { key: 'entregado',     label: 'Entregado',        color: '#0d6efd' },
  { key: 'mantenimiento', label: 'Mantenimiento',    color: '#6f42c1' },
]

const STAGE_ORDER = ['activo', 'revision', 'entregado', 'mantenimiento']

const STAGE_DOCS = {
  activo: [
    { label: 'Acuerdo de trabajo', icon: 'fa-file-contract', action: 'agreement' },
    { label: 'Email de inicio',    icon: 'fa-envelope',      action: 'email-start' },
  ],
  revision: [
    { label: 'Acta de revisiones', icon: 'fa-tasks',    action: 'revisions' },
    { label: 'Email de revisión',  icon: 'fa-envelope', action: 'email-revision' },
  ],
  entregado: [
    { label: 'Acta de entrega',    icon: 'fa-check-circle', action: 'delivery' },
    { label: 'Guía de uso',        icon: 'fa-book',         action: 'guide' },
    { label: 'Email de entrega',   icon: 'fa-envelope',     action: 'email-delivery' },
  ],
  mantenimiento: [
    { label: 'Propuesta de mantenimiento', icon: 'fa-tools',    action: 'maintenance' },
    { label: 'Email de mantenimiento',     icon: 'fa-envelope', action: 'email-maintenance' },
  ],
}

const STAGE_TASKS = {
  activo: [
    'Confirmar arranque con el cliente (seña en privado)',
    'Crear repositorio / entorno de desarrollo',
    'Compartir el link del portal',
    'Mantener actualizaciones semanales',
  ],
  revision: [
    'Subir versión a staging',
    'Enviar link al cliente para revisar',
    'Registrar los cambios solicitados abajo',
    'Verificar que no supere las revisiones incluidas',
  ],
  entregado: [
    'Deploy a producción',
    'Entregar accesos y credenciales',
    'Confirmar la garantía de 15 días en el portal',
    'Ofrecer el plan de cuidado antes de que venza',
  ],
  mantenimiento: [
    'Confirmar qué incluye el plan mensual',
    'Agendar el próximo check-in',
    'Publicar una novedad en el portal si hubo un cambio',
  ],
}

export default function AdminClients() {
  const [clients,  setClients]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter,   setFilter]   = useState('')
  const [toast,    setToast]    = useState('')
  const [settings, setSettings] = useState({})

  // Revision form
  const [revDesc,    setRevDesc]    = useState('')
  const [revStatus,  setRevStatus]  = useState('pendiente')
  const [addingRev,  setAddingRev]  = useState(false)

  // Maintenance plan form
  const [maintPrice, setMaintPrice] = useState('')
  const [maintOpen,  setMaintOpen]  = useState(false)

  const [fiche, setFiche] = useState({})
  const [savingFiche, setSavingFiche] = useState(false)
  const [shareBusy, setShareBusy] = useState(false)
  const [updateDraft, setUpdateDraft] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [offline, setOffline] = useState(false)

  const FICHE_FIELDS = [
    ['domain', 'Dominio'],
    ['hosting', 'Hosting'],
    ['frontend', 'Frontend'],
    ['backend', 'Backend'],
    ['database', 'Base de datos'],
    ['storage', 'Storage'],
    ['emails', 'Emails'],
    ['payments', 'Pagos'],
    ['whatsapp', 'WhatsApp'],
    ['analytics', 'Analytics'],
    ['apis', 'APIs'],
    ['accessesNotes', 'Accesos (notas)'],
  ]

  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = () => {
    setLoading(true)
    api.get('/clients')
      .then(r => { setClients(r.data); setOffline(false) })
      .catch(err => setOffline(isConnectionError(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {})
  }, [])

  const filtered = filter ? clients.filter(c => c.stage === filter) : clients

  // ── Avanzar etapa ──────────────────────────────────────────────────────────
  const advanceStage = async () => {
    const idx  = STAGE_ORDER.indexOf(selected.stage)
    if (idx >= STAGE_ORDER.length - 1) return
    const next = STAGE_ORDER[idx + 1]
    const ok   = confirm(`¿Avanzar a "${STAGES.find(s => s.key === next)?.label}"?`)
    if (!ok) return
    await api.put(`/clients/${selected._id}`, { stage: next })
    notify('Etapa actualizada ✓')
    load()
    setSelected(s => ({ ...s, stage: next }))
  }

  // ── Guardar nota ───────────────────────────────────────────────────────────
  const saveNote = async (notes) => {
    await api.put(`/clients/${selected._id}`, { notes })
    notify('Nota guardada ✓')
  }

  // ── Guardar URL ────────────────────────────────────────────────────────────
  const saveUrl = async (field, val) => {
    await api.put(`/clients/${selected._id}`, { [field]: val })
    setSelected(s => ({ ...s, [field]: val }))
    notify('URL guardada ✓')
  }

  // ── Agregar revisión ───────────────────────────────────────────────────────
  const addRevision = async () => {
    if (!revDesc.trim()) return
    setAddingRev(true)
    try {
      const r = await api.put(`/clients/${selected._id}`, {
        revision: { description: revDesc.trim(), status: revStatus },
      })
      setSelected(r.data)
      setRevDesc('')
      setRevStatus('pendiente')
      notify('Revisión registrada ✓')
    } finally { setAddingRev(false) }
  }

  const togglePayment = async (key) => {
    const r = await api.put(`/clients/${selected._id}`, {
      payments: {
        ...(selected.payments || {}),
        [key]: !selected.payments?.[key],
      },
    })
    setSelected(r.data)
    notify('Pago actualizado ✓')
    load()
  }
  const saveMaintenance = async () => {
    const plan = { price: parseFloat(maintPrice) || 0, currency: selected.currency || 'USD', startDate: new Date() }
    await api.put(`/clients/${selected._id}`, { maintenancePlan: plan })
    setSelected(s => ({ ...s, maintenancePlan: plan }))
    setMaintOpen(false)
    notify('Plan de mantenimiento guardado ✓')
    generateMaintenancePDF(selected, plan, settings)
  }

  // ── Acciones de documentos / emails ───────────────────────────────────────
  const handleDocAction = (action) => {
    const c = selected
    switch (action) {
      case 'agreement':         return generateAgreementPDF(c, settings)
      case 'revisions':         return generateRevisionsPDF(c, c.revisionsList || [], settings)
      case 'delivery':          return generateDeliveryPDF(c, settings)
      case 'guide':             return generateUserGuidePDF(c, settings)
      case 'maintenance':       return generateMaintenancePDF(c, c.maintenancePlan || {}, settings)
      case 'email-start':       return generateStartEmail(c, settings)
      case 'email-revision':    return generateRevisionEmail(c, settings)
      case 'email-delivery':    return generateDeliveryEmail(c, settings)
      case 'email-maintenance': return generateMaintenanceEmail(c, c.maintenancePlan || {}, settings)
      default: break
    }
  }

  // ── Stagings / production URL edit ────────────────────────────────────────
  const [editUrl, setEditUrl] = useState({ staging: '', production: '' })
  useEffect(() => {
    if (selected) {
      setEditUrl({ staging: selected.stagingUrl || '', production: selected.productionUrl || '' })
      setFiche(selected.techFiche || {})
      setCheckIn(selected.care?.checkInAt || '')
    }
  }, [selected?._id])

  const saveFiche = async () => {
    setSavingFiche(true)
    try {
      const r = await api.put(`/clients/${selected._id}`, { techFiche: fiche })
      setSelected(r.data)
      notify('Ficha técnica guardada ✓')
    } finally {
      setSavingFiche(false)
    }
  }

  const toggleKickoff = async (id, done) => {
    if (!selected) return
    try {
      const r = await api.put(`/clients/${selected._id}`, {
        kickoff: { checks: { [id]: { done } } },
      })
      setSelected(r.data)
      setClients((list) => list.map((c) => (c._id === r.data._id ? r.data : c)))
    } catch {
      notify('No se pudo actualizar el checklist')
    }
  }

  const sharePortalLink = async () => {
    if (!selected) return
    setShareBusy(true)
    try {
      const res = await api.post(`/clients/${selected._id}/portal-link`)
      const path = res.data.path || `/portal/${res.data.token}`
      const url = `${window.location.origin}${path}`
      setSelected(res.data.client)
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        notify('Link del portal copiado')
      } else {
        notify(url)
      }
    } catch {
      notify('No pude generar el link del portal')
    } finally {
      setShareBusy(false)
    }
  }

  const sendClientUpdate = async () => {
    if (!updateDraft.trim()) return
    const r = await api.put(`/clients/${selected._id}`, { clientUpdate: updateDraft.trim() })
    setSelected(r.data)
    setUpdateDraft('')
    notify('Novedad publicada en el portal ✓')
  }

  const setCareStatus = async (status, extra = {}) => {
    const r = await api.put(`/clients/${selected._id}`, { care: { status, ...extra } })
    setSelected(r.data)
    notify('Cuidado actualizado ✓')
  }

  const offerCare = async () => {
    const r = await api.put(`/clients/${selected._id}`, {
      care: { status: 'offered' },
      clientUpdate: 'Te dejé el plan de cuidado para cuando termine la garantía: backups, hosting y cambios chicos.',
    })
    setSelected(r.data)
    notify('Plan de cuidado ofrecido en el portal ✓')
  }

  const setWarrantyTicketStatus = async (id, status) => {
    const r = await api.put(`/clients/${selected._id}`, {
      warrantyTicketId: id,
      warrantyTicketStatus: status,
    })
    setSelected(r.data)
  }

  const saveCheckIn = async () => {
    const r = await api.put(`/clients/${selected._id}`, { care: { checkInAt: checkIn } })
    setSelected(r.data)
    notify('Check-in guardado ✓')
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (offline) {
    return (
      <AdminLayout title="Clientes">
        <ConnectionError
          onRetry={load}
          retrying={loading}
          message="El panel no puede comunicarse con la API. Revisá que el backend esté levantado y volvé a intentar."
        />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Clientes">
      {toast && <div className="toast success">{toast}</div>}

      {/* Filtros por etapa */}
      <div className="clients-header">
        <div className="filter-tabs">
          <button className={`filter-tab ${!filter ? 'filter-tab--active' : ''}`} onClick={() => setFilter('')}>
            Todos ({clients.length})
          </button>
          {STAGES.map(s => (
            <button
              key={s.key}
              className={`filter-tab ${filter === s.key ? 'filter-tab--active' : ''}`}
              style={filter === s.key ? {} : {}}
              onClick={() => setFilter(s.key)}
            >
              <span className="stage-dot" style={{ background: s.color }} />
              {s.label} ({clients.filter(c => c.stage === s.key).length})
            </button>
          ))}
        </div>
      </div>

      <div className="clients-layout">
        {/* Lista */}
        <div className="clients-list">
          {loading ? (
            <div className="ql-loading">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="ql-empty">
              <i className="fas fa-users" />
              <p>Sin clientes en esta etapa</p>
            </div>
          ) : filtered.map(c => {
            const stage = STAGES.find(s => s.key === c.stage)
            return (
              <div
                key={c._id}
                className={`client-item ${selected?._id === c._id ? 'client-item--active' : ''}`}
                onClick={() => setSelected(c)}
              >
                <div className="client-item__top">
                  <div className="client-item__avatar">{c.clientName.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="client-item__name">{c.clientName}</p>
                    <p className="client-item__email">{c.email}</p>
                  </div>
                  <span className="stage-dot" style={{ background: stage?.color || '#aaa' }} title={stage?.label} />
                </div>
                <div className="client-item__bottom">
                  <span className="tag">{c.projectType}</span>
                  {c.finalPrice && (
                    <span className="client-item__price">
                      {c.currency === 'EUR' ? '€' : '$'}{c.finalPrice.toLocaleString()} {c.currency || 'USD'}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Detalle */}
        {selected ? (
          <div className="client-detail">
            {/* Header */}
            <div className="client-detail__header">
              <div className="client-detail__client">
                <div className="client-detail__avatar">{selected.clientName.charAt(0).toUpperCase()}</div>
                <div>
                  <h2>{selected.clientName}</h2>
                  <a href={`mailto:${selected.email}`}>{selected.email}</a>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={sharePortalLink} disabled={shareBusy}>
                  <i className="fas fa-link" /> {shareBusy ? 'Generando…' : 'Link portal'}
                </button>
                <button className="modal__close" onClick={() => setSelected(null)}><i className="fas fa-times" /></button>
              </div>
            </div>

            {/* Progress bar de etapas */}
            <div className="stage-progress-bar">
              {STAGES.map((s, i) => {
                const idx     = STAGE_ORDER.indexOf(selected.stage)
                const thisIdx = STAGE_ORDER.indexOf(s.key)
                const isDone  = thisIdx < idx
                const isCurr  = s.key === selected.stage
                return (
                  <div key={s.key} className={`spb-step ${isDone ? 'spb-done' : ''} ${isCurr ? 'spb-current' : ''}`}>
                    <div className="spb-dot" style={{ background: isCurr || isDone ? s.color : undefined }}>
                      {isDone ? <i className="fas fa-check" /> : i + 1}
                    </div>
                    <span>{s.label}</span>
                  </div>
                )
              })}
            </div>

            <div className="client-detail__body">
              {/* Info grid */}
              <div className="client-detail__grid">
                <div className="client-detail__field"><label>Tipo de proyecto</label><span>{selected.projectType}</span></div>
                <div className="client-detail__field"><label>Tecnologías</label><span>{selected.tech || '—'}</span></div>
                {selected.finalPrice && (
                  <div className="client-detail__field">
                    <label>Valor del proyecto</label>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      {selected.currency === 'EUR' ? '€' : '$'}{selected.finalPrice.toLocaleString()} {selected.currency || 'USD'}
                    </span>
                  </div>
                )}
                <div className="client-detail__field"><label>Plazo acordado</label><span>{selected.deadline ? `${selected.deadline} días` : '—'}</span></div>
                <div className="client-detail__field">
                  <label>Revisiones</label>
                  <span>{selected.revisionsUsed || 0} usadas / {selected.revisions || '—'} incluidas</span>
                </div>
                <div className="client-detail__field">
                  <label>Etapa actual</label>
                  <span style={{ color: STAGES.find(s => s.key === selected.stage)?.color }}>
                    {STAGES.find(s => s.key === selected.stage)?.label}
                  </span>
                </div>
              </div>

                {selected.finalPrice && (
                  <div className="client-detail__section">
                    <label>Pagos del proyecto (40 / 30 / 30)</label>
                    <div className="tasks-list">
                      {[
                        { key: 'startPaid', label: '40% al arrancar', pct: 0.4 },
                        { key: 'midPaid', label: '30% a mitad', pct: 0.3 },
                        { key: 'endPaid', label: '30% contra entrega', pct: 0.3 },
                      ].map((p) => {
                        const paid = Boolean(selected.payments?.[p.key])
                        const amt = Math.round((selected.finalPrice || 0) * p.pct)
                        return (
                          <button
                            key={p.key}
                            type="button"
                            className="task-row"
                            onClick={() => togglePayment(p.key)}
                            style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                          >
                            <i className={`fas ${paid ? 'fa-check-circle' : 'fa-circle'}`} style={{ color: paid ? '#28a745' : 'var(--text-faint)' }} />
                            <span>{p.label} · {selected.currency === 'EUR' ? '€' : '$'}{amt.toLocaleString()} {selected.currency || 'USD'}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

              {/* Ficha técnica */}
              <div className="client-detail__section">
                <label>Ficha técnica</label>
                {selected.onboarding?.submittedAt && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                    Onboarding recibido el {new Date(selected.onboarding.submittedAt).toLocaleString('es-AR')}
                  </p>
                )}
                <div className="fiche-grid">
                  {FICHE_FIELDS.map(([key, label]) => (
                    key === 'accessesNotes' || key === 'apis' ? (
                      <label key={key} className="onboard-block" style={{ gridColumn: '1 / -1' }}>
                        {label}
                        <textarea
                          className="form-control"
                          rows={2}
                          value={fiche[key] || ''}
                          onChange={(e) => setFiche((f) => ({ ...f, [key]: e.target.value }))}
                        />
                      </label>
                    ) : (
                      <label key={key} className="onboard-block">
                        {label}
                        <input
                          className="form-control"
                          value={fiche[key] || ''}
                          onChange={(e) => setFiche((f) => ({ ...f, [key]: e.target.value }))}
                        />
                      </label>
                    )
                  ))}
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={saveFiche} disabled={savingFiche}>
                  {savingFiche ? 'Guardando…' : 'Guardar ficha técnica'}
                </button>
              </div>

              <div className="client-detail__section">
                <label>Portal del cliente</label>
                {selected.portalToken && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 10px', wordBreak: 'break-all' }}>
                    <a href={`/portal/${selected.portalToken}`} target="_blank" rel="noreferrer">
                      /portal/{selected.portalToken.slice(0, 8)}…
                    </a>
                  </p>
                )}
                {(selected.updates || []).slice(-5).reverse().map((item, i) => (
                  <p key={`${item.date}-${i}`} style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 6px' }}>
                    {item.date ? new Date(item.date).toLocaleDateString('es-AR') : ''} · {item.message}
                  </p>
                ))}
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Novedad visible en el portal (ej: esta semana queda el home)"
                  value={updateDraft}
                  onChange={(e) => setUpdateDraft(e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                <button type="button" className="btn btn-outline btn-sm" onClick={sendClientUpdate} disabled={!updateDraft.trim()}>
                  Publicar novedad
                </button>
              </div>

              {/* URLs */}
              <div className="client-detail__section">
                <label>URLs del proyecto</label>
                <div className="url-row">
                  <input
                    className="form-control url-input"
                    placeholder="URL de staging / demo"
                    value={editUrl.staging}
                    onChange={e => setEditUrl(u => ({ ...u, staging: e.target.value }))}
                    onBlur={() => saveUrl('stagingUrl', editUrl.staging)}
                  />
                  <input
                    className="form-control url-input"
                    placeholder="URL en producción"
                    value={editUrl.production}
                    onChange={e => setEditUrl(u => ({ ...u, production: e.target.value }))}
                    onBlur={() => saveUrl('productionUrl', editUrl.production)}
                  />
                </div>
              </div>

              {/* Checklist de arranque */}
              {selected.kickoffStatus && (
                <div className="client-detail__section">
                  <label>
                    Para arrancar necesitamos…{' '}
                    <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>
                      {selected.kickoffStatus.doneCount}/{selected.kickoffStatus.total}
                      {selected.kickoffStatus.ready ? ' · listo' : ''}
                    </span>
                  </label>
                  <div className="kickoff-list">
                    {(selected.kickoffStatus.items || []).map((item) => (
                      <label key={item.id} className={`kickoff-row ${item.done ? 'is-done' : ''}`}>
                        <input
                          type="checkbox"
                          checked={Boolean(item.done)}
                          onChange={(e) => toggleKickoff(item.id, e.target.checked)}
                        />
                        <span>
                          {item.label}
                          {item.source === 'auto' && item.done ? (
                            <small> · auto</small>
                          ) : null}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tareas de la etapa */}
              <div className="client-detail__section">
                <label>Tareas de esta etapa</label>
                <div className="tasks-list">
                  {(STAGE_TASKS[selected.stage] || []).map((t, i) => (
                    <div key={i} className="task-row">
                      <i className="fas fa-arrow-right task-arrow" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documentos de la etapa */}
              <div className="client-detail__section">
                <label>Documentos y emails de esta etapa</label>
                <div className="docs-grid">
                  {(STAGE_DOCS[selected.stage] || []).map(doc => (
                    <button
                      key={doc.action}
                      className={`doc-btn ${doc.action.startsWith('email') ? 'doc-btn--email' : 'doc-btn--pdf'}`}
                      onClick={() => handleDocAction(doc.action)}
                    >
                      <i className={`fas ${doc.icon}`} />
                      {doc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Revisiones (solo en etapa revisión) */}
              {(selected.stage === 'revision' || selected.stage === 'activo' || (selected.revisionsList || []).length > 0) && (
                <div className="client-detail__section">
                  <label>Registro de revisiones</label>
                  {(selected.revisionsList || []).map((r, i) => (
                    <div key={i} className="rev-row">
                      <span className="rev-desc">
                        {r.fromClient ? 'Cliente: ' : ''}{r.description}
                      </span>
                      <span className={`rev-status rev-${r.status}`}>
                        {r.status === 'aprobado' ? 'Aprobado' : r.status === 'fuera-de-alcance' ? 'Fuera de alcance' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                  <div className="rev-form">
                    <input
                      className="form-control"
                      placeholder="Descripción del cambio solicitado"
                      value={revDesc}
                      onChange={e => setRevDesc(e.target.value)}
                    />
                    <select className="form-control" value={revStatus} onChange={e => setRevStatus(e.target.value)}>
                      <option value="pendiente">Pendiente</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="fuera-de-alcance">Fuera de alcance</option>
                    </select>
                    <button className="btn btn-outline btn-sm" onClick={addRevision} disabled={addingRev}>
                      <i className="fas fa-plus" /> Agregar
                    </button>
                  </div>
                </div>
              )}

              {/* Plan de mantenimiento (solo cuando entregado+) */}
              {(selected.stage === 'entregado' || selected.stage === 'mantenimiento') && (
                <div className="client-detail__section">
                  <label>Garantía (15 días desde la entrega)</label>
                  {selected.warranty?.endsAt ? (
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                      Hasta {new Date(selected.warranty.endsAt).toLocaleDateString('es-AR')}
                      {new Date(selected.warranty.endsAt) >= new Date() ? ' · activa' : ' · vencida'}
                    </p>
                  ) : (
                    <p className="portal-muted" style={{ margin: '0 0 10px' }}>Se activa al pasar a Entregado.</p>
                  )}
                  {(selected.warrantyTickets || []).map((t) => (
                    <div key={t._id} className="rev-row">
                      <span className="rev-desc">{t.description}</span>
                      <select
                        className="form-control"
                        style={{ maxWidth: 180 }}
                        value={t.status}
                        onChange={(e) => setWarrantyTicketStatus(t._id, e.target.value)}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="cubierto">Cubierto</option>
                        <option value="fuera-de-alcance">Fuera de alcance</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {(selected.stage === 'entregado' || selected.stage === 'mantenimiento') && (
                <div className="client-detail__section">
                  <label>Plan de mantenimiento</label>
                  {selected.maintenancePlan?.price ? (
                    <div className="maint-info">
                      <span>
                        {selected.currency === 'EUR' ? '€' : '$'}
                        {selected.maintenancePlan.price.toLocaleString()} {selected.currency || 'USD'}/mes
                      </span>
                      <button className="btn btn-outline btn-sm" onClick={() => generateMaintenancePDF(selected, selected.maintenancePlan, settings)}>
                        <i className="fas fa-file-pdf" /> Ver propuesta
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-outline btn-sm" onClick={() => setMaintOpen(true)}>
                      <i className="fas fa-plus" /> Definir plan mensual
                    </button>
                  )}
                  {maintOpen && (
                    <div className="maint-form">
                      <input
                        className="form-control"
                        type="number"
                        placeholder={`Precio mensual (${selected.currency || 'USD'})`}
                        value={maintPrice}
                        onChange={e => setMaintPrice(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={saveMaintenance}>Guardar y generar PDF</button>
                        <button className="btn btn-outline btn-sm" onClick={() => setMaintOpen(false)}>Cancelar</button>
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '12px 0 8px' }}>
                    Estado de cuidado: <strong>{selected.care?.status === 'active' ? 'activo' : selected.care?.status === 'offered' ? 'ofrecido' : selected.care?.status === 'declined' ? 'no quiere' : selected.care?.status === 'paused' ? 'pausado' : 'sin ofrecer'}</strong>
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selected.care?.status !== 'offered' && selected.care?.status !== 'active' && (
                      <button type="button" className="btn btn-outline btn-sm" onClick={offerCare}>Ofrecer plan en el portal</button>
                    )}
                    {selected.care?.status !== 'active' && (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setCareStatus('active')}>Marcar cuidado activo</button>
                    )}
                    {selected.care?.status === 'active' && (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setCareStatus('paused')}>Pausar</button>
                    )}
                    {selected.care?.status !== 'declined' && (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setCareStatus('declined')}>No quiere plan</button>
                    )}
                  </div>
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label className="form-label">Próximo check-in</label>
                    <input
                      className="form-control"
                      placeholder="Ej: 15 sep"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      onBlur={saveCheckIn}
                    />
                  </div>
                </div>
              )}

              {/* Notas internas */}
              <div className="client-detail__section">
                <label>Notas internas</label>
                <NoteEditor initial={selected.notes || ''} onSave={saveNote} />
              </div>

              {/* Avanzar etapa */}
              {STAGE_ORDER.indexOf(selected.stage) < STAGE_ORDER.length - 1 && (
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={advanceStage}>
                    Avanzar a "{STAGES.find(s => s.key === STAGE_ORDER[STAGE_ORDER.indexOf(selected.stage) + 1])?.label}" →
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="client-detail client-detail--empty">
            <i className="fas fa-users" />
            <p>Seleccioná un cliente para ver el detalle</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

// ── Subcomponente: editor de notas con guardado ───────────────────────────────
function NoteEditor({ initial, onSave }) {
  const [val,   setVal]   = useState(initial)
  const [saved, setSaved] = useState(false)
  useEffect(() => setVal(initial), [initial])
  const handle = () => { onSave(val); setSaved(true); setTimeout(() => setSaved(false), 2000) }
  return (
    <div>
      <textarea
        className="form-control"
        rows={3}
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Notas internas (no las ve el cliente)..."
        style={{ resize: 'vertical', marginBottom: 8 }}
      />
      <button className="btn btn-outline btn-sm" onClick={handle}>
        {saved ? <><i className="fas fa-check" /> Guardado</> : 'Guardar nota'}
      </button>
    </div>
  )
}
