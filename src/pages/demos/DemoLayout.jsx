import { Link, useLocation } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { whatsappHref } from '../../utils/whatsapp'
import Seo from '../../seo/Seo'
import { breadcrumbJsonLd } from '../../seo/jsonld'
import './DemoLayout.css'

export default function DemoLayout({ title, subtitle, client, children }) {
  const settings = useSettings()
  const { pathname } = useLocation()
  const wa = whatsappHref(
    settings.phone,
    `Hola Gianfranco, vi la demo de ${title} y quiero algo así para mi negocio.`
  )

  return (
    <div className="demo-layout">
      <Seo
        title={title}
        description={subtitle || `Demo interactiva: ${title}. Datos de muestra, sin información privada.`}
        path={pathname}
        type="article"
        jsonLd={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Proyectos', path: '/proyectos' },
          { name: title, path: pathname },
        ])}
      />
      <header className="demo-layout__bar">
        <div className="demo-layout__bar-inner">
          <Link to="/proyectos" className="demo-layout__back">
            <i className="fas fa-arrow-left" /> Volver al portfolio
          </Link>
          <div className="demo-layout__meta">
            <span className="demo-layout__badge">Demo interactiva</span>
            {client && <span className="demo-layout__client">{client}</span>}
          </div>
        </div>
      </header>

      <div className="demo-layout__intro">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="demo-layout__frame">
        {children}
      </div>

      <footer className="demo-layout__cta">
        <div className="demo-layout__cta-inner">
          <h2>¿Querés algo así para tu negocio?</h2>
          <p>Te armo una propuesta a medida. Respuesta en 24–48 hs hábiles.</p>
          <div className="demo-layout__cta-actions">
            <Link to="/cotizar" className="btn btn-primary">
              Quiero mi proyecto
            </Link>
            <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp" /> WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
