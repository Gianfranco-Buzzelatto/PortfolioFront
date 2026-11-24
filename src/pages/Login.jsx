import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../hooks/useApi'
import Seo from '../seo/Seo'
import { isConnectionError } from '../utils/apiError'
import './Login.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const r = await api.post('/auth/login', form)
      login(r.data.user, r.data.token)
      navigate('/admin')
    } catch (err) {
      // Sin esto, un backend caído se reportaba como "Credenciales incorrectas"
      // y te mandaba a buscar el problema en el lugar equivocado.
      if (isConnectionError(err)) {
        setError('No pudimos conectar con el servidor. Revisá que el backend esté levantado y volvé a intentar en un momento.')
      } else {
        setError(err.response?.data?.message || 'Credenciales incorrectas')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page texture-bg">
      <Seo title="Acceso admin" path="/login" noindex />
      <div className="login-card animate-fadeInUp">
        <div className="login-card__header">
          <Link to="/" className="login-logo" aria-label="GB.Dev">
            GB<span className="login-logo__dot">.</span>Dev
          </Link>
          <h1>Panel Admin</h1>
          <p>Iniciá sesión para gestionar tu portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="password-field">
              <input
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-field__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden />
              </button>
            </div>
            <div className="login-forgot">
              <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading ? 'Ingresando...' : <><i className="fas fa-sign-in-alt" /> Ingresar</>}
          </button>
        </form>

        <div className="login-back">
          <Link to="/">← Volver al portfolio</Link>
        </div>
      </div>
    </div>
  )
}
