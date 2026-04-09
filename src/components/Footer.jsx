import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__grid">
          <div className="footer__brand">
            <h3 className="footer__logo">
              GB<span className="footer__logo-dot">.</span>Dev
            </h3>
            <p>
              Webs, tiendas online y sistemas a medida para que tu negocio venda mejor y opere con menos fricción.
            </p>
            <div className="footer__social">
              <a href="https://github.com/Gianfranco-Buzzelatto" aria-label="GitHub" rel="noopener noreferrer" target="_blank">
                <i className="fab fa-github" />
              </a>
              <a
                href="https://www.linkedin.com/in/gianfranco-joel-buzzelatto-a0827a163/"
                aria-label="LinkedIn"
                rel="noopener noreferrer"
                target="_blank"
              >
                <i className="fab fa-linkedin" />
              </a>
            </div>
          </div>

          <div className="footer__links">
            <h4>Navegación</h4>
            <ul>
              <li>
                <Link to="/">Inicio</Link>
              </li>
              <li>
                <Link to="/#servicios">Servicios</Link>
              </li>
              <li>
                <Link to="/proyectos">Proyectos</Link>
              </li>
              <li>
                <Link to="/cotizar">Cotizar</Link>
              </li>
            </ul>
          </div>

          <div className="footer__links">
            <h4>Oferta</h4>
            <ul>
              <li>
                <Link to="/#servicios">Webs y landings</Link>
              </li>
              <li>
                <Link to="/#servicios">E-commerce</Link>
              </li>
              <li>
                <Link to="/#servicios">Sistemas internos</Link>
              </li>
            </ul>
          </div>

          <div className="footer__contact">
            <h4>Contacto</h4>
            <p>
              <i className="fas fa-envelope" />{' '}
              <a href="mailto:gianbuzzelatto@gmail.com">gianbuzzelatto@gmail.com</a>
            </p>
            <p>
              <i className="fas fa-phone" /> <a href="tel:+541141609741">+54 11 4160-9741</a>
            </p>
            <p>
              <i className="fas fa-map-marker-alt" /> Buenos Aires, Argentina
            </p>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} Gianfranco Buzzelatto. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
