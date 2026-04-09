import './ProjectCard.css'

const categoryLabels = {
  web: 'Web', mobile: 'Móvil', design: 'Diseño',
  backend: 'Backend', fullstack: 'Full Stack', otro: 'Otro'
}

export default function ProjectCard({ project, delay = 0 }) {
  return (
    <article
      className="project-card animate-fadeInUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="project-card__image">
        {project.imageUrl
          ? <img src={project.imageUrl} alt={project.title} />
          : <div className="project-card__placeholder">
              <i className="fas fa-code"></i>
            </div>
        }
        <div className="project-card__overlay">
          <div className="project-card__actions">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                <i className="fas fa-external-link-alt" /> Ver sitio
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                <i className="fab fa-github" /> Repositorio
              </a>
            )}
          </div>
        </div>
        {project.featured && <span className="project-card__badge">Caso destacado</span>}
      </div>

      <div className="project-card__body">
        <span className="tag">{categoryLabels[project.category] || project.category}</span>
        <h3 className="project-card__title">{project.title}</h3>
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
      </div>
    </article>
  )
}
