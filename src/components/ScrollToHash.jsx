import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function scrollToId(id, behavior = 'smooth') {
  if (!id) {
    window.scrollTo({ top: 0, behavior })
    return
  }
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior, block: 'start' })
}

export default function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const id = hash ? decodeURIComponent(hash.replace('#', '')) : ''
    let frames = 0

    const tick = () => {
      const el = id ? document.getElementById(id) : null
      if (!id) {
        window.scrollTo({ top: 0, behavior: 'auto' })
        return
      }
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (frames++ < 30) requestAnimationFrame(tick)
    }

    const timer = window.setTimeout(tick, 40)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return null
}
