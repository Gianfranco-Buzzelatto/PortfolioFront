import { TECH_STACK } from '../data/siteContent'
import './TechMarquee.css'

function TechItem({ name, slug, color }) {
  const src = `https://cdn.simpleicons.org/${slug}/${color}`
  return (
    <div className="tech-marquee__item">
      <img src={src} alt="" width="72" height="72" loading="lazy" decoding="async" />
      <span className="tech-marquee__name">{name}</span>
    </div>
  )
}

export default function TechMarquee() {
  const loop = [...TECH_STACK, ...TECH_STACK]

  return (
    <section className="tech-marquee" aria-labelledby="tech-marquee-title">
      <div className="container">
        <header className="section-header tech-marquee__header">
          <p className="section-label">Tecnologías</p>
          <h2 id="tech-marquee-title" className="section-title">
            Tecnologías con las que trabajo
          </h2>
          <div className="section-divider" />
        </header>
      </div>
      <div className="tech-marquee__viewport" aria-hidden>
        <div className="tech-marquee__track">
          {loop.map((tech, i) => (
            <TechItem key={`${tech.slug}-${i}`} {...tech} />
          ))}
        </div>
      </div>
    </section>
  )
}
