import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Seo from '../seo/Seo'
import { breadcrumbJsonLd } from '../seo/jsonld'
import { CARE_PLANS } from '../data/quoteCatalog2026'
import { useSettings } from '../context/SettingsContext'
import { whatsappHref } from '../utils/whatsapp'
import '../components/MarketingShell.css'

const ORDER = ['basico', 'intermedio', 'premium']

export default function Care() {
  const settings = useSettings()
  const wa = whatsappHref(settings.phone, 'Hola Gianfranco, quiero consultar el plan de cuidado de GB.Dev.')

  return (
    <main>
      <Seo
        title="Plan de cuidado"
        description="Tu proyecto no termina cuando lo publicamos. Backups, monitoreo, cambios chicos y soporte según el plan."
        path="/cuidado"
        jsonLd={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Plan de cuidado', path: '/cuidado' },
        ])}
      />
      <PageHero
        label="Plan de cuidado"
        title="Tu proyecto no termina cuando lo publicamos"
        sub="Hosting estable, backups y espacio para ajustes. Pensado para que el sitio siga trabajando después del lanzamiento."
        actions={
          <>
            <Link to="/cotizar" className="btn btn-primary">Quiero mi proyecto</Link>
            <a className="btn btn-outline" href={wa} target="_blank" rel="noopener noreferrer">
              Consultar por WhatsApp
            </a>
          </>
        }
      />

      <section className="mkt-section">
        <div className="container care-tiers">
          {ORDER.map((key, i) => {
            const plan = CARE_PLANS[key]
            return (
              <Reveal
                as="article"
                key={key}
                className={`mkt-card care-tier ${plan.recommended ? 'care-tier--featured' : ''}`}
                delay={i * 70}
              >
                {plan.recommended && <span className="care-tier__badge">Recomendado</span>}
                <p className="mkt-card__eyebrow">Plan {plan.label}</p>
                <p className="care-tier__price">
                  USD {plan.price} <small>/ mes</small>
                </p>
                <p>Referencia {plan.priceRange[0]}–{plan.priceRange[1]} USD según alcance.</p>
                <ul className="mkt-card__list">
                  {plan.includes.map((line) => (
                    <li key={line}><i className="fas fa-check" aria-hidden />{line}</li>
                  ))}
                </ul>
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="mkt-section mkt-section--elevated">
        <div className="container mkt-grid-2">
          <Reveal className="mkt-card">
            <p className="mkt-card__eyebrow">Qué incluye la idea</p>
            <h2>Que el sitio no se quede solo</h2>
            <p>
              Publicar es el arranque. El plan de cuidado cubre lo operativo (backups, monitoreo, hosting)
              y deja margen para cambios chicos sin reabrir un proyecto entero cada vez.
            </p>
          </Reveal>
          <Reveal className="mkt-card" delay={80}>
            <p className="mkt-card__eyebrow">Cómo se suma</p>
            <h2>Va en la propuesta</h2>
            <p>
              Cuando pedís presupuesto, podemos incluir el plan desde el día uno (mínimo sugerido: 3 meses)
              o arrancar solo con el desarrollo y sumarlo después del lanzamiento.
            </p>
            <div className="mkt-card__foot">
              <Link to="/cotizar" className="btn btn-primary btn-sm">Quiero mi proyecto</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mkt-section">
        <div className="container mkt-grid-2">
          <Reveal className="mkt-card">
            <p className="mkt-card__eyebrow">Garantía</p>
            <h2>15 días después de entregar</h2>
            <p>
              Si algo de lo acordado se rompe por el desarrollo original, lo corrijo. No cubre funciones nuevas,
              rediseños, fallos de Mercado Pago, hosting o cambios hechos por otra persona.
            </p>
          </Reveal>
          <Reveal className="mkt-card" delay={80}>
            <p className="mkt-card__eyebrow">Después de esos 15 días</p>
            <h2>Plan de cuidado</h2>
            <p>
              Ahí entra el mantenimiento: backups, que el sitio siga en pie y espacio para ajustes chicos.
              Sin plan, cada pedido se cotiza aparte.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
