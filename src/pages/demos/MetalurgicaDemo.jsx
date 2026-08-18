import { useState } from 'react'
import DemoLayout from './DemoLayout'
import './MetalurgicaDemo.css'

const SERVICES = [
  { icon: 'fa-industry', title: 'Corte y plegado CNC', desc: 'Chapa de hasta 6 mm con tolerancia ±0.1 mm.' },
  { icon: 'fa-fire', title: 'Soldadura MIG/TIG', desc: 'Acero inoxidable, aluminio y estructuras pesadas.' },
  { icon: 'fa-truck', title: 'Logística industrial', desc: 'Entrega en planta y obra en AMBA y GBA sur.' },
]

export default function MetalurgicaDemo() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ company: '', email: '', need: '' })

  const submit = (e) => {
    e.preventDefault()
    if (!form.company || !form.email) return
    setSent(true)
  }

  return (
    <DemoLayout
      title="Web institucional para metalúrgica"
      subtitle="Demo del sitio corporativo: propuesta de valor, servicios y contacto comercial B2B."
      client="Metalúrgica del Plata · Zona industrial"
    >
      <div className="metal-demo">
        <header className="metal-demo__hero">
          <div className="metal-demo__hero-overlay" />
          <div className="metal-demo__hero-content">
            <p>Ingeniería metalúrgica · Desde 1987</p>
            <h2>Precisión industrial para proyectos que exigen solidez</h2>
            <button type="button" className="metal-demo__cta">Solicitar presupuesto</button>
          </div>
        </header>

        <section className="metal-demo__services">
          {SERVICES.map((s) => (
            <article key={s.title}>
              <i className={`fas ${s.icon}`} />
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </article>
          ))}
        </section>

        <section className="metal-demo__contact">
          <div>
            <h3>Área comercial</h3>
            <p>Contanos tu proyecto: plazos, materiales y volumen de producción.</p>
            <ul>
              <li><i className="fas fa-check" /> Respuesta en 24 hs hábiles</li>
              <li><i className="fas fa-check" /> Asesoramiento técnico incluido</li>
              <li><i className="fas fa-check" /> Certificaciones ISO disponibles</li>
            </ul>
          </div>

          {sent ? (
            <div className="metal-demo__success">
              <i className="fas fa-check-circle" />
              <p>Consulta enviada. Un asesor comercial se contactará a la brevedad.</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <input
                placeholder="Empresa"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email corporativo"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <textarea
                placeholder="¿Qué necesitás fabricar?"
                rows={3}
                value={form.need}
                onChange={(e) => setForm({ ...form, need: e.target.value })}
              />
              <button type="submit">Enviar consulta</button>
            </form>
          )}
        </section>
      </div>
    </DemoLayout>
  )
}
