import { whatsappHref } from '../utils/whatsapp'

const fmtUSD = (n) => `USD ${Math.round(n || 0).toLocaleString('en-US')}`

export default function QuoteProposal({ proposal, settings, onReset }) {
  if (!proposal) return null

  const range = proposal.price?.range
  const waText = `Hola Gianfranco, vi la propuesta de ${proposal.headline || 'GB.Dev'} y quiero coordinar.`

  return (
    <div className="quote-proposal">
      <p className="quote-proposal__eyebrow">Propuesta orientativa</p>
      <h2>{proposal.headline}</h2>
      <p className="quote-proposal__meta">
        {proposal.planLabel} · {proposal.categoryLabel}
        {proposal.deadline ? ` · ${proposal.deadline} días hábiles` : ''}
        {proposal.revisions ? ` · ${proposal.revisions} revisiones` : ''}
      </p>

      <div className="quote-proposal__price">
        <strong>{fmtUSD(proposal.price?.development)}</strong>
        {range && (
          <span>
            Rango de catálogo {fmtUSD(range[0])} – {fmtUSD(range[1])}
          </span>
        )}
        <small>Sin compromiso. Lo confirmamos juntos antes de arrancar.</small>
      </div>

      {proposal.includes?.length > 0 && (
        <section>
          <h3>Qué incluye</h3>
          <ul>
            {proposal.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {proposal.addons?.length > 0 && (
        <section>
          <h3>Extras sugeridos</h3>
          <ul>
            {proposal.addons.map((addon) => (
              <li key={addon.name}>
                {addon.name} ({fmtUSD(addon.price)})
                {addon.reason ? ` — ${addon.reason}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {proposal.whyItFits && (
        <section>
          <h3>Por qué te conviene</h3>
          <p>{proposal.whyItFits}</p>
        </section>
      )}

      {proposal.howItWorks && (
        <section>
          <h3>Cómo lo llevamos a cabo</h3>
          <p>{proposal.howItWorks}</p>
        </section>
      )}

      {proposal.considerations?.length > 0 && (
        <section>
          <h3>Qué hay que tener en cuenta</h3>
          <ul>
            {proposal.considerations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {proposal.outOfScope?.length > 0 && (
        <section>
          <h3>Qué no está incluido</h3>
          <ul>
            {proposal.outOfScope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {proposal.risks?.length > 0 && (
        <section>
          <h3>Riesgos o demoras típicas</h3>
          <ul>
            {proposal.risks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {proposal.nextSteps?.length > 0 && (
        <section>
          <h3>Próximos pasos</h3>
          <ol>
            {proposal.nextSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      )}

      {proposal.price?.careMonthly ? (
        <p className="quote-proposal__care">
          Cuidado del sitio {proposal.price.careLabel}: {fmtUSD(proposal.price.careMonthly)}/mes
          (mínimo 3 meses, opcional). Hosting y dominio se coordinan al publicar.
        </p>
      ) : null}

      <div className="quote-proposal__actions">
        <a
          className="btn btn-whatsapp"
          href={whatsappHref(settings.phone, waText)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-whatsapp" /> Coordinar por WhatsApp
        </a>
        <button type="button" className="btn btn-outline" onClick={onReset}>
          Armar otra propuesta
        </button>
      </div>
    </div>
  )
}
