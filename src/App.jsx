import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { DEMOS_ENABLED } from './data/siteContent'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Solutions from './pages/Solutions'
import Demos from './pages/Demos'
import Care from './pages/Care'
import Quote from './pages/Quote'
import AcceptProposal from './pages/AcceptProposal'
import AcceptContract from './pages/AcceptContract'
import ClientOnboarding from './pages/ClientOnboarding'
import ClientPortal from './pages/ClientPortal'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProjects from './pages/admin/AdminProjects'
import AdminQuotes from './pages/admin/AdminQuotes'
import AdminSettings from './pages/admin/AdminSettings'
import AdminClients from './pages/admin/AdminClients'
import ProjectDemo from './pages/demos/ProjectDemo'
import ScrollToHash from './components/ScrollToHash'
import WhatsAppFloat from './components/WhatsAppFloat'
import SmoothScroll from './components/SmoothScroll'
import MaintenanceGate from './components/Maintenance/MaintenanceGate'

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
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Navbar />
      <div id="contenido">{children}</div>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <SmoothScroll>
          <BrowserRouter>
            <ScrollToHash />
            <MaintenanceGate>
              <Routes>
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/soluciones" element={<PublicLayout><Solutions /></PublicLayout>} />
                <Route
                  path="/demos"
                  element={DEMOS_ENABLED ? <PublicLayout><Demos /></PublicLayout> : <Navigate to="/proyectos" replace />}
                />
                <Route path="/proyectos" element={<PublicLayout><Projects /></PublicLayout>} />
                <Route path="/proyectos/:slug" element={<PublicLayout><ProjectDetail /></PublicLayout>} />
                <Route path="/cuidado" element={<PublicLayout><Care /></PublicLayout>} />
                <Route path="/cotizar" element={<PublicLayout><Quote /></PublicLayout>} />
                <Route path="/propuesta/:token" element={<PublicLayout><AcceptProposal /></PublicLayout>} />
                <Route path="/contrato/:token" element={<PublicLayout><AcceptContract /></PublicLayout>} />
                <Route path="/onboarding/:token" element={<PublicLayout><ClientOnboarding /></PublicLayout>} />
                <Route path="/portal/:token" element={<PublicLayout><ClientPortal /></PublicLayout>} />
                <Route
                  path="/demo/:slug"
                  element={DEMOS_ENABLED ? <ProjectDemo /> : <Navigate to="/proyectos" replace />}
                />

                {adminEnabled && (
                  <>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                    <Route path="/admin/proyectos" element={<PrivateRoute><AdminProjects /></PrivateRoute>} />
                    <Route path="/admin/cotizaciones" element={<PrivateRoute><AdminQuotes /></PrivateRoute>} />
                    <Route path="/admin/clientes" element={<PrivateRoute><AdminClients /></PrivateRoute>} />
                    <Route path="/admin/configuracion" element={<PrivateRoute><AdminSettings /></PrivateRoute>} />
                  </>
                )}

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MaintenanceGate>
          </BrowserRouter>
        </SmoothScroll>
      </SettingsProvider>
    </AuthProvider>
  )
}
