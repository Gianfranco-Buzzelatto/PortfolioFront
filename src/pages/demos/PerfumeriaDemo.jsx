import { useState } from 'react'
import DemoLayout from './DemoLayout'
import './PerfumeriaDemo.css'

const PRODUCTS = [
  { id: 1, name: 'Nuit Élégante', family: 'Oriental', price: 42000, note: 'Vainilla · Ámbar · Sándalo' },
  { id: 2, name: 'Rosa de Provence', family: 'Floral', price: 38500, note: 'Rosa · Peonía · Almizcle' },
  { id: 3, name: 'Citrus Fresh', family: 'Cítrico', price: 32000, note: 'Bergamota · Limón · Neroli' },
  { id: 4, name: 'Bois Intense', family: 'Amaderado', price: 45000, note: 'Cedro · Vetiver · Pachulí' },
  { id: 5, name: 'Velours Noire', family: 'Oriental', price: 48000, note: 'Iris · Cuero · Tabaco' },
  { id: 6, name: 'Brise Marine', family: 'Acuático', price: 36000, note: 'Sal marina · Algas · Jazmín' },
]

const fmt = (n) => `$${n.toLocaleString('es-AR')}`

export default function PerfumeriaDemo() {
  const [filter, setFilter] = useState('')
  const [cart, setCart] = useState([PRODUCTS[0], PRODUCTS[2]])
  const [added, setAdded] = useState(null)

  const families = ['', ...new Set(PRODUCTS.map((p) => p.family))]
  const visible = filter ? PRODUCTS.filter((p) => p.family === filter) : PRODUCTS
  const total = cart.reduce((s, p) => s + p.price, 0)

  const addToCart = (product) => {
    setCart((prev) => [...prev, product])
    setAdded(product.id)
    setTimeout(() => setAdded(null), 900)
  }

  return (
    <DemoLayout
      title="Tienda online para perfumería"
      subtitle="Demo del catálogo y checkout: navegación por familia olfativa y carrito simplificado."
      client="Perfumería boutique · CABA"
    >
      <div className="perf-demo">
        <header className="perf-demo__top">
          <div className="perf-demo__brand">Maison Élixir</div>
          <nav className="perf-demo__filters">
            {families.map((f) => (
              <button
                key={f || 'all'}
                type="button"
                className={filter === f ? 'active' : ''}
                onClick={() => setFilter(f)}
              >
                {f || 'Todos'}
              </button>
            ))}
          </nav>
        </header>

        <div className="perf-demo__body">
          <div className="perf-demo__grid">
            {visible.map((p) => (
              <article key={p.id} className={`perf-demo__card ${added === p.id ? 'perf-demo__card--added' : ''}`}>
                <div className="perf-demo__bottle" aria-hidden />
                <span className="perf-demo__family">{p.family}</span>
                <h3>{p.name}</h3>
                <p>{p.note}</p>
                <footer>
                  <strong>{fmt(p.price)}</strong>
                  <button type="button" onClick={() => addToCart(p)}>Agregar</button>
                </footer>
              </article>
            ))}
          </div>

          <aside className="perf-demo__cart">
            <h4>Carrito ({cart.length})</h4>
            {cart.length === 0 ? (
              <p className="perf-demo__empty">Tu carrito está vacío</p>
            ) : (
              <ul>
                {cart.map((p, i) => (
                  <li key={`${p.id}-${i}`}>
                    <span>{p.name}</span>
                    <span>{fmt(p.price)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="perf-demo__total">
              <span>Total</span>
              <strong>{fmt(total)}</strong>
            </div>
            <button type="button" className="perf-demo__checkout" disabled={!cart.length}>
              Finalizar compra
            </button>
            <p className="perf-demo__note">Envío gratis en CABA · 3 cuotas sin interés</p>
          </aside>
        </div>
      </div>
    </DemoLayout>
  )
}
