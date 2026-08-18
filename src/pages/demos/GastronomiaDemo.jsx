import { useState } from 'react'
import DemoLayout from './DemoLayout'
import './GastronomiaDemo.css'

const TABLES = [
  { id: 1, label: 'Mesa 1', seats: 2, status: 'libre' },
  { id: 2, label: 'Mesa 2', seats: 4, status: 'ocupada', total: 18400 },
  { id: 3, label: 'Mesa 3', seats: 4, status: 'ocupada', total: 9200 },
  { id: 4, label: 'Mesa 4', seats: 6, status: 'libre' },
  { id: 5, label: 'Mesa 5', seats: 2, status: 'cuenta', total: 15600 },
  { id: 6, label: 'Mesa 6', seats: 4, status: 'libre' },
]

const MENU = [
  { id: 'p1', name: 'Bife de chorizo', price: 8900 },
  { id: 'p2', name: 'Ravioles caseros', price: 7200 },
  { id: 'p3', name: 'Ensalada César', price: 5400 },
  { id: 'p4', name: 'Vino Malbec (botella)', price: 6800 },
]

const fmt = (n) => `$${n.toLocaleString('es-AR')}`

export default function GastronomiaDemo() {
  const [selected, setSelected] = useState(2)
  const [orders, setOrders] = useState({
    2: [{ ...MENU[0], qty: 2 }],
    3: [{ ...MENU[1], qty: 1 }, { ...MENU[3], qty: 1 }],
    5: [{ ...MENU[0], qty: 1 }, { ...MENU[2], qty: 1 }],
  })

  const table = TABLES.find((t) => t.id === selected)
  const items = orders[selected] || []
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  const addItem = (item) => {
    setOrders((prev) => {
      const list = [...(prev[selected] || [])]
      const idx = list.findIndex((x) => x.id === item.id)
      if (idx >= 0) list[idx] = { ...list[idx], qty: list[idx].qty + 1 }
      else list.push({ ...item, qty: 1 })
      return { ...prev, [selected]: list }
    })
  }

  return (
    <DemoLayout
      title="Sistema de gestión gastronómica"
      subtitle="Demo del panel de salón: mesas, comandas y cierre de cuenta en un solo lugar."
      client="Restaurante · Buenos Aires"
    >
      <div className="gastro-demo">
        <aside className="gastro-demo__sidebar">
          <h3>Salón</h3>
          <div className="gastro-demo__tables">
            {TABLES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`gastro-demo__table gastro-demo__table--${t.status} ${selected === t.id ? 'gastro-demo__table--active' : ''}`}
                onClick={() => setSelected(t.id)}
              >
                <span>{t.label}</span>
                <small>{t.seats} pers.</small>
                <em>{t.status === 'libre' ? 'Libre' : t.status === 'cuenta' ? 'Cuenta' : 'Ocupada'}</em>
              </button>
            ))}
          </div>
          <div className="gastro-demo__stats">
            <div><strong>3</strong><span>Mesas activas</span></div>
            <div><strong>{fmt(43200)}</strong><span>Ventas hoy</span></div>
          </div>
        </aside>

        <section className="gastro-demo__main">
          <header className="gastro-demo__header">
            <div>
              <h2>{table?.label}</h2>
              <p>{items.length ? `${items.length} ítems en comanda` : 'Mesa libre — agregá productos'}</p>
            </div>
            <span className={`gastro-demo__pill gastro-demo__pill--${table?.status}`}>
              {table?.status === 'libre' ? 'Disponible' : table?.status === 'cuenta' ? 'Pidiendo cuenta' : 'En servicio'}
            </span>
          </header>

          <div className="gastro-demo__grid">
            <div className="gastro-demo__menu">
              <h4>Carta</h4>
              {MENU.map((item) => (
                <button key={item.id} type="button" className="gastro-demo__menu-item" onClick={() => addItem(item)}>
                  <span>{item.name}</span>
                  <span>{fmt(item.price)}</span>
                </button>
              ))}
            </div>

            <div className="gastro-demo__order">
              <h4>Comanda</h4>
              {items.length === 0 ? (
                <p className="gastro-demo__empty">Sin ítems. Tocá un producto de la carta.</p>
              ) : (
                <ul>
                  {items.map((item) => (
                    <li key={item.id}>
                      <span>{item.qty}x {item.name}</span>
                      <span>{fmt(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <footer>
                <strong>Total {fmt(total)}</strong>
                <button type="button" className="gastro-demo__btn">Enviar a cocina</button>
              </footer>
            </div>
          </div>
        </section>
      </div>
    </DemoLayout>
  )
}
