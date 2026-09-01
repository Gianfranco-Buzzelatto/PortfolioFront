export const DEFAULT_TITLE = 'Gianfranco Buzzelatto · Desarrollo web para negocios'
export const DEFAULT_DESCRIPTION =
  'Landings, tiendas online y sistemas a medida para pymes en Buenos Aires. Propuesta clara en 24–48 hs hábiles.'
export const SITE_NAME = 'GB.Dev'
export const OG_LOCALE = 'es_AR'
export const SITE_LANG = 'es-AR'

export function getSiteUrl() {
  const fromEnv = String(import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return 'https://gbdev.com.ar'
}

export function canonicalUrl(path = '/') {
  const origin = getSiteUrl()
  const clean = path.startsWith('/') ? path : `/${path}`
  if (clean === '/') return `${origin}/`
  return `${origin}${clean}`
}

export function absoluteUrl(path = '/') {
  if (!path) return getSiteUrl()
  if (/^https?:\/\//i.test(path)) return path
  const origin = getSiteUrl()
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

export const DEFAULT_OG_IMAGE = '/images/gianfranco-gbdev.png'
