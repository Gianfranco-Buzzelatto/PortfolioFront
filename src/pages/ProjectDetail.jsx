import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import api from '../hooks/useApi'
import Seo from '../seo/Seo'
import { breadcrumbJsonLd } from '../seo/jsonld'
import Reveal from '../components/Reveal'
import { DEMOS_ENABLED } from '../data/siteContent'
import {
  SHOWCASE_PROJECTS,
  findShowcaseBySlug,
  getProjectSlug,
} from '../data/showcaseProjects'
import '../components/MarketingShell.css'
import '../components/ProjectCard.css'

function isInternalDemo(url) {
  return url && url.startsWith('/demo/')
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const [project, setProject] = useState(() => findShowcaseBySlug(slug))
  const [loading, setLoading] = useState(!findShowcaseBySlug(slug))

  useEffect(() => {
    const local = findShowcaseBySlug(slug)
    if (local) {
      setProject(local)
      setLoading(false)
      return
    }

    setLoading(true)
    api
      .get('/projects')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : []
        const found =
          list.find((p) => getProjectSlug(p) === slug) ||
          list.find((p) => String(p._id) === slug) ||
          null
        setProject(found)
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <main className="mkt-section">
        <div className="container flex-center" style={{ minHeight: '40vh' }}>Cargando caso…</div>
      </main>
    )
  }

  if (!project) return <Navigate to="/proyectos" replace />

  const demoLink = project.demoUrl
  const path = `/proyectos/${getProjectSlug(project)}`

  return (
    <main>
      <Seo
        title={project.title}
        description={project.description}
        path={path}
        image={project.imageUrl}
        type="article"
        jsonLd={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Proyectos', path: '/proyectos' },
          { name: project.title, path },
        ])}
      />

      <section className="detail-hero">
        <div className="container detail-hero__grid">
          <div>
            <p className="section-label">Caso</p>
            <h1 className="page-hero__title" style={{ textAlign: 'left', marginTop: 8 }}>
              {project.title}
            </h1>
            <p className="page-hero__sub" style={{ textAlign: 'left', margin: '12px 0 0' }}>
              {project.description}
            </p>
            <div className="page-hero__actions" style={{ justifyContent: 'flex-start' }}>
              {DEMOS_ENABLED && demoLink && isInternalDemo(demoLink) && (
                <Link to={demoLink} className="btn btn-primary">Probar demo</Link>
              )}
              <Link to="/cotizar" className={DEMOS_ENABLED && demoLink && isInternalDemo(demoLink) ? 'btn btn-outline' : 'btn btn-primary'}>
                Quiero mi proyecto
              </Link>
            </div>
          </div>
          <div className="detail-hero__media">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt="" width="960" height="600" />
            ) : (
              <div className="project-card__placeholder" style={{ height: 280 }} />
            )}
          </div>
        </div>
      </section>

      {(project.problem || project.solution) && (
        <section className="mkt-section">
          <div className="container detail-blocks">
            {project.problem && (
              <Reveal className="mkt-card">
                <p className="mkt-card__eyebrow">El problema</p>
                <h2>Qué no funcionaba</h2>
                <p>{project.problem}</p>
              </Reveal>
            )}
            {project.solution && (
              <Reveal className="mkt-card" delay={80}>
                <p className="mkt-card__eyebrow">La solución</p>
                <h2>Qué entregamos</h2>
                <p>{project.solution}</p>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {project.outcomes?.length > 0 && (
        <section className="mkt-section mkt-section--elevated">
          <div className="container">
            <div className="section-header">
              <p className="section-label">Resultado</p>
              <h2 className="section-title">Cómo se traduce en el negocio</h2>
            </div>
            <div className="detail-outcomes">
              {project.outcomes.map((o) => (
                <div key={o.label} className="detail-outcome">
                  <strong>{o.value}</strong>
                  <span>{o.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {project.longDescription && (
        <section className="mkt-section">
          <div className="container" style={{ maxWidth: 760 }}>
            <p className="section-label">Detalle</p>
            <h2 className="section-title section-title--left">Más contexto</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginTop: 16 }}>
              {project.longDescription}
            </p>
            {project.technologies?.length > 0 && (
              <div className="project-card__techs" style={{ marginTop: 24 }}>
                {project.technologies.map((t) => (
                  <span key={t} className="project-card__tech">{t}</span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mkt-section mkt-section--elevated">
        <div className="container" style={{ textAlign: 'center', maxWidth: 640 }}>
          <h2 className="section-title">¿Querés algo así para tu negocio?</h2>
          <p className="section-lead" style={{ marginBottom: 28 }}>
            Te armo una propuesta a medida. Respuesta en 24–48 hs hábiles.
          </p>
          <div className="page-hero__actions">
            <Link to="/cotizar" className="btn btn-primary">Quiero mi proyecto</Link>
            <Link to="/proyectos" className="btn btn-outline">Ver más casos</Link>
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="container">
          <p className="section-label">Más casos</p>
          <div className="mkt-grid-3" style={{ marginTop: 24 }}>
            {SHOWCASE_PROJECTS.filter((p) => getProjectSlug(p) !== slug)
              .slice(0, 3)
              .map((p) => (
                <Link key={p._id} to={`/proyectos/${getProjectSlug(p)}`} className="mkt-card">
                  <h3>{p.title}</h3>
                  <p style={{ marginTop: 8 }}>{p.description.slice(0, 120)}…</p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </main>
  )
}
