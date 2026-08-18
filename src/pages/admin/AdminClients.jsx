import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import api from '../../hooks/useApi'
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
    'Cobrar 40% al arrancar',
    'Crear repositorio / entorno de desarrollo',
    'Compartir confirmación de inicio con el cliente',
    'Mantener actualizaciones semanales',
  ],
  revision: [
    'Subir versión a staging',
    'Enviar link al cliente para revisar',
    'Registrar los cambios solicitados abajo',
    'Verificar que no supere las revisiones incluidas',
    'Cobrar 30% a mitad de proyecto',
  ],
  entregado: [
    'Deploy a producción',
    'Cobrar 30% contra entrega',
    'Entregar accesos y credenciales',
    'Enviar acta de entrega y guía de uso',
  ],
  mantenimiento: [
    'Proponer plan de mantenimiento mensual',
    'Definir precio y qué incluye',
    'Facturar la retención mensual',
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

  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = () => {
    setLoading(true)
    api.get('/clients').then(r => setClients(r.data)).finally(() => setLoading(false))
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
    if (selected) setEditUrl({ staging: selected.stagingUrl || '', production: selected.productionUrl || '' })
  }, [selected?._id])

  // ── Render ─────────────────────────────────────────────────────────────────
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
              <button className="modal__close" onClick={() => setSelected(null)}><i className="fas fa-times" /></button>
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
              {selected.stage === 'revision' && (
                <div className="client-detail__section">
                  <label>Registro de revisiones</label>
                  {(selected.revisionsList || []).map((r, i) => (
                    <div key={i} className="rev-row">
                      <span className="rev-desc">{r.description}</span>
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
