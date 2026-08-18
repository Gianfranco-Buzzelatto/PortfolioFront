import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Quote from './pages/Quote'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProjects from './pages/admin/AdminProjects'
import AdminQuotes from './pages/admin/AdminQuotes'
import AdminSettings from './pages/admin/AdminSettings'
import AdminClients from './pages/admin/AdminClients'
import ProjectDemo from './pages/demos/ProjectDemo'
import ScrollToHash from './components/ScrollToHash'
import WhatsAppFloat from './components/WhatsAppFloat'

const adminEnabled = import.meta.env.VITE_ENABLE_ADMIN === 'true'

function PrivateRoute({ children }) {
  const { isAuth, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        Cargando...
      </div>
    )
  }
  return isAuth ? children : <Navigate to="/login" replace />
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppFloat />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
      <BrowserRouter>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/proyectos" element={<PublicLayout><Projects /></PublicLayout>} />
          <Route path="/cotizar" element={<PublicLayout><Quote /></PublicLayout>} />
          <Route path="/demo/:slug" element={<ProjectDemo />} />

          {adminEnabled && (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/proyectos" element={<PrivateRoute><AdminProjects /></PrivateRoute>} />
              <Route path="/admin/cotizaciones" element={<PrivateRoute><AdminQuotes /></PrivateRoute>} />
              <Route path="/admin/clientes" element={<PrivateRoute><AdminClients /></PrivateRoute>} />
              <Route path="/admin/configuracion" element={<PrivateRoute><AdminSettings /></PrivateRoute>} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}
