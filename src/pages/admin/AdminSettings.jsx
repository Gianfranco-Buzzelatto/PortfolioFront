import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import api from '../../hooks/useApi'
import './AdminSettings.css'

const EMPTY_ADMIN = { username: '', email: '', password: '' }

export default function AdminSettings() {
  const [form, setForm]     = useState({
    name: '', title: '', bio: '',
    email: '', phone: '', location: '',
    github: '', linkedin: '',
    heroTexts: ['', '', ''],
    skills: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState('')
  const [admins, setAdmins] = useState([])
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [adminError, setAdminError] = useState('')

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadAdmins = () =>
    api.get('/auth/admins')
      .then((r) => setAdmins(Array.isArray(r.data) ? r.data : []))
      .catch(() => setAdmins([]))

  useEffect(() => {
    Promise.all([
      api.get('/settings').then((r) => {
        const s = r.data
        setForm({
          name:      s.name      || '',
          title:     s.title     || '',
          bio:       s.bio       || '',
          email:     s.email     || '',
          phone:     s.phone     || '',
          location:  s.location  || '',
          github:    s.github    || '',
          linkedin:  s.linkedin  || '',
          heroTexts: s.heroTexts?.length ? [...s.heroTexts, '', '', ''].slice(0, 3) : ['', '', ''],
          skills:    s.skills?.join(', ') || '',
        })
      }),
      loadAdmins(),
    ]).finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setHero = (i, v) => setForm(f => {
    const t = [...f.heroTexts]
    t[i] = v
    return { ...f, heroTexts: t }
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings', {
        ...form,
        heroTexts: form.heroTexts.filter(Boolean),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      })
      notify('Configuración guardada ✓')
    } catch { notify('Error al guardar') }
    finally { setSaving(false) }
  }

  const setAdmin = (k, v) => setAdminForm((f) => ({ ...f, [k]: v }))

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setAdminError('')
    setCreatingAdmin(true)
    try {
      const r = await api.post('/auth/admins', {
        username: adminForm.username.trim(),
        email: adminForm.email.trim(),
        password: adminForm.password,
      })
      setAdmins((list) => [...list, r.data.user])
      setAdminForm(EMPTY_ADMIN)
      setShowAdminPassword(false)
      notify('Administrador creado ✓')
    } catch (err) {
      setAdminError(err.response?.data?.message || 'No se pudo crear el administrador')
    } finally {
      setCreatingAdmin(false)
    }
  }

  if (loading) return <AdminLayout title="Configuración"><div style={{textAlign:'center',padding:'80px',color:'var(--gray-light)'}}>Cargando...</div></AdminLayout>

  return (
    <AdminLayout title="Configuración del Portfolio">
      {toast && <div className="toast success">{toast}</div>}

      <div className="settings-layout">
        {/* Perfil */}
        <div className="settings-card">
          <h2 className="settings-card__title"><i className="fas fa-user"/> Información Personal</h2>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Tu nombre</label>
              <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Juan Pérez" />
            </div>
            <div className="form-group">
              <label className="form-label">Título / Rol</label>
              <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Desarrollador Full Stack" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio / Descripción</label>
            <textarea className="form-control" rows={4} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Contá algo sobre vos..." />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label"><i className="fas fa-envelope"/> Email</label>
              <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="hola@tudominio.com" />
            </div>
            <div className="form-group">
              <label className="form-label"><i className="fas fa-phone"/> Teléfono</label>
              <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+54 11 0000-0000" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><i className="fas fa-map-marker-alt"/> Ubicación</label>
            <input className="form-control" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Buenos Aires, Argentina" />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label"><i className="fab fa-github"/> GitHub URL</label>
              <input className="form-control" value={form.github} onChange={e => set('github', e.target.value)} placeholder="https://github.com/usuario" />
            </div>
            <div className="form-group">
              <label className="form-label"><i className="fab fa-linkedin"/> LinkedIn URL</label>
              <input className="form-control" value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/usuario" />
            </div>
          </div>
        </div>

        {/* Hero texts */}
        <div className="settings-card">
          <h2 className="settings-card__title"><i className="fas fa-keyboard"/> Textos del Hero (Typing Effect)</h2>
          <p className="settings-card__desc">Estos textos se mostrarán con animación de escritura en la página principal.</p>
          {[0, 1, 2].map(i => (
            <div className="form-group" key={i}>
              <label className="form-label">Texto {i + 1}</label>
              <input
                className="form-control"
                value={form.heroTexts[i]}
                onChange={e => setHero(i, e.target.value)}
                placeholder={['Desarrollador Full Stack', 'Creador de Experiencias Web', 'Apasionado por el Código'][i]}
              />
            </div>
          ))}

          {/* Preview */}
          {form.heroTexts.some(Boolean) && (
            <div className="settings-hero-preview">
              <p className="settings-card__desc">Vista previa:</p>
              <div className="hero-preview-box">
                {form.heroTexts.filter(Boolean).map((t, i) => (
                  <div key={i} className="hero-preview-text">"{t}"</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="settings-card">
          <h2 className="settings-card__title"><i className="fas fa-code"/> Habilidades / Skills</h2>
          <p className="settings-card__desc">Ingresá tus skills separadas por coma.</p>
          <div className="form-group">
            <textarea
              className="form-control"
              rows={3}
              value={form.skills}
              onChange={e => set('skills', e.target.value)}
              placeholder="React, Node.js, MongoDB, Express, TypeScript, Docker, ..."
            />
          </div>
          {form.skills && (
            <div className="settings-skills-preview">
              {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                <span key={s} className="about__skill">{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Administradores */}
        <div className="settings-card">
          <h2 className="settings-card__title"><i className="fas fa-user-shield" /> Administradores</h2>
          <p className="settings-card__desc">
            Podés crear más usuarios con acceso al panel. Entran con email y contraseña en /login.
          </p>

          <ul className="settings-admins">
            {admins.map((admin) => (
              <li key={admin.id} className="settings-admins__item">
                <div className="settings-admins__avatar" aria-hidden>
                  {(admin.username || admin.email || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="settings-admins__name">{admin.username}</p>
                  <p className="settings-admins__email">{admin.email}</p>
                </div>
              </li>
            ))}
            {admins.length === 0 && (
              <li className="settings-admins__empty">Todavía no hay administradores listados.</li>
            )}
          </ul>

          <form className="settings-admin-form" onSubmit={handleCreateAdmin}>
            <h3 className="settings-admin-form__title">Nuevo administrador</h3>
            {adminError && <div className="settings-admin-form__error" role="alert">{adminError}</div>}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Usuario</label>
                <input
                  className="form-control"
                  value={adminForm.username}
                  onChange={(e) => setAdmin('username', e.target.value)}
                  placeholder="nombre.apellido"
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdmin('email', e.target.value)}
                  placeholder="admin@tudominio.com"
                  required
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="password-field">
                <input
                  className="form-control"
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminForm.password}
                  onChange={(e) => setAdmin('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-field__toggle"
                  onClick={() => setShowAdminPassword((v) => !v)}
                  aria-label={showAdminPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  title={showAdminPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`fas ${showAdminPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden />
                </button>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={creatingAdmin}>
              {creatingAdmin ? 'Creando…' : <><i className="fas fa-user-plus" /> Crear administrador</>}
            </button>
          </form>
        </div>

        {/* Save button */}
        <div className="settings-save">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : <><i className="fas fa-save"/> Guardar todos los cambios</>}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
