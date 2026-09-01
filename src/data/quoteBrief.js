/** Opciones del brief, compartidas por /cotizar y el alta manual del admin */

/** `label` es lo que ve el cliente en el wizard; `type` es el texto corto que
 *  queda guardado como `projectType` de la cotización. */
export const OBJECTIVES = [
  {
    id: 'mostrar_contacto',
    label: 'Mostrar mi negocio y que me contacten',
    type: 'Mostrar mi negocio y que me contacten',
    icon: 'fa-store',
    hint: 'Landing o sitio institucional',
  },
  {
    id: 'vender_online',
    label: 'Vender productos online con cobro automático',
    type: 'Vender productos online',
    icon: 'fa-shopping-cart',
    hint: 'Tienda online',
  },
  {
    id: 'pedidos_delivery',
    label: 'Recibir y gestionar pedidos (restaurant, delivery…)',
    type: 'Recibir y gestionar pedidos',
    icon: 'fa-motorcycle',
    hint: 'Plataforma de pedidos',
  },
  {
    id: 'agendar_turnos',
    label: 'Que me reserven turnos solos (peluquería, consultorio…)',
    type: 'Agendar turnos / reservas',
    icon: 'fa-calendar-check',
    hint: 'Turnero online',
  },
  {
    id: 'procesos_internos',
    label: 'Gestionar procesos internos (stock, ventas…)',
    type: 'Gestionar procesos internos',
    icon: 'fa-cogs',
    hint: 'Sistema a medida',
  },
  {
    id: 'asesoramiento',
    label: 'No estoy seguro (necesito asesoramiento)',
    type: 'Asesoramiento / No estoy seguro',
    icon: 'fa-comments',
    hint: 'Te oriento yo',
  },
]

export const OBJECTIVE_LABEL = Object.fromEntries(OBJECTIVES.map((o) => [o.id, o.type]))

export const PRESENCE_OPTIONS = [
  { id: 'no', label: 'No' },
  { id: 'si_mejorar', label: 'Sí, pero quiero mejorar' },
  { id: 'si_no_funciona', label: 'Sí, pero no funciona' },
]

export const BUDGET_OPTIONS = [
  { id: 'hasta_500', label: 'Hasta USD 500' },
  { id: '500_1000', label: 'USD 500 – 1.000' },
  { id: '1000_2500', label: 'USD 1.000 – 2.500' },
  { id: '2500_plus', label: 'USD 2.500+' },
  { id: 'no_se', label: 'Aún no lo definí' },
]

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
