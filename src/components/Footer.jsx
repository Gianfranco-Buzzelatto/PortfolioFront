import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { whatsappHref } from '../utils/whatsapp'
import './Footer.css'

export default function Footer() {
  const settings = useSettings()
  const email = settings.email || 'gianbuzzelatto@gmail.com'
  const phone = settings.phone || '+54 11 4160-9741'
  const location = settings.location || 'Buenos Aires, Argentina'
  const github = settings.github || 'https://github.com/Gianfranco-Buzzelatto'
  const linkedin = settings.linkedin || 'https://www.linkedin.com/in/gianfranco-joel-buzzelatto-a0827a163/'
  const wa = whatsappHref(settings.phone)

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__grid">
          <div className="footer__brand">
            <h3 className="footer__logo">
              GB<span className="footer__logo-dot">.</span>Dev
            </h3>
            <p>
              {settings.bio || 'Webs, tiendas online y sistemas a medida para que tu negocio venda mejor y opere con menos fricción.'}
            </p>
            <div className="footer__social">
              <a href={github} aria-label="GitHub" rel="noopener noreferrer" target="_blank">
                <i className="fab fa-github" />
              </a>
              <a href={linkedin} aria-label="LinkedIn" rel="noopener noreferrer" target="_blank">
                <i className="fab fa-linkedin" />
              </a>
            </div>
          </div>

          <div className="footer__links">
            <h4>Navegación</h4>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to={{ pathname: '/', hash: '#servicios' }}>Servicios</Link></li>
              <li><Link to="/proyectos">Proyectos</Link></li>
              <li><Link to="/cotizar">Cotizar</Link></li>
            </ul>
          </div>

          <div className="footer__links">
            <h4>Oferta</h4>
            <ul>
              <li><Link to={{ pathname: '/', hash: '#servicios' }}>Webs y landings</Link></li>
              <li><Link to={{ pathname: '/', hash: '#servicios' }}>E-commerce</Link></li>
              <li><Link to={{ pathname: '/', hash: '#servicios' }}>Sistemas internos</Link></li>
            </ul>
          </div>

          <div className="footer__contact">
            <h4>Contacto</h4>
            <p>
              <i className="fab fa-whatsapp" />{' '}
              <a href={wa} target="_blank" rel="noopener noreferrer">{phone}</a>
            </p>
            <p>
              <i className="fas fa-envelope" />{' '}
              <a href={`mailto:${email}`}>{email}</a>
            </p>
            <p>
              <i className="fas fa-map-marker-alt" /> {location}
            </p>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} {settings.name || 'Gianfranco Buzzelatto'}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
