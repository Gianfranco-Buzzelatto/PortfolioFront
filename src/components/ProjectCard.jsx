import { Link } from 'react-router-dom'
import { DEMOS_ENABLED } from '../data/siteContent'
import { getProjectSlug } from '../data/showcaseProjects'
import './ProjectCard.css'

const categoryLabels = {
  web: 'Web', mobile: 'Móvil', design: 'Diseño',
  backend: 'Backend', fullstack: 'Full Stack', otro: 'Otro'
}

function isInternalDemo(url) {
  return url && url.startsWith('/demo/')
}

export default function ProjectCard({ project, delay = 0 }) {
  const rawDemo = project.demoUrl || (isInternalDemo(project.liveUrl) ? project.liveUrl : null)
  const demoLink = DEMOS_ENABLED ? rawDemo : (rawDemo && !isInternalDemo(rawDemo) ? rawDemo : null)
  const detailPath = `/proyectos/${getProjectSlug(project)}`

  return (
    <article
      className="project-card animate-fadeInUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="project-card__image">
        {project.imageUrl
          ? <img src={project.imageUrl} alt={project.title} loading="lazy" decoding="async" width="800" height="450" />
          : <div className="project-card__placeholder">
              <i className="fas fa-code"></i>
            </div>
        }
        <div className="project-card__overlay">
          <div className="project-card__actions">
            <Link to={detailPath} className="btn btn-outline btn-sm">
              Ver caso
            </Link>
            {demoLink && (
              isInternalDemo(demoLink) ? (
                <Link to={demoLink} className="btn btn-primary btn-sm">
                  <i className="fas fa-play" /> Demo
                </Link>
              ) : (
                <a href={demoLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  <i className="fas fa-play" /> Demo
                </a>
              )
            )}
          </div>
        </div>
        {project.featured && <span className="project-card__badge">Caso destacado</span>}
        {demoLink && <span className="project-card__demo-tag"><i className="fas fa-play" /> Demo</span>}
      </div>

      <div className="project-card__body">
        <span className="tag">{categoryLabels[project.category] || project.category}</span>
        <h3 className="project-card__title">
          <Link to={detailPath}>{project.title}</Link>
        </h3>
        <p className="project-card__desc">{project.description}</p>
        {project.technologies?.length > 0 && (
          <div className="project-card__techs">
            {project.technologies.slice(0, 4).map(tech => (
              <span key={tech} className="project-card__tech">{tech}</span>
            ))}
            {project.technologies.length > 4 && (
              <span className="project-card__tech">+{project.technologies.length - 4}</span>
            )}
          </div>
        )}
        <Link to={detailPath} className="project-card__demo-link">
          Ver caso completo <i className="fas fa-arrow-right" />
        </Link>
      </div>
    </article>
  )
}
