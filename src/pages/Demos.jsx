import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Seo from '../seo/Seo'
import { breadcrumbJsonLd } from '../seo/jsonld'
import { DEMO_CATALOG } from '../data/siteContent'
import '../components/MarketingShell.css'

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'ecommerce', label: 'E-commerce' },
  { key: 'sistemas', label: 'Sistemas' },
]

export default function Demos() {
  const [filter, setFilter] = useState('all')
  const list = useMemo(
    () => (filter === 'all' ? DEMO_CATALOG : DEMO_CATALOG.filter((d) => d.filter === filter)),
    [filter]
  )

  return (
    <main>
      <Seo
        title="Demos"
        description="Probá demos interactivas: gestión gastronómica, tienda de perfumería y e-commerce de velas. Datos de muestra."
        path="/demos"
        jsonLd={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Demos', path: '/demos' },
        ])}
      />
      <PageHero
        label="Demos interactivas"
        title="Probá cómo funciona una solución real"
        sub="Réplicas jugables con datos inventados. Sin login y sin información privada de clientes."
      />

      <section className="mkt-section">
        <div className="container">
          <div className="mkt-filters" role="tablist" aria-label="Filtrar demos">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                className={`mkt-filter ${filter === f.key ? 'mkt-filter--active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mkt-grid-3">
            {list.map((demo, i) => (
              <Reveal as="article" key={demo.slug} className="mkt-card mkt-demo-card" delay={i * 70}>
                <div className="mkt-demo-card__img">
                  <img src={demo.imageUrl} alt="" loading="lazy" width="900" height="500" />
                </div>
                <div className="mkt-demo-card__body">
                  <p className="mkt-card__eyebrow">{demo.filter === 'ecommerce' ? 'E-commerce' : 'Sistema'}</p>
                  <h3>{demo.title}</h3>
                  <p className="mkt-card__sub">{demo.subtitle}</p>
                  <p>{demo.blurb}</p>
                  <div className="mkt-card__foot">
                    <Link to={`/demo/${demo.slug}`} className="btn btn-primary btn-sm">
                      Explorar demo <i className="fas fa-arrow-right" aria-hidden />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section--elevated">
        <div className="container" style={{ textAlign: 'center', maxWidth: 640 }}>
          <h2 className="section-title">¿Te imaginás algo así para tu negocio?</h2>
          <p className="section-lead" style={{ marginBottom: 28 }}>
            Armamos una propuesta a medida. Respuesta en 24–48 hs hábiles.
          </p>
          <div className="page-hero__actions">
            <Link to="/cotizar" className="btn btn-primary">Quiero mi proyecto</Link>
            <Link to="/proyectos" className="btn btn-outline">Ver casos</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
