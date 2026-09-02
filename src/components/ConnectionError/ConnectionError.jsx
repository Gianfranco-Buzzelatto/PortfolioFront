import './ConnectionError.css'

/**
 * Pantalla para cuando el backend no responde.
 *
 * No se usa en el sitio público general a propósito: el home y las páginas
 * informativas salen de contenido estático y funcionan igual con la API caída.
 * Va sólo donde sin backend no hay nada que mostrar.
 */
export default function ConnectionError({
  onRetry,
  retrying = false,
  title = 'No pudimos conectar con el servidor',
  message = 'Es un problema técnico de nuestro lado, no algo que hayas hecho mal. Probá de nuevo en un momento.',
  whatsappHref,
  compact = false,
}) {
  return (
    <div className={`conn-error ${compact ? 'conn-error--compact' : ''}`} role="alert">
      <span className="conn-error__icon" aria-hidden="true">
        <i className="fas fa-plug-circle-exclamation" />
      </span>

      <h2 className="conn-error__title">{title}</h2>
      <p className="conn-error__text">{message}</p>

      <div className="conn-error__actions">
        {onRetry && (
          <button type="button" className="btn btn-primary" onClick={onRetry} disabled={retrying}>
            <i className={`fas ${retrying ? 'fa-spinner fa-spin' : 'fa-rotate-right'}`} />
            {retrying ? ' Reintentando…' : ' Reintentar'}
          </button>
        )}
        {whatsappHref && (
          <a className="btn btn-outline" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp" /> Escribinos por WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}
