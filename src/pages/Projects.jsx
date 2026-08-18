import { useState, useEffect } from 'react'
import ProjectCard from '../components/ProjectCard'
import api from '../hooks/useApi'
import { SHOWCASE_PROJECTS } from '../data/showcaseProjects'
import './Projects.css'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/projects')
      .then((r) => {
        const list = Array.isArray(r.data) && r.data.length > 0 ? r.data : SHOWCASE_PROJECTS
        setProjects(list)
      })
      .catch(() => {
        setProjects(SHOWCASE_PROJECTS)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="projects-page">
      <section className="page-hero texture-bg">
        <div className="container page-hero__content">
          <p className="section-label">Casos de trabajo</p>
          <h1 className="page-hero__title">Proyectos que resuelven problemas reales</h1>
          <p className="page-hero__sub">
            Cada entrega está pensada para el negocio del cliente: más ventas, mejor operación o presencia profesional.
          </p>
        </div>
      </section>

      <section className="projects-grid-section">
        <div className="container">
          {loading ? (
            <div className="projects-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton-card" style={{ height: '380px' }} />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <>
              <p className="projects-count">
                {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
              </p>
              <div className="projects-grid">
                {projects.map((p, i) => (
                  <ProjectCard key={p._id} project={p} delay={i * 80} />
                ))}
              </div>
            </>
          ) : (
            <div className="projects-empty">
              <i className="fas fa-search" />
              <p>Todavía no hay casos para mostrar.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
