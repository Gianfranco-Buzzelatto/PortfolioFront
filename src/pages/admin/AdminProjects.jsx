import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import api from '../../hooks/useApi'
import './AdminProjects.css'

const EMPTY = {
  title: '', description: '', longDescription: '', technologies: '',
  category: 'web', imageUrl: '', liveUrl: '', githubUrl: '', featured: false, order: 0
}

const CATEGORIES = ['web','mobile','design','backend','fullstack','otro']

function Toast({ msg, type }) {
  return msg ? <div className={`toast ${type}`}>{msg}</div> : null
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)   // null = new
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState({ msg: '', type: '' })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const notify = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: '' }), 3000)
  }

  const load = () => {
    setLoading(true)
    api.get('/projects').then(r => setProjects(r.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openNew = () => {
    setEditing(null); setForm(EMPTY); setShowModal(true)
  }
  const openEdit = (p) => {
    setEditing(p._id)
    setForm({ ...p, technologies: p.technologies?.join(', ') || '' })
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditing(null) }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title || !form.description) return notify('Título y descripción son requeridos', 'error')
    setSaving(true)
    try {
      const payload = {
        ...form,
        technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean)
      }
      if (editing) await api.put(`/projects/${editing}`, payload)
      else         await api.post('/projects', payload)
      notify(editing ? 'Proyecto actualizado ✓' : 'Proyecto creado ✓')
      closeModal(); load()
    } catch { notify('Error al guardar', 'error') }
    finally   { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`)
      notify('Proyecto eliminado')
      setDeleteConfirm(null); load()
    } catch { notify('Error al eliminar', 'error') }
  }

  const toggleFeatured = async (p) => {
    await api.put(`/projects/${p._id}`, { ...p, featured: !p.featured })
    load()
  }

  return (
    <AdminLayout title="Gestión de Proyectos">
      <Toast {...toast} />

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <p className="admin-page-count">{projects.length} proyecto{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus" /> Nuevo Proyecto
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{textAlign:'center', padding:'60px', color:'var(--gray-light)'}}>Cargando...</div>
      ) : projects.length === 0 ? (
        <div className="admin-empty">
          <i className="fas fa-folder-open" />
          <p>No hay proyectos todavía.</p>
          <button className="btn btn-primary" onClick={openNew}>Crear primer proyecto</button>
        </div>
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Categoría</th>
                <th>Tecnologías</th>
                <th>Destacado</th>
                <th>Links</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="project-row__info">
                      <div className="project-row__thumb">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt="" />
                          : <i className="fas fa-code" />
                        }
                      </div>
                      <div>
                        <p className="project-row__title">{p.title}</p>
                        <p className="project-row__desc">{p.description.slice(0,60)}...</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="tag">{p.category}</span></td>
                  <td>
                    <div className="project-row__techs">
                      {p.technologies?.slice(0,3).map(t => <span key={t} className="tech-chip">{t}</span>)}
                      {p.technologies?.length > 3 && <span className="tech-chip">+{p.technologies.length-3}</span>}
                    </div>
                  </td>
                  <td>
                    <button
                      className={`featured-toggle ${p.featured ? 'featured-toggle--on' : ''}`}
                      onClick={() => toggleFeatured(p)}
                      title={p.featured ? 'Quitar destacado' : 'Marcar como destacado'}
                    >
                      <i className="fas fa-star" />
                    </button>
                  </td>
                  <td>
                    <div className="project-row__links">
                      {p.liveUrl   && <a href={p.liveUrl}   target="_blank" rel="noopener" title="Ver live"><i className="fas fa-external-link-alt"/></a>}
                      {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener" title="GitHub"><i className="fab fa-github"/></a>}
                    </div>
                  </td>
                  <td>
                    <div className="project-row__actions">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>
                        <i className="fas fa-edit" />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(p._id)}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal form */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal animate-fadeInUp">
            <div className="modal__header">
              <h2>{editing ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
              <button className="modal__close" onClick={closeModal}><i className="fas fa-times"/></button>
            </div>

            <div className="modal__body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Título *</label>
                  <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Mi proyecto increíble" />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción corta *</label>
                <textarea className="form-control" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Breve descripción del proyecto..." />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción completa</label>
                <textarea className="form-control" rows={4} value={form.longDescription} onChange={e => set('longDescription', e.target.value)} placeholder="Descripción detallada..." />
              </div>

              <div className="form-group">
                <label className="form-label">Tecnologías (separadas por coma)</label>
                <input className="form-control" value={form.technologies} onChange={e => set('technologies', e.target.value)} placeholder="React, Node.js, MongoDB, ..." />
              </div>

              <div className="form-group">
                <label className="form-label">URL de imagen</label>
                <input className="form-control" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">URL en vivo</label>
                  <input className="form-control" value={form.liveUrl} onChange={e => set('liveUrl', e.target.value)} placeholder="https://mi-proyecto.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">URL GitHub</label>
                  <input className="form-control" value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)} placeholder="https://github.com/..." />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Orden</label>
                  <input type="number" className="form-control" value={form.order} onChange={e => set('order', +e.target.value)} />
                </div>
                <div className="form-group form-group--checkbox">
                  <label className="form-label">¿Destacado?</label>
                  <label className="toggle">
                    <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
                    <span className="toggle__slider" />
                    <span>{form.featured ? 'Sí' : 'No'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal__footer">
              <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : <><i className="fas fa-save" /> Guardar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal modal--sm animate-fadeInUp">
            <div className="modal__header">
              <h2>¿Eliminar proyecto?</h2>
            </div>
            <div className="modal__body">
              <p>Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal__footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                <i className="fas fa-trash" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
