import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../hooks/useApi'
import Seo from '../seo/Seo'
import { isConnectionError } from '../utils/apiError'
import './Login.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      if (isConnectionError(err)) {
        setError('No pudimos conectar con el servidor. Volvé a intentar en un momento.')
      } else {
        setError(err.response?.data?.message || 'No pudimos procesar el pedido')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page texture-bg">
      <Seo title="Recuperar contraseña" path="/forgot-password" noindex />
      <div className="login-card animate-fadeInUp">
        <div className="login-card__header">
          <Link to="/" className="login-logo" aria-label="GB.Dev">
            GB<span className="login-logo__dot">.</span>Dev
          </Link>
          <h1>Recuperar contraseña</h1>
          <p>Te mandamos un link para crear una nueva</p>
        </div>

        {sent ? (
          <div className="login-form">
            <div className="login-success">
              <i className="fas fa-check-circle" /> Si el email corresponde a un administrador,
              te enviamos un link para restablecer la contraseña. Revisá también la carpeta de spam.
              El link vence en 30 minutos.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                <i className="fas fa-exclamation-circle" /> {error}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email del administrador</label>
              <input
                className="form-control"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              {loading ? 'Enviando...' : <><i className="fas fa-paper-plane" /> Enviar link</>}
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
