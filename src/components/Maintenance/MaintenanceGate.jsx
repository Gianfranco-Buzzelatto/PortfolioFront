import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { whatsappHref } from '../../utils/whatsapp'
import './MaintenanceGate.css'

/**
 * Rutas que el mantenimiento nunca bloquea.
 *
 * El admin y el login, para poder desactivarlo. Y los links con token, porque
 * son privados y ya se los mandaste al cliente: cortarle el acceso a una
 * propuesta o a un contrato mientras tocás el sitio puede frenar una venta.
 */
const ALWAYS_OPEN = ['/login', '/admin', '/propuesta/', '/contrato/', '/onboarding/', '/portal/']

const isOpenPath = (pathname) => ALWAYS_OPEN.some((p) => pathname === p || pathname.startsWith(p))

export default function MaintenanceGate({ children }) {
  const settings = useSettings()
  const { pathname } = useLocation()

  const maintenance = settings.maintenance || {}
  /* Si estás logueado ves el sitio igual, para poder revisarlo mientras dura
     el mantenimiento. El token lo valida el backend en cada request, así que
     esto no expone nada: sólo se salta un cartel. */
  const isAdmin = Boolean(localStorage.getItem('portfolio_token'))
  const blocked = Boolean(maintenance.enabled) && !isOpenPath(pathname)

  useEffect(() => {
    if (!blocked || isAdmin) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [blocked, isAdmin])

  if (blocked && isAdmin) {
    return (
      <>
        {children}
        <div className="maint-badge" role="status">
          <i className="fas fa-triangle-exclamation" />
          Mantenimiento activo · lo ves porque estás logueado
        </div>
      </>
    )
  }

  if (!blocked) return children

  return (
    <div className="maint">
      <div className="maint__card">
        <span className="maint__logo" aria-label="GB.Dev">
          GB<span className="maint__dot">.</span>Dev
        </span>

        <span className="maint__icon" aria-hidden="true">
          <i className="fas fa-screwdriver-wrench" />
        </span>

        <h1 className="maint__title">{maintenance.title || 'Estamos en mantenimiento'}</h1>
        <p className="maint__text">
          {maintenance.message || 'Estamos haciendo mejoras en el sitio. Volvé en un rato.'}
        </p>

        <a
          className="btn btn-primary"
          href={whatsappHref(settings.phone, 'Hola Gianfranco, entré al sitio y está en mantenimiento. Quiero hacerte una consulta.')}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-whatsapp" /> Escribinos por WhatsApp
        </a>
      </div>
    </div>
  )
}
