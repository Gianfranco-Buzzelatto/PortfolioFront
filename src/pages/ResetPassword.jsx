import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../hooks/useApi'
import Seo from '../seo/Seo'
import { isConnectionError } from '../utils/apiError'
import './Login.css'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      if (isConnectionError(err)) {
        setError('No pudimos conectar con el servidor. Volvé a intentar en un momento.')
      } else {
        setError(err.response?.data?.message || 'No pudimos actualizar la contraseña')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page texture-bg">
      <Seo title="Nueva contraseña" path="/reset-password" noindex />
      <div className="login-card animate-fadeInUp">
        <div className="login-card__header">
          <Link to="/" className="login-logo" aria-label="GB.Dev">
            GB<span className="login-logo__dot">.</span>Dev
          </Link>
          <h1>Nueva contraseña</h1>
          <p>Elegí una contraseña de al menos 8 caracteres</p>
        </div>

        {done ? (
          <div className="login-form">
            <div className="login-success">
              <i className="fas fa-check-circle" /> Contraseña actualizada. Te llevamos al login...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                <i className="fas fa-exclamation-circle" /> {error}{' '}
                {error.includes('venció') && <Link to="/forgot-password">Pedir otro link</Link>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <div className="password-field">
                <input
                  className="form-control"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-field__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Repetir contraseña</label>
              <input
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              {loading ? 'Guardando...' : <><i className="fas fa-key" /> Guardar contraseña</>}
            </button>
          </form>
        )}

        <div className="login-back">
          <Link to="/login">← Volver al login</Link>
        </div>
      </div>
    </div>
  )
}
