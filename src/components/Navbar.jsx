import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { scrollToId } from './ScrollToHash'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/', hash: '', label: 'Inicio' },
  { to: '/', hash: 'servicios', label: 'Servicios' },
  { to: '/proyectos', hash: '', label: 'Proyectos' },
  { to: '/', hash: 'contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const goTo = (event, link) => {
    event.preventDefault()
    setMenuOpen(false)
    const nextHash = link.hash ? `#${link.hash}` : ''
    const alreadyThere = location.pathname === link.to && location.hash === nextHash

    if (alreadyThere) {
      scrollToId(link.hash)
      return
    }

    if (location.pathname === link.to) {
      navigate({ pathname: link.to, hash: nextHash }, { replace: false })
      scrollToId(link.hash)
      return
    }

    navigate({ pathname: link.to, hash: nextHash })
  }

  const isActive = (link) => {
    if (link.to !== location.pathname) return false
    const expected = link.hash ? `#${link.hash}` : ''
    return location.hash === expected || (!link.hash && !location.hash)
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link
          to="/"
          className="navbar__brand"
          onClick={(e) => goTo(e, { to: '/', hash: '', label: 'Inicio' })}
        >
          GB<span className="navbar__brand-dot">.</span>Dev
        </Link>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                to={{ pathname: link.to, hash: link.hash ? `#${link.hash}` : '' }}
                className={`navbar__link ${isActive(link) ? 'navbar__link--active' : ''}`}
                onClick={(e) => goTo(e, link)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/cotizar" className="btn btn-primary btn-sm">
              Pedir propuesta
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  )
}
