import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ProjectCard from '../components/ProjectCard'
import api from '../hooks/useApi'
import { SHOWCASE_PROJECTS } from '../data/showcaseProjects'
import './Home.css'

const CONTACT_EMAIL = 'gianbuzzelatto@gmail.com'

function useTypingEffect(texts, speed = 70, pause = 2200) {
  const [displayed, setDisplayed] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!texts?.length) return
    const current = texts[textIndex % texts.length]
    let timeout

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((i) => i + 1), speed)
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((i) => i - 1), speed / 2)
    } else if (deleting && charIndex === 0) {
      setDeleting(false)
      setTextIndex((i) => (i + 1) % texts.length)
    }

    setDisplayed(current.slice(0, charIndex))
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, textIndex, texts, speed, pause])

  return displayed
}

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0
        const step = Math.max(target / 40, 1)
        const timer = setInterval(() => {
          start += step
          if (start >= target) {
            setCount(target)
            clearInterval(timer)
          } else setCount(Math.floor(start))
        }, 28)
        observer.disconnect()
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

const STATS = [
  {
    type: 'number',
    target: 3,
    suffix: '',
    label: 'Proyectos reales en producción',
    hint: 'Gastronomía, retail e industria',
  },
  {
    type: 'number',
    target: 2,
    suffix: '+',
    label: 'Clientes con trabajo activo',
    hint: 'Seguimiento y mejoras continuas',
  },
  {
    type: 'text',
    value: 'MERN',
    label: 'Stack principal',
    hint: 'Escalable y mantenible para tu negocio',
  },
  {
    type: 'text',
    value: 'Sí',
    label: 'Tomando nuevos encargos',
    hint: 'Respuesta en 24–48 hs hábiles',
  },
]

const HERO_OUTCOMES = [
  {
    icon: 'fa-chart-line',
    title: 'Más ventas y consultas',
    text: 'Webs y tiendas pensadas para que el visitante entienda tu oferta y actúe.',
  },
  {
    icon: 'fa-clock',
    title: 'Menos fricción operativa',
    text: 'Sistemas que ordenan pedidos, datos y comunicación interna.',
  },
  {
    icon: 'fa-shield-alt',
    title: 'Confianza de marca',
    text: 'Presencia profesional que respalda la calidad de tu producto o servicio.',
  },
]

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState(SHOWCASE_PROJECTS)

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

  const typedLine = useTypingEffect([
    'Landing pages que convierten',
    'Tiendas online listas para vender',
    'Sistemas a medida para tu equipo',
  ])

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
              Llevá tu negocio al próximo nivel con una web que trabaja para vos
            </h1>
            <h2 className="hero__subtitle">
              <span className="hero__typed">{typedLine}</span>
              <span className="hero__cursor">|</span>
            </h2>
            <p className="hero__bio">
              Diseño y desarrollo de páginas web, e-commerce y sistemas internos con el stack MERN.
              Enfocado en resultados: más clientes, menos caos operativo y una imagen sólida en internet.
            </p>
            <div className="hero__cta">
              <Link to="/cotizar" className="btn btn-primary">
                <i className="fas fa-paper-plane" /> Pedir propuesta
              </Link>
              <Link to="/proyectos" className="btn btn-outline">
                <i className="fas fa-briefcase" /> Ver casos reales
              </Link>
            </div>
          </div>

          <div className="hero__visual animate-fadeIn" style={{ animationDelay: '0.35s' }}>
            <div className="hero__value-stack">
              {HERO_OUTCOMES.map((item) => (
                <div key={item.title} className="hero__value-card">
                  <div className="hero__value-icon" aria-hidden>
                    <i className={`fas ${item.icon}`} />
                  </div>
                  <div>
                    <h3 className="hero__value-title">{item.title}</h3>
                    <p className="hero__value-text">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hero__scroll">
          <a href="#about" aria-label="Ir a sobre mí">
            <i className="fas fa-chevron-down" />
          </a>
        </div>
      </section>

      <section className="stats stats--dark" aria-label="Indicadores">
        <div className="container stats__grid">
          {STATS.map((stat, i) => (
            <div key={i} className="stat-item">
              <h3 className="stat-item__number">
                {stat.type === 'number' ? (
                  <>
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                  </>
                ) : (
                  <span className="stat-item__text">{stat.value}</span>
                )}
              </h3>
              <p className="stat-item__label">{stat.label}</p>
              <p className="stat-item__hint">{stat.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="about">
        <div className="container about__grid">
          <div className="about__visual animate-slideInLeft">
            <div className="about__panel">
              <p className="about__panel-label">Enfoque</p>
              <ul className="about__panel-list">
                <li>
                  <i className="fas fa-check" /> Entendemos el negocio antes de escribir código
                </li>
                <li>
                  <i className="fas fa-check" /> Comunicación clara, sin humo técnico
                </li>
                <li>
                  <i className="fas fa-check" /> Entregas por etapas, con prioridad a lo que vende
                </li>
              </ul>
              <div className="about__panel-foot">
                <span className="about__panel-name">Gianfranco Buzzelatto</span>
                <span className="about__panel-role">Desarrollador full stack · MERN</span>
              </div>
            </div>
          </div>

          <div className="about__content animate-fadeInUp">
            <p className="section-label">Sobre mí</p>
            <h2 className="section-title section-title--left">
              Soluciones digitales para que tu empresa venda y opere mejor
            </h2>
            <div className="section-divider section-divider--left" />
            <p className="about__lead">
              Trabajo con pymes y emprendimientos que necesitan presencia web seria: landings que explican
              bien la oferta, tiendas online que no frenan la compra y sistemas que ordenan la operación diaria.
            </p>
            <p className="mt-2 about__muted">
              Mi rol es traducir lo que necesitás en un producto usable: prioridades claras, plazos realistas
              y un resultado que podés mostrar a clientes y proveedores con orgullo.
            </p>

            <div className="about__skills">
              {['React', 'Node.js', 'Express', 'MongoDB', 'APIs REST', 'E-commerce', 'Responsive'].map((skill) => (
                <span key={skill} className="about__skill">
                  {skill}
                </span>
              ))}
            </div>

            <div className="about__cta mt-3">
              <a href={`mailto:${CONTACT_EMAIL}?subject=Consulta%20desde%20portfolio`} className="btn btn-primary">
                <i className="fas fa-envelope" /> Escribirme
              </a>
              <Link to="/cotizar" className="btn btn-outline">
                Solicitar cotización
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="services services--dark">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Servicios</p>
            <h2 className="section-title section-title--on-dark">Lo que puedo construir para tu negocio</h2>
            <div className="section-divider" />
            <p className="section-lead">
              Tres líneas de trabajo que cubren la mayoría de necesidades digitales de una empresa en crecimiento.
            </p>
          </div>

          <div className="services__grid services__grid--3">
            {[
              {
                icon: 'fa-globe',
                title: 'Webs y landings',
                desc: 'Sitios rápidos y claros para generar consultas: servicios, testimonios, SEO básico y formularios que llegan a tu mail.',
              },
              {
                icon: 'fa-shopping-cart',
                title: 'Tiendas online',
                desc: 'E-commerce con catálogo, carrito y flujo de compra pensado para móvil. Ideal para retail, marcas y distribuidores.',
              },
              {
                icon: 'fa-cogs',
                title: 'Sistemas a medida',
                desc: 'Paneles internos: pedidos, stock, turnos o lo que tu operación necesite. Menos Excel suelto, más control.',
              },
            ].map((service, i) => (
              <div key={service.title} className="service-card animate-fadeInUp" style={{ animationDelay: `${i * 90}ms` }}>
                <div className="service-card__icon">
                  <i className={`fas ${service.icon}`} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-projects" id="casos">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Casos reales</p>
            <h2 className="section-title">Proyectos con impacto en el negocio</h2>
            <div className="section-divider" />
            <p className="section-lead">
              Cada proyecto parte de un problema concreto. Lo importante no es el stack en sí, sino la solución que aporta a tu operación y tus clientes.
            </p>
          </div>

          <div className="featured-projects__grid">
            {featuredProjects.map((p, i) => (
              <ProjectCard key={p._id} project={p} delay={i * 100} />
            ))}
          </div>

          <div className="text-center mt-3">
            <Link to="/proyectos" className="btn btn-outline">
              Ver ficha de proyectos <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-final" id="contacto">
        <div className="container cta-final__inner">
          <div className="cta-final__copy">
            <h2>¿Tenés una idea o un negocio que necesita presencia online?</h2>
            <p>
              Hablemos sin compromiso. Contame qué vendés, a quién llegás hoy y qué te gustaría mejorar.
              Te devuelvo un plan simple: alcance, tiempos y próximos pasos, sin tecnicismos innecesarios.
            </p>
          </div>
          <div className="cta-final__actions">
            <a href={`mailto:${CONTACT_EMAIL}?subject=Consulta%20desde%20portfolio`} className="btn btn-primary btn-lg">
              <i className="fas fa-envelope" /> Escribime ahora
            </a>
            <Link to="/cotizar" className="btn btn-outline btn-lg">
              Completar brief de proyecto
            </Link>
            <p className="cta-final__micro">
              <i className="fas fa-phone-alt" /> También podés llamar: <a href="tel:+541141609741">+54 11 4160-9741</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
