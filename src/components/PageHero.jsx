import './MarketingShell.css'

export default function PageHero({ label, title, sub, actions }) {
  return (
    <section className="page-hero texture-bg">
      <div className="container page-hero__content">
        {label && <p className="section-label">{label}</p>}
        <h1 className="page-hero__title">{title}</h1>
        {sub && <p className="page-hero__sub">{sub}</p>}
        {actions && <div className="page-hero__actions">{actions}</div>}
      </div>
    </section>
  )
}
