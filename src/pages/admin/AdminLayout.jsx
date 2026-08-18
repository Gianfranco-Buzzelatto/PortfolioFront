import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

const navItems = [
  { to: '/admin',                icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { to: '/admin/proyectos',      icon: 'fa-folder-open',    label: 'Proyectos' },
  { to: '/admin/cotizaciones',   icon: 'fa-file-invoice',   label: 'Cotizaciones' },
  { to: '/admin/clientes',       icon: 'fa-users',          label: 'Clientes' },
  { to: '/admin/configuracion',  icon: 'fa-cog',            label: 'Configuración' },
]

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <Link to="/" className="admin-brand-logo">
            <span>&lt;</span>Portfolio<span>/&gt;</span>
          </Link>
          <span className="admin-brand-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav__item ${location.pathname === item.to ? 'admin-nav__item--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`fas ${item.icon}`} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-user">
            <div className="admin-user__avatar">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="admin-user__name">{user?.username || 'Admin'}</p>
              <p className="admin-user__role">Administrador</p>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout" title="Cerrar sesión">
            <i className="fas fa-sign-out-alt" />
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-header__burger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className="fas fa-bars" />
          </button>
          <h1 className="admin-header__title">{title}</h1>
          <div className="admin-header__right">
            <Link to="/" target="_blank" className="btn btn-outline btn-sm">
              <i className="fas fa-external-link-alt" /> Ver sitio
            </Link>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  )
}
