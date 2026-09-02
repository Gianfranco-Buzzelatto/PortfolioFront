import { useEffect, useState } from 'react'
import './ConnectionError.css'

/**
 * Pantalla de carga con aviso diferido.
 *
 * El cliente HTTP reintenta dos veces antes de darse por vencido, así que ante
 * un backend dormido pueden pasar ~15 segundos hasta el error. Sin este aviso
 * el usuario mira un "Cargando…" mudo y asume que se rompió.
 */
export default function LoadingState({
  label = 'Cargando…',
  hint = 'El servidor puede estar despertando. Dale unos segundos.',
  hintAfterMs = 4000,
}) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setSlow(true), hintAfterMs)
    return () => clearTimeout(id)
  }, [hintAfterMs])

  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-state__spinner" aria-hidden="true">
        <i className="fas fa-circle-notch fa-spin" />
      </span>
      <p className="loading-state__label">{label}</p>
      {slow && <p className="loading-state__hint">{hint}</p>}
    </div>
  )
}
