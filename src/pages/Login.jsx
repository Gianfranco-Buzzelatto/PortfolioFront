import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../hooks/useApi'
import './Login.css'

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const r = await api.post('/auth/login', form)
      login(r.data.user, r.data.token)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-page texture-bg">
      <div className="login-card animate-fadeInUp">
        <div className="login-card__header">
          <Link to="/" className="login-logo">
            <span>&lt;</span>Portfolio<span>/&gt;</span>
          </Link>
          <h1>Panel Admin</h1>
          <p>Iniciá sesión para gestionar tu portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error"><i className="fas fa-exclamation-circle"/> {error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={e => setForm(f => ({...f, email: e.target.value}))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-control"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({...f, password: e.target.value}))}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{width:'100%', justifyContent:'center', marginTop:8}}>
            {loading ? 'Ingresando...' : <><i className="fas fa-sign-in-alt"/> Ingresar</>}
          </button>
        </form>

        <div className="login-back">
          <Link to="/">← Volver al portfolio</Link>
        </div>
      </div>
    </div>
  )
}
