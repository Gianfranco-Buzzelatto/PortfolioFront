import { useState, useEffect } from 'react'
import ProjectCard from '../components/ProjectCard'
import api from '../hooks/useApi'
import { SHOWCASE_PROJECTS } from '../data/showcaseProjects'
import './Projects.css'

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Móvil' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'backend', label: 'Backend' },
  { value: 'design', label: 'Diseño' },
]

export default function Projects() {
  const [projects, setProjects]   = useState([])
  const [filtered, setFiltered]   = useState([])
  const [category, setCategory]   = useState('')
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api
      .get('/projects')
      .then((r) => {
        const list = Array.isArray(r.data) && r.data.length > 0 ? r.data : SHOWCASE_PROJECTS
        setProjects(list)
        setFiltered(list)
      })
      .catch(() => {
        setProjects(SHOWCASE_PROJECTS)
        setFiltered(SHOWCASE_PROJECTS)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!category) setFiltered(projects)
    else setFiltered(projects.filter(p => p.category === category))
  }, [category, projects])

  return (
    <main className="projects-page">
      {/* Hero */}
      <section className="page-hero texture-bg">
        <div className="container page-hero__content">
          <p className="section-label">Casos de trabajo</p>
          <h1 className="page-hero__title">Proyectos que resuelven problemas reales</h1>
          <p className="page-hero__sub">
            Cada entrega está pensada para el negocio del cliente: más ventas, mejor operación o presencia profesional.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="projects-filters">
        <div className="container">
          <div className="filter-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                className={`filter-tab ${category === cat.value ? 'filter-tab--active' : ''}`}
                onClick={() => setCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="projects-grid-section">
        <div className="container">
          {loading ? (
            <div className="projects-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" style={{height:'380px'}} />)}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="projects-count">{filtered.length} proyecto{filtered.length !== 1 ? 's' : ''}</p>
              <div className="projects-grid">
                {filtered.map((p, i) => (
                  <ProjectCard key={p._id} project={p} delay={i * 80} />
                ))}
              </div>
            </>
          ) : (
            <div className="projects-empty">
              <i className="fas fa-search"></i>
              <p>No hay proyectos en esta categoría todavía.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
