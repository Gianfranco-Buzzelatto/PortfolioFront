import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProjectCard from '../components/ProjectCard'
import api from '../hooks/useApi'
import { SHOWCASE_PROJECTS } from '../data/showcaseProjects'
import { useSettings } from '../context/SettingsContext'
import { whatsappHref } from '../utils/whatsapp'
import './Home.css'

const CREDENTIAL = {
  title: 'Diplomatura en Programación Web Full Stack',
  institution: 'UTN · Facultad Regional Buenos Aires',
  hours: '150 horas',
  year: '2021',
  pdfUrl: '/docs/diplomatura-programacion-fullstack-utn.pdf',
  verifyUrl: 'https://sysgestion.frba.utn.edu.ar/alumnos/validar_certificado',
}

const MAIN_FORMATION = {
  icon: 'fa-chart-pie',
  iconPack: 'fas',
  label: 'En curso · UBA',
  title: 'Tecnicatura universitaria en Análisis y gestión de datos',
  meta: 'Universidad de Buenos Aires. Formación principal en paralelo al trabajo.',
}

const EXTRA_FORMATION = [
  {
    icon: 'fa-briefcase',
    iconPack: 'fas',
    label: 'En curso · UBA',
    title: 'Licenciatura en Administración',
    meta: 'Universidad de Buenos Aires. Complementa el perfil de negocio.',
  },
  {
    icon: 'fa-react',
    iconPack: 'fab',
    label: 'Especialidad',
    title: 'React — cursos adicionales',
    meta: 'Udemy y formación autodidacta.',
  },
  {
    icon: 'fa-database',
    iconPack: 'fas',
    label: 'Datos',
    title: 'Bases de datos relacionales y no relacionales',
    meta: 'SQL y MongoDB. Udemy y práctica autodidacta.',
  },
]

const SERVICES = [
  {
    icon: 'fa-file-alt',
    title: 'Landing page',
    desc: 'Una página clara para que te encuentren y te escriban por WhatsApp.',
    from: 180,
  },
  {
    icon: 'fa-globe',
    title: 'Sitio institucional',
    desc: 'Varias páginas: servicios, nosotros y contacto. Presencia seria.',
    from: 380,
  },
  {
    icon: 'fa-shopping-cart',
    title: 'Tienda online',
    desc: 'Catálogo, carrito y cobro con Mercado Pago.',
    from: 700,
  },
  {
    icon: 'fa-motorcycle',
    title: 'Pedidos / delivery',
    desc: 'El cliente pide online y vos lo ves en un panel para preparar.',
    from: 1300,
  },
]

export default function Home() {
  const settings = useSettings()
  const [featuredProjects, setFeaturedProjects] = useState(SHOWCASE_PROJECTS)
  const [showMoreFormation, setShowMoreFormation] = useState(false)

  useEffect(() => {
    api
      .get('/projects')
      .then((res) => {
        const allProjects = Array.isArray(res.data) ? res.data : []
        if (allProjects.length === 0) {
          setFeaturedProjects(SHOWCASE_PROJECTS)
          return
        }
        const featured = allProjects.filter((project) => project.featured)
        const source = featured.length > 0 ? featured : allProjects
        setFeaturedProjects(source.slice(0, 3))
      })
      .catch(() => {
        setFeaturedProjects(SHOWCASE_PROJECTS)
      })
  }, [])

  const wa = whatsappHref(settings.phone)

  return (
    <main className="home">
      <section className="hero hero--minimal">
        <div className="hero__grid-bg" aria-hidden />
        <div className="container hero__content">
          <div className="hero__text animate-fadeInUp">
            <p className="hero__eyebrow">
              <span className="hero__dot" />
              Desarrollo web para negocios · Buenos Aires
            </p>
            <h1 className="hero__title">
              Una web que te consigue consultas, no un folleto digital
            </h1>
            <p className="hero__bio">
              Landings, tiendas y sistemas para pymes. Te respondo en 24–48 hs hábiles.
            </p>
            <div className="hero__cta">
              <Link to="/cotizar" className="btn btn-primary">
                Pedir propuesta
              </Link>
              <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="hero__scroll">
          <a href="#servicios" aria-label="Ir a servicios">
            <i className="fas fa-chevron-down" />
          </a>
        </div>
      </section>

      <section id="servicios" className="services services--dark">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Servicios</p>
            <h2 className="section-title section-title--on-dark">Qué servicios ofrecemos?</h2>
            <div className="section-divider" />
            <p className="section-lead">
              Precios de entrada, en USD. El alcance exacto lo armamos juntos.
            </p>
          </div>

          <div className="services__grid services__grid--4">
            {SERVICES.map((service, i) => (
              <div key={service.title} className="service-card animate-fadeInUp" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="service-card__icon">
                  <i className={`fas ${service.icon}`} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
                <p className="service-card__from">Desde USD {service.from.toLocaleString('en-US')}</p>
              </div>
            ))}
          </div>
          <p className="services__note">También sistemas a medida desde USD 1.800.</p>
        </div>
      </section>

      <section className="featured-projects" id="casos">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Casos</p>
            <h2 className="section-title">Mirá cómo se ve el trabajo</h2>
            <div className="section-divider" />
            <p className="section-lead">
              Demos para probar: gastronomía, retail e industria.
            </p>
          </div>

          <div className="featured-projects__grid">
            {featuredProjects.map((p, i) => (
              <ProjectCard key={p._id} project={p} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="container about__grid">
          <div className="about__visual animate-slideInLeft">
            <figure className="about__portrait">
              <img
                src="/images/gianfranco-gbdev.png"
                alt={settings.name || 'Gianfranco Buzzelatto, desarrollador de GB.Dev'}
              />
              <figcaption className="about__portrait-caption">
                <span className="about__panel-name">{settings.name || 'Gianfranco Buzzelatto'}</span>
                <span className="about__panel-role">GB.Dev · Buenos Aires</span>
              </figcaption>
            </figure>
          </div>

          <div className="about__content animate-fadeInUp">
            <p className="section-label">Sobre mí</p>
            <h2 className="section-title section-title--left">
              Trabajo con pymes que necesitan vender y ordenarse online
            </h2>
            <div className="section-divider section-divider--left" />
            <p className="about__lead">
              {settings.bio || 'Armo landings, tiendas y sistemas simples. Prioridades claras, plazos reales y un resultado que podés mostrar.'}
            </p>
            <ul className="about__panel-list about__panel-list--inline">
              <li><i className="fas fa-check" /> Entiendo el negocio antes de codear</li>
              <li><i className="fas fa-check" /> Hablo claro, sin humo técnico</li>
              <li><i className="fas fa-check" /> Entrego por etapas, primero lo que vende</li>
            </ul>

            <div className="about__formation">
              <div className="about__credential">
                <div className="about__credential-icon" aria-hidden>
                  <i className="fas fa-graduation-cap" />
                </div>
                <div>
                  <p className="about__credential-label">Formación</p>
                  <h3 className="about__credential-title">{CREDENTIAL.title}</h3>
                  <p className="about__credential-meta">
                    {CREDENTIAL.institution} · {CREDENTIAL.hours} · {CREDENTIAL.year}
                  </p>
                  <div className="about__credential-links">
                    <a href={CREDENTIAL.pdfUrl} target="_blank" rel="noopener noreferrer" className="about__credential-link">
                      <i className="fas fa-file-pdf" /> Ver certificado
                    </a>
                    <a href={CREDENTIAL.verifyUrl} target="_blank" rel="noopener noreferrer" className="about__credential-link about__credential-link--muted">
                      Validar en UTN
                    </a>
                  </div>
                </div>
              </div>

              <div className="about__credential about__credential--extra">
                <div className="about__credential-icon" aria-hidden>
                  <i className={`${MAIN_FORMATION.iconPack} ${MAIN_FORMATION.icon}`} />
                </div>
                <div>
                  <p className="about__credential-label">{MAIN_FORMATION.label}</p>
                  <h3 className="about__credential-title">{MAIN_FORMATION.title}</h3>
                  <p className="about__credential-meta">{MAIN_FORMATION.meta}</p>
                </div>
              </div>

              {showMoreFormation && EXTRA_FORMATION.map((item) => (
                <div key={item.title} className="about__credential about__credential--extra">
                  <div className="about__credential-icon" aria-hidden>
                    <i className={`${item.iconPack} ${item.icon}`} />
                  </div>
                  <div>
                    <p className="about__credential-label">{item.label}</p>
                    <h3 className="about__credential-title">{item.title}</h3>
                    <p className="about__credential-meta">{item.meta}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="about__more"
              onClick={() => setShowMoreFormation((v) => !v)}
            >
              {showMoreFormation ? 'Ver menos formación' : 'Ver más formación'}
            </button>

            <div className="about__cta mt-3">
              <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp" /> WhatsApp
              </a>
              <Link to="/cotizar" className="btn btn-outline">
                Pedir propuesta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-final" id="contacto">
        <div className="container cta-final__inner">
          <div className="cta-final__copy">
            <h2>¿Tenés un negocio y necesitás presencia online?</h2>
            <p>
              Escribime por WhatsApp o dejá un brief. Te respondo en 24–48 hs hábiles, sin compromiso.
            </p>
          </div>
          <div className="cta-final__actions">
            <a className="btn btn-whatsapp btn-lg" href={wa} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp" /> WhatsApp
            </a>
            <Link to="/cotizar" className="btn btn-outline btn-lg">
              Pedir propuesta
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
