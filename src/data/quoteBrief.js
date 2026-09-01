/** Opciones del brief público /cotizar */

export const FEATURE_OPTIONS = [
  { id: 'landing', label: 'Landing page' },
  { id: 'institucional', label: 'Web corporativa' },
  { id: 'ecommerce', label: 'E-commerce / tienda' },
  { id: 'sistema', label: 'Sistema web a medida' },
  { id: 'turnero', label: 'Reservas / turnos' },
  { id: 'login', label: 'Login de usuarios' },
  { id: 'admin', label: 'Panel administrativo' },
  { id: 'database', label: 'Base de datos' },
  { id: 'mercadopago', label: 'Mercado Pago' },
  { id: 'whatsapp', label: 'Integración WhatsApp' },
  { id: 'emails', label: 'Emails automáticos' },
  { id: 'catalogo', label: 'Catálogo de productos/servicios' },
  { id: 'analytics', label: 'Analytics / SEO básico' },
]

export const INFRA_QUESTIONS = [
  { id: 'domain', label: '¿Tenés dominio?' },
  { id: 'hosting', label: '¿Tenés hosting?' },
  { id: 'brand', label: '¿Tenés identidad visual (logo, colores)?' },
  { id: 'content', label: '¿Tenés textos / contenido listo?' },
  { id: 'photos', label: '¿Tenés fotografías propias?' },
  { id: 'social', label: '¿Tenés redes sociales activas?' },
]

/** Necesidades extra (discovery) — no saturan el catálogo de features */
export const NEED_FLAGS = [
  { id: 'seo', label: 'SEO (aparecer en Google)' },
  { id: 'pwa', label: 'App instalable en el celular (PWA)' },
  { id: 'multilang', label: 'Multiidioma' },
  { id: 'integrations', label: 'Integración con sistemas que ya usás' },
]

export const INFRA_ANSWERS = [
  { id: 'si', label: 'Sí' },
  { id: 'no', label: 'No' },
  { id: 'parcial', label: 'Parcial' },
  { id: 'ns', label: 'No sé' },
]

export const EMPTY_INFRA = Object.fromEntries(INFRA_QUESTIONS.map((q) => [q.id, '']))
export const EMPTY_NEEDS = Object.fromEntries(NEED_FLAGS.map((q) => [q.id, '']))

export function labelFeatures(ids = []) {
  const map = Object.fromEntries(FEATURE_OPTIONS.map((f) => [f.id, f.label]))
  return ids.map((id) => map[id] || id)
}

export function labelInfra(value) {
  return INFRA_ANSWERS.find((a) => a.id === value)?.label || value || '—'
}

export function labelNeed(value) {
  return labelInfra(value)
}
