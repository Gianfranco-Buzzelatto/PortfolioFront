import { useState } from 'react'
import DemoLayout from './DemoLayout'
import './VelasDemo.css'

const PRODUCTS = [
  { id: 1, name: 'Ámbar & Vainilla', family: 'Dulce', price: 18500, note: 'Cera de soja · 40 hs' },
  { id: 2, name: 'Bosque de Cedro', family: 'Amaderada', price: 21000, note: 'Cera de soja · 45 hs' },
  { id: 3, name: 'Cítricos al Sol', family: 'Fresca', price: 16500, note: 'Cera de soja · 35 hs' },
  { id: 4, name: 'Lavanda Nocturna', family: 'Floral', price: 19000, note: 'Cera de soja · 40 hs' },
  { id: 5, name: 'Canela & Clavo', family: 'Especiada', price: 20000, note: 'Cera de soja · 42 hs' },
  { id: 6, name: 'Brisa Marina', family: 'Fresca', price: 17500, note: 'Cera de soja · 38 hs' },
]

const fmt = (n) => `$${n.toLocaleString('es-AR')}`

export default function VelasDemo() {
  const [filter, setFilter] = useState('')
  const [cart, setCart] = useState([PRODUCTS[0], PRODUCTS[3]])
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
      title="E-commerce para marca de velas"
      subtitle="Demo del catálogo y carrito: aromas, filtros y compra simple. Datos inventados."
      client="Marca de velas · demo anonimizada"
    >
      <div className="velas-demo">
        <header className="velas-demo__top">
          <div className="velas-demo__brand">Lumen Atelier</div>
          <nav className="velas-demo__filters">
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

        <div className="velas-demo__body">
          <div className="velas-demo__grid">
            {visible.map((p) => (
              <article key={p.id} className={`velas-demo__card ${added === p.id ? 'velas-demo__card--added' : ''}`}>
                <div className="velas-demo__flame" aria-hidden />
                <span className="velas-demo__family">{p.family}</span>
                <h3>{p.name}</h3>
                <p>{p.note}</p>
                <footer>
                  <strong>{fmt(p.price)}</strong>
                  <button type="button" onClick={() => addToCart(p)}>Agregar</button>
                </footer>
              </article>
            ))}
          </div>

          <aside className="velas-demo__cart">
            <h4>Carrito ({cart.length})</h4>
            {cart.length === 0 ? (
              <p className="velas-demo__empty">Tu carrito está vacío</p>
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
            <div className="velas-demo__total">
              <span>Total</span>
              <strong>{fmt(total)}</strong>
            </div>
            <button type="button" className="velas-demo__checkout" disabled={!cart.length}>
              Finalizar compra
            </button>
            <p className="velas-demo__note">Envío a todo el país · Pack regalo opcional</p>
          </aside>
        </div>
      </div>
    </DemoLayout>
  )
}
