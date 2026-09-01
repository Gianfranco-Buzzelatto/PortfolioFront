import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Seo from '../seo/Seo'
import { breadcrumbJsonLd } from '../seo/jsonld'
import { DEMOS_ENABLED, SOLUTIONS } from '../data/siteContent'
import '../components/MarketingShell.css'
import './Solutions.css'

export default function Solutions() {
  return (
    <main>
      <Seo
        title="Soluciones"
        description="Te explicamos qué hace cada tipo de web o sistema: conseguir clientes, vender online, pedidos, turnos y orden interno."
        path="/soluciones"
        jsonLd={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Soluciones', path: '/soluciones' },
        ])}
      />
      <PageHero
        label="Soluciones"
        title="¿Qué necesitás?"
        sub="Elegí la situación que más se parece a la tuya. Después afinamos juntos el alcance y el precio."
        actions={
          <>
            <Link to="/cotizar" className="btn btn-primary">Quiero mi proyecto</Link>
            <Link to="/proyectos" className="btn btn-outline">Ver casos</Link>
          </>
        }
      />

      <section className="mkt-section solutions-intro">
        <div className="container solutions-intro__box">
          <p>
            Estás eligiendo
            <strong> cómo querés que te encuentren, te paguen o te ordenen el día</strong>.
            Abajo está cada opción explicada como se la contarías a un familiar.
          </p>
        </div>
      </section>

      <section className="mkt-section" style={{ paddingTop: 0 }}>
        <div className="container solutions-list">
          {SOLUTIONS.map((item, i) => (
            <Reveal as="article" key={item.id} id={item.id} className="solution-card" delay={i * 50}>
              <header className="solution-card__head">
                <p className="mkt-card__eyebrow">{item.eyebrow}</p>
                <div className="solution-card__title-row">
                  <h2>{item.title}</h2>
                  <div className="solution-card__types" aria-label="Tipo de proyecto">
                    {item.types.map((type) => (
                      <span key={type} className="solution-card__type">{type}</span>
                    ))}
                  </div>
                </div>
                <p className="solution-card__plain-name">{item.plainName}</p>
              </header>

              <div className="solution-card__grid">
                <div>
                  <h3>¿Para quién es?</h3>
                  <p>{item.forWhom}</p>
                </div>
                <div>
                  <h3>¿Qué es, en pocas palabras?</h3>
                  <p>{item.plain}</p>
                </div>
              </div>

              <div className="solution-card__day">
                <h3>Cómo se siente el día a día</h3>
                <p>{item.dayToDay}</p>
              </div>

              <div className="solution-card__includes">
                <h3>Qué incluye, sin tecnicismos</h3>
                <ul className="mkt-card__list">
                  {item.includes.map((line) => (
                    <li key={line}><i className="fas fa-check" aria-hidden />{line}</li>
                  ))}
                </ul>
              </div>

              <div className="mkt-card__foot solution-card__foot">
                <span className="mkt-card__from">Desde USD {item.from.toLocaleString('en-US')}</span>
                <Link to={item.cta} className="btn btn-primary btn-sm">Quiero esto</Link>
                {DEMOS_ENABLED && item.demo && (
                  <Link to={item.demo} className="btn btn-outline btn-sm">Ver ejemplo en vivo</Link>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mkt-section mkt-section--elevated">
        <div className="container" style={{ textAlign: 'center', maxWidth: 680 }}>
          <p className="section-label">¿Dudas entre dos opciones?</p>
          <h2 className="section-title">No hace falta que lo sepas de antemano</h2>
          <p className="section-lead" style={{ marginBottom: 28 }}>
            Contame qué hace tu negocio y qué te está costando hoy. Yo te digo qué conviene
            — y qué no hace falta gastar. El brief toma menos de 3 minutos.
          </p>
          <Link to="/cotizar" className="btn btn-primary btn-lg">Quiero mi proyecto</Link>
        </div>
      </section>
    </main>
  )
}
