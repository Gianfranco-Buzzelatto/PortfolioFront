import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProjectCard from '../components/ProjectCard'
import api from '../hooks/useApi'
import { SHOWCASE_PROJECTS } from '../data/showcaseProjects'
import {
  CLIENT_MARKS,
  DEMOS_ENABLED,
  DIFFERENTIALS,
  HOME_PILLARS,
  PROCESS_STEPS,
  TESTIMONIALS,
} from '../data/siteContent'
import TechMarquee from '../components/TechMarquee'
import { useSettings } from '../context/SettingsContext'
import { whatsappHref } from '../utils/whatsapp'
import Seo from '../seo/Seo'
import { faqJsonLd, personJsonLd, professionalServiceJsonLd } from '../seo/jsonld'
import Reveal from '../components/Reveal'
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

const TRUST = [
  { value: '24–48 hs', label: 'Respuesta', hint: 'Días hábiles, sin vueltas.' },
  { value: 'USD 180', label: 'Desde', hint: 'Landing lista para conseguir consultas.' },
  { value: '4 casos', label: 'En el portfolio', hint: 'Gastronomía, retail y producto.' },
  { value: 'BA', label: 'Buenos Aires', hint: 'Trabajo con pymes locales.' },
]

const FAQS = [
  {
    q: '¿Cuánto tarda una landing?',
    a: 'El plan de entrada ronda los 4 a 9 días hábiles, según el contenido que tengas listo (textos, fotos, WhatsApp).',
  },
  {
    q: '¿Cómo se paga?',
    a: '40% al arrancar, 30% a mitad de proyecto y 30% contra entrega. Precios de referencia en USD.',
  },
  {
    q: '¿Hacés tiendas y sistemas, o solo páginas?',
    a: 'Conseguir clientes, vender online, pedidos, turnos y sistemas. El alcance lo armamos juntos.',
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
        setFeaturedProjects(source.slice(0, 4))
      })
      .catch(() => {
        setFeaturedProjects(SHOWCASE_PROJECTS)
      })
  }, [])

  const wa = whatsappHref(settings.phone)

  return (
    <main className="home">
      <Seo
        path="/"
        description="No hacemos solo páginas: soluciones para conseguir clientes, vender online, recibir pedidos, agendar turnos y organizar procesos."
        jsonLd={[personJsonLd(settings), professionalServiceJsonLd(settings), faqJsonLd(FAQS)]}
      />

      <section className="hero hero--minimal">
        <div className="hero__media" aria-hidden>
          <img src="/images/hero-cubes.png" alt="" className="hero__media-img" />
        </div>
        <div className="hero__glow" aria-hidden />
        <div className="container hero__content">
          <div className="hero__text">
            <p className="hero__eyebrow">
              <span className="hero__dot" />
              Desarrollo web para negocios · Buenos Aires
            </p>
            <h1 className="hero__title">
              No hacemos simplemente <em>páginas web</em>
            </h1>
            <p className="hero__bio">
              Soluciones para conseguir clientes, vender online, recibir pedidos, agendar turnos y organizar procesos.
              Te respondo en 24–48 hs hábiles.
            </p>
            <div className="hero__cta">
              <Link to="/cotizar" className="btn btn-primary">
                Quiero mi proyecto
              </Link>
              <Link to="/proyectos" className="btn btn-outline">
                Ver casos
              </Link>
              <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp" aria-hidden /> WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="hero__scroll">
          <a href="#pilares" aria-label="Ir a soluciones">
            <i className="fas fa-chevron-down" aria-hidden />
          </a>
        </div>
      </section>

      <section className="logos-strip" aria-label="Rubros con los que trabajo">
        <div className="container logos-strip__inner">
          <p className="logos-strip__label">Casos en</p>
          <ul className="logos-strip__list">
            {CLIENT_MARKS.map((m) => (
              <li key={m.label}>
                <strong>{m.label}</strong>
                <span>{m.hint}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="stats stats--dark" aria-label="Indicadores">
        <div className="container">
          <div className="stats__grid">
            {TRUST.map((item) => (
              <div key={item.label} className="stat-item">
                <span className="stat-item__number">{item.value}</span>
                <p className="stat-item__label">{item.label}</p>
                <p className="stat-item__hint">{item.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pilares" className="pillars">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Tu negocio</p>
            <h2 className="section-title">Tu forma de trabajar. Nuestra solución.</h2>
            <div className="section-divider" />
            <p className="section-lead">
              Empezamos por el problema, no por la tecnología.
            </p>
          </div>
          <div className="pillars__grid">
            {HOME_PILLARS.map((item, i) => (
              <Reveal as="article" key={item.title} className="pillar-card" delay={i * 60}>
                <Link to={item.to} className="pillar-card__link">
                  <div className="pillar-card__icon" aria-hidden>
                    <i className={`fas ${item.icon}`} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <span className="pillar-card__more">
                    Ver solución <i className="fas fa-arrow-right" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="pillars__note">
            <Link to="/soluciones">Ver todas las soluciones</Link>
            {' · '}
            <Link to="/cuidado">Plan de cuidado post-lanzamiento</Link>
          </p>
        </div>
      </section>

      <section id="servicios" className="process" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <Reveal className="section-header">
            <p className="section-label">Proceso</p>
            <h2 className="section-title">Del primer contacto al producto terminado</h2>
            <div className="section-divider" />
          </Reveal>
          <ol className="process__grid">
            {PROCESS_STEPS.map((item, i) => (
              <Reveal as="li" key={item.step} className="process__item" delay={i * 80}>
                <span className="process__num">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="differentials" aria-labelledby="differentials-title">
        <div className="container">
          <Reveal className="section-header">
            <p className="section-label">Diferenciales</p>
            <h2 id="differentials-title" className="section-title">Por qué trabajar con GB.Dev</h2>
            <div className="section-divider" />
          </Reveal>
          <div className="differentials__grid">
            {DIFFERENTIALS.map((item, i) => (
              <Reveal as="article" key={item.title} className="diff-card" delay={i * 60}>
                <div className="diff-card__icon" aria-hidden>
                  <i className={`fas ${item.icon}`} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TechMarquee />

      <section className="featured-projects" id="casos">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Casos</p>
            <h2 className="section-title">Mirá cómo se ve el trabajo</h2>
            <div className="section-divider" />
            <p className="section-lead">
              Casos por rubro: problema, solución y resultado.
            </p>
          </div>

          <div className="featured-projects__grid">
            {featuredProjects.map((p, i) => (
              <ProjectCard key={p._id} project={p} delay={i * 100} />
            ))}
          </div>
          <div className="home-inline-cta">
            {DEMOS_ENABLED && <Link to="/demos" className="btn btn-primary">Explorar demos</Link>}
            <Link to="/proyectos" className={DEMOS_ENABLED ? 'btn btn-outline' : 'btn btn-primary'}>
              Ver todos los casos
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="container about__grid">
          <Reveal className="about__visual" as="div">
            <figure className="about__portrait">
              <img
                src="/images/gianfranco-gbdev.png"
                alt={settings.name || 'Gianfranco Buzzelatto, desarrollador de GB.Dev'}
                width="840"
                height="1120"
                fetchPriority="high"
                decoding="async"
              />
              <figcaption className="about__portrait-caption">
                <span className="about__panel-name">{settings.name || 'Gianfranco Buzzelatto'}</span>
                <span className="about__panel-role">GB.Dev · Buenos Aires</span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal className="about__content">
            <p className="section-label">Sobre mí</p>
            <h2 className="section-title section-title--left">
              Un apasionado por la tecnología, atento al detalle
            </h2>
            <div className="section-divider section-divider--left" />
            <p className="about__lead">
              {settings.bio || 'Busco que tu negocio destaque frente a la competencia: prioridades claras, plazos reales y un resultado que podés mostrar.'}
            </p>
            <ul className="about__panel-list about__panel-list--inline">
              <li><i className="fas fa-check" aria-hidden /> Entiendo el negocio antes de codear</li>
              <li><i className="fas fa-check" aria-hidden /> Hablo claro, sin tecnicismos</li>
              <li><i className="fas fa-check" aria-hidden /> Entrego por etapas, primero lo urgente</li>
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
                Quiero mi proyecto
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="testimonials" aria-labelledby="testimonials-title">
        <div className="container">
          <Reveal className="section-header">
            <p className="section-label">Testimonios</p>
            <h2 id="testimonials-title" className="section-title">Lo que dicen después de trabajar juntos</h2>
            <div className="section-divider" />
          </Reveal>
          <div className="testimonials__grid">
            {TESTIMONIALS.map((item, i) => (
              <Reveal as="blockquote" key={item.name} className="testimonial-card" delay={i * 60}>
                <p className="testimonial-card__quote">“{item.quote}”</p>
                <footer>
                  <strong>{item.name}</strong>
                  <span>{item.meta}</span>
                </footer>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="faq" id="faq" aria-labelledby="faq-title">
        <div className="container">
          <Reveal className="section-header">
            <p className="section-label">FAQ</p>
            <h2 id="faq-title" className="section-title">Preguntas que aparecen siempre</h2>
            <div className="section-divider" />
          </Reveal>
          <div className="faq__list">
            {FAQS.map((item, i) => (
              <Reveal as="details" key={item.q} className="faq__item" delay={i * 50}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-final" id="contacto">
        <div className="cta-final__media" aria-hidden="true">
          <img src="/images/hero-cubes.png" alt="" className="cta-final__media-img" />
        </div>
        <div className="container cta-final__inner">
          <div className="cta-final__copy">
            <h2>¿Tenés un negocio y necesitás presencia online?</h2>
            <p>
              Escribime por WhatsApp o dejá un brief. Cotizamos tu proyecto sin compromiso.
            </p>
          </div>
          <div className="cta-final__actions">
            <a className="btn btn-whatsapp btn-lg" href={wa} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp" /> WhatsApp
            </a>
            <Link to="/cotizar" className="btn btn-outline btn-lg">
              Quiero mi proyecto
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
