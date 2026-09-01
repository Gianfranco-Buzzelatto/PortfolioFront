import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './Intro.css'

export const INTRO_SESSION_KEY = 'gbdev-intro'

/* El clip vive sobre el padding de cada palabra (compensado con margin negativo),
   así el reveal nunca corta el antialias de las letras. */
const CLIP_HIDDEN = 'inset(0px 100% 0px 0px)'
const CLIP_SHOWN = 'inset(0px 0% 0px 0px)'

/* Si el navegador bloquea sessionStorage (modo privado estricto), este flag evita
   que la intro se repita al volver al home dentro de la misma carga de la SPA. */
let playedThisPageLoad = false

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  if (prefersReducedMotion()) return false
  if (playedThisPageLoad) return false
  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) !== 'true'
  } catch {
    return true
  }
}

export default function Intro({ heroRef }) {
  const [visible, setVisible] = useState(shouldPlayIntro)

  const rootRef = useRef(null)
  const logoRef = useRef(null)
  const gbRef = useRef(null)
  const dotRef = useRef(null)
  const devRef = useRef(null)
  const trailRef = useRef(null)
  const glowRef = useRef(null)
  const lineRef = useRef(null)

  useEffect(() => {
    if (!visible) return
    playedThisPageLoad = true
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, 'true')
    } catch {
      /* sin storage alcanza con playedThisPageLoad */
    }
  }, [visible])

  useLayoutEffect(() => {
    if (!visible) return undefined

    const root = rootRef.current
    const logo = logoRef.current
    const gb = gbRef.current
    const dot = dotRef.current
    const dev = devRef.current
    const trail = trailRef.current
    const glow = glowRef.current
    const line = lineRef.current

    let cancelled = false

    const ctx = gsap.context(() => {
      // Estado inicial antes del primer paint: pantalla negra, nada visible.
      gsap.set([gb, dev], { clipPath: CLIP_HIDDEN, willChange: 'clip-path' })
      gsap.set(dot, { scale: 0, autoAlpha: 0 })
      gsap.set([glow, trail], { autoAlpha: 0 })
      gsap.set(trail, { scaleX: 0 })
      gsap.set(line, { scaleX: 0, autoAlpha: 0 })
    }, rootRef)

    /* El punto arranca en el centro exacto del logo y viaja hasta su lugar entre
       GB y Dev. Medimos en vez de hardcodear el offset para que sea igual en
       cualquier viewport y con cualquier ancho de tipografía. */
    const measureTravel = () => {
      gsap.set(dot, { x: 0 })
      const logoBox = logo.getBoundingClientRect()
      const dotBox = dot.getBoundingClientRect()
      return Math.round(logoBox.left + logoBox.width / 2 - (dotBox.left + dotBox.width / 2))
    }

    const build = () => {
      const travel = measureTravel()
      gsap.set(dot, { x: travel })
      gsap.set(trail, { width: Math.max(Math.abs(travel), 1) })

      /* Recién acá el ref del hero está montado: React adjunta los refs en orden
         de árbol y el hero está después de la intro. Como la intro tapa la
         pantalla con negro opaco, esconderlo ahora no produce ningún flash. */
      const hero = heroRef?.current ?? null
      if (hero) gsap.set(hero, { autoAlpha: 0, y: 20 })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => setVisible(false),
      })

      tl
        // 0.20s · aparece el punto rojo con un overshoot corto
        .to(dot, { autoAlpha: 1, scale: 1.15, duration: 0.26, ease: 'power2.out' }, 0.2)
        .to(dot, { scale: 1, duration: 0.18, ease: 'power2.inOut' }, 0.46)
        // 0.45s · viaja a su posición final dejando una estela que se disuelve
        .to(dot, { x: 0, duration: 0.45, ease: 'power3.inOut' }, 0.45)
        .to(trail, { autoAlpha: 1, scaleX: 1, duration: 0.3, ease: 'power2.out' }, 0.45)
        .to(trail, { autoAlpha: 0, scaleX: 0, duration: 0.3, ease: 'power2.in' }, 0.66)
        // línea de profundidad detrás del logo
        .to(line, { autoAlpha: 1, scaleX: 1, duration: 0.8, ease: 'expo.out' }, 0.5)
        // 0.65s / 0.90s · reveal horizontal de GB y Dev
        .to(gb, { clipPath: CLIP_SHOWN, duration: 0.35 }, 0.65)
        .to(dev, { clipPath: CLIP_SHOWN, duration: 0.35 }, 0.9)
        // 1.20s · logo completo, pulse del punto y glow apenas perceptible
        .to(glow, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 1.15)
        .to(dot, { scale: 1.08, duration: 0.18, ease: 'power2.out' }, 1.2)
        .to(dot, { scale: 1, duration: 0.28, ease: 'power2.inOut' }, 1.38)
        // 1.62s · salida: el logo se retira y la web aparece detrás
        .set(root, { pointerEvents: 'none' }, 1.62)
        .to(logo, { scale: 0.94, autoAlpha: 0, duration: 0.48, ease: 'power2.inOut' }, 1.62)
        .to(line, { scaleX: 0.55, autoAlpha: 0, duration: 0.48, ease: 'power2.inOut' }, 1.62)
        .to(root, { autoAlpha: 0, duration: 0.42, ease: 'power2.inOut' }, 1.65)

      if (hero) {
        tl.to(hero, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.7)
      }
    }

    /* Esperamos sólo la tipografía del logo (no document.fonts.ready, que además
       aguarda todos los subsets de Inter): si la fuente cargara a mitad de la
       secuencia el logo cambiaría de ancho y el punto quedaría desalineado.
       El tope de 300ms evita que la pantalla negra se estire. */
    const start = () => {
      if (cancelled) return
      ctx.add(build)
    }

    const logoFont = document.fonts?.load('800 1em "Plus Jakarta Sans Variable"')
    if (logoFont) {
      Promise.race([logoFont, new Promise((resolve) => setTimeout(resolve, 300))]).then(start)
    } else {
      start()
    }

    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [visible, heroRef])

  if (!visible) return null

  return (
    <div className="intro" ref={rootRef} role="presentation" aria-hidden="true">
      <div className="intro__stage">
        <span className="intro__line" ref={lineRef} />
        <div className="intro__logo" ref={logoRef}>
          <span className="intro__word" ref={gbRef}>
            GB
          </span>
          <span className="intro__dot" ref={dotRef}>
            <span className="intro__trail" ref={trailRef} />
            <span className="intro__glow" ref={glowRef} />
          </span>
          <span className="intro__word" ref={devRef}>
            Dev
          </span>
        </div>
      </div>
    </div>
  )
}
