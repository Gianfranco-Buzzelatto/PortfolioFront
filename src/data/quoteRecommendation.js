import { getCategory } from './quoteCatalog2026'
import { TIER_META } from './quoteTiers'

const OBJECTIVE_TO_NEED = {
  mostrar_contacto: 'contacto',
  vender_online: 'ventas',
  pedidos_delivery: 'pedidos',
  agendar_turnos: 'agenda',
  procesos_internos: 'operacion',
  asesoramiento: 'orientacion',
  mas_clientes: 'contacto',
  mostrar_negocio: 'marca',
  automatizar: 'operacion',
  'Conseguir más clientes': 'contacto',
  'Mostrar mi negocio y que me contacten': 'contacto',
  'Vender productos online': 'ventas',
  'Recibir y gestionar pedidos': 'pedidos',
  'Agendar turnos / reservas': 'agenda',
  'Gestionar procesos internos': 'operacion',
  'Asesoramiento / No estoy seguro': 'orientacion',
}

const OBJECTIVE_TO_CATEGORY = {
  mostrar_contacto: 'landing',
  vender_online: 'ecommerce',
  pedidos_delivery: 'pedidos',
  agendar_turnos: 'turnero',
  procesos_internos: 'sistema',
  asesoramiento: 'institucional',
  mas_clientes: 'landing',
  mostrar_negocio: 'institucional',
  automatizar: 'sistema',
}

const PEDIDOS_HINT = /pedido|delivery|restaurant|restaurante|men[uú]|comida|kiosco|panader[ií]a|take away|takeaway/i

export function detectNeed(lead = {}) {
  return OBJECTIVE_TO_NEED[lead.objective] || OBJECTIVE_TO_NEED[lead.projectType] || 'orientacion'
}

export function detectCategory(lead = {}) {
  if (lead.projectCategory && getCategory(lead.projectCategory)) {
    return lead.projectCategory
  }

  const text = `${lead.description || ''} ${lead.business || ''} ${lead.details || ''}`.toLowerCase()
  const objective = lead.objective

  if (objective === 'pedidos_delivery' || PEDIDOS_HINT.test(text)) {
    if (objective === 'vender_online' || /vender|producto|cat[aá]logo/i.test(text)) {
      return PEDIDOS_HINT.test(text) ? 'pedidos' : 'ecommerce'
    }
    if (/delivery|restaurant|men[uú]|pedido/i.test(text)) return 'pedidos'
  }

  if (OBJECTIVE_TO_CATEGORY[objective]) {
    const cat = OBJECTIVE_TO_CATEGORY[objective]
    if (cat === 'ecommerce' && PEDIDOS_HINT.test(text)) return 'pedidos'
    return cat
  }

  if (/turno|agenda|cita|peluquer|est[eé]tica|consultorio|veterinar/i.test(text)) return 'turnero'
  if (/sistema|erp|inventario|stock|reporte|excel/i.test(text)) return 'sistema'
  if (/tienda|e-?commerce|mercadopago|carrito/i.test(text)) return 'ecommerce'
  if (/landing|una p[aá]gina|whatsapp/i.test(text)) return 'landing'

  return 'institucional'
}

export function suggestRecommendation(lead = {}) {
  const category = detectCategory(lead)
  const budget = lead.budget || ''
  const cat = getCategory(category)

  let plan = 'media'
  if (budget === 'hasta_500') plan = 'base'
  else if (budget === '2500_plus') plan = 'premium'
  else if (budget === '1000_2500' && ['ecommerce', 'pedidos', 'sistema'].includes(category)) plan = 'media'
  else if (budget === '500_1000' && (category === 'landing' || category === 'turnero')) plan = 'premium'

  if (detectNeed(lead) === 'operacion') plan = 'media'
  if (detectNeed(lead) === 'pedidos' && plan === 'base') plan = 'media'
  if (detectNeed(lead) === 'agenda' && plan === 'base' && budget !== 'hasta_500') plan = 'media'

  return {
    plan,
    projectCategory: category,
    premiumType: category === 'sistema' || category === 'turnero' ? 'sistema' : category === 'pedidos' ? 'pedidos' : category === 'ecommerce' ? 'tienda' : 'tienda',
    categoryLabel: cat.label,
    fitFor: cat.fitFor,
    notFor: cat.notFor,
  }
}

const PLAN_LABEL = {
  base: 'Básico',
  media: 'Intermedio',
  premium: 'Premium',
}

function firstName(name = '') {
  return String(name).trim().split(/\s+/)[0] || 'hola'
}

function biz(lead = {}) {
  return lead.business?.trim() || 'tu negocio'
}

function planName(plan, projectCategory) {
  const cat = getCategory(projectCategory)
  return `${PLAN_LABEL[plan] || 'Intermedio'} · ${cat.label}`
}

function whatItIs(plan, projectCategory) {
  const cat = getCategory(projectCategory)
  const tier = cat.tiers[plan]
  const scope = tier.includes.slice(0, 2).join(' y ')
  return `${cat.fitFor} En el plan ${PLAN_LABEL[plan]} incluye ${scope.toLowerCase()}, entre otras cosas.`
}

function howItHelps(plan, projectCategory, need, business) {
  const b = biz({ business })
  const cat = getCategory(projectCategory)

  if (projectCategory === 'landing') {
    return plan === 'base'
      ? `Te ayuda a no perder consultas: cuando alguien busca ${b}, entiende la oferta en segundos y te escribe. Menos “después te mando info”.`
      : plan === 'media'
        ? `Sumás secciones que generan confianza (testimonios, galería, mapa) sin armar un sitio enorme. Ideal si ya tenés algo para mostrar.`
        : `Podés actualizar textos e imágenes vos mismo y el sitio carga rápido. Menos dependencia mía para cambios chicos.`
  }

  if (projectCategory === 'institucional') {
    return plan === 'base'
      ? `Un visitante recorre servicios, equipo y contacto sin pedirte un PDF. Eso baja la desconfianza frente a ${b}.`
      : plan === 'media'
        ? `Editás contenido desde un panel y podés publicar novedades en el blog. La web deja de quedar congelada.`
        : `Newsletter, SEO y presencia en Google Business refuerzan que ${b} es una opción seria, no solo un perfil de redes.`
  }

  if (projectCategory === 'ecommerce') {
    return plan === 'base'
      ? `Abrís un canal de venta con catálogo, carrito y Mercado Pago. Dejás de cerrar todo a mano por chat.`
      : plan === 'media'
        ? `Variantes, stock y cupones reducen errores y consultas repetidas. El cliente compra con menos fricción.`
        : `Wishlist, tracking y reseñas elevan la confianza. Vendés incluso cuando el local está cerrado.`
  }

  if (projectCategory === 'pedidos') {
    return plan === 'base'
      ? `El cliente arma el pedido online y vos lo ves ordenado en un panel. Menos errores de “me confundí con el WhatsApp”.`
      : plan === 'media'
        ? `WhatsApp automático, cupones y tiempos estimados mejoran la experiencia sin sumar personal extra.`
        : `Tracking en vivo y reportes te muestran qué vende más y cómo va la operación en tiempo real.`
  }

  if (projectCategory === 'turnero') {
    return plan === 'base'
      ? `Dejás de acomodar horarios a mano: el cliente elige un hueco libre y ${b} ve la agenda del día sin pelearse con el chat.`
      : plan === 'media'
        ? `Varios servicios o profesionales, con bloqueos y feriados. Menos turnos dobles y menos “¿el martes a las 16?”.`
        : `Recordatorios y un panel más completo bajan las ausencias y te dejan ver cancelaciones y notas sin Excel.`
  }

  return plan === 'base'
    ? `Ordenás 1-2 procesos críticos de ${b} (inventario, ventas, etc.) en un solo lugar con usuarios y roles.`
    : plan === 'media'
      ? `Sumás módulos y reportes para decidir con datos, no con intuición.`
      : `Integraciones y automatizaciones conectan lo que hoy está en planillas, mails y chats sueltos.`
}

function howToUse(plan, projectCategory) {
  if (['landing', 'institucional'].includes(projectCategory)) {
    return plan === 'premium' && projectCategory === 'landing'
      ? 'Entrás al panel, cambiás textos o fotos y listo. Compartís el link en Instagram, WhatsApp y Google.'
      : 'Compartís el link como sede digital. El visitante recorre las páginas y te contacta. Cambios los hacemos en revisiones o con el plan de cuidado.'
  }
  if (projectCategory === 'ecommerce') {
    return 'Cargás productos con foto y precio. El cliente compra y paga online. Vos ves pedidos en el panel y preparás el envío o retiro.'
  }
  if (projectCategory === 'pedidos') {
    return 'Publicás menú o catálogo. El cliente pide, paga si corresponde, y el pedido entra al panel para preparar y entregar. Podés avisar por WhatsApp automático.'
  }
  if (projectCategory === 'turnero') {
    return 'Compartís el link. El cliente elige servicio, día y hora. Vos abrís la agenda, ves quién viene y podés bloquear horarios cuando no atiendas.'
  }
  return 'Entrás con usuario y contraseña. Cargás o consultás la info del día según el módulo. Tu equipo usa la misma pantalla.'
}

function whyThisNotThat(plan, projectCategory) {
  const cat = getCategory(projectCategory)

  if (plan === 'base') {
    return {
      vsLower: null,
      vsHigher: `Intermedio y Premium suman funciones que hoy quizá no uses. ${cat.notFor} Empezamos por Básico y escalamos cuando el negocio lo pida.`,
    }
  }
  if (plan === 'media') {
    return {
      vsLower: 'Básico alcanza si el objetivo es mínimo viable. Te quedás corto si ya sabés que vas a necesitar más módulos pronto.',
      vsHigher: 'Premium tiene sentido cuando el volumen o la operación justifican invertir más de entrada (más productos, más pedidos, más procesos).',
    }
  }
  return {
    vsLower: `Básico e Intermedio cubren menos alcance. Si el cuello de botella ya te cuesta plata todos los meses, Premium amortiza más rápido.`,
    vsHigher: null,
  }
}

function brandImpact(plan, projectCategory, business) {
  const b = biz({ business })
  if (['landing', 'institucional'].includes(projectCategory)) {
    return `En ${b} la marca pasa de “solo redes” a tener sede propia, buscable y compartible. Se lee como empresa, no como changa.`
  }
  if (projectCategory === 'ecommerce') {
    return 'Checkout prolijo, precios visibles y fotos ordenadas dicen “cumplo”. Es la diferencia entre catálogo de Instagram y tienda donde la gente se anima a pagar.'
  }
  if (projectCategory === 'pedidos') {
    return 'Pedir online con tiempos y confirmaciones transmite orden. El cliente percibe un negocio que controla la operación, no uno improvisado.'
  }
  if (projectCategory === 'turnero') {
    return `Reservar online dice que ${b} está organizado: hay horarios, hay confirmación, no se improvisa por chat a las 23 hs.`
  }
  return `Hacia afuera, menos demoras. Hacia adentro, ${b} se profesionaliza: menos depender de una sola persona que “tiene todo en la cabeza”.`
}

function faqs(plan, projectCategory, careIncluded) {
  const list = [
    {
      q: '¿Cuánto me involucra a mí?',
      a: projectCategory === 'sistema' || projectCategory === 'turnero'
        ? 'Al inicio definimos qué datos entran al sistema. Después lo usás en el día a día. El desarrollo y la configuración técnica los hago yo.'
        : 'Me pasás textos, fotos y qué querés destacar. El armado, dominio y publicación los resuelvo yo. Tu tiempo va a contenido, no a código.',
    },
    {
      q: '¿Y si mañana quiero más?',
      a: 'El plan no te encierra. Lo que no está incluido se cotiza aparte y se suma sobre lo ya hecho. Por eso existen Básico, Intermedio y Premium.',
    },
    {
      q: '¿Quién es dueño del sitio?',
      a: 'Vos. Si contratás el cuidado del sitio, yo opero hosting, dominio y base. Si un día lo querés en tus cuentas, te lo paso.',
    },
    {
      q: '¿Cómo se paga?',
      a: 'Desarrollo: 40% al arrancar, 30% a mitad de proyecto y 30% contra entrega. El cuidado del sitio, si lo tomás, es mensual desde la publicación (mínimo 3 meses).',
    },
  ]

  if (careIncluded !== false) {
    list.push({
      q: '¿Para qué la mensualidad si ya pagué el proyecto?',
      a: 'El proyecto es construir. La mensualidad es que no se corte la luz: hosting, dominio, base, backups y cambios chicos. Sin eso, el sitio no vive estable en internet.',
    })
  }

  if (['ecommerce', 'pedidos'].includes(projectCategory)) {
    list.push({
      q: '¿MercadoPago lo tengo que tener yo?',
      a: 'Sí: la cuenta es tuya, el dinero entra a tu nombre. Yo conecto el cobro. Las comisiones las define MercadoPago, no este presupuesto.',
    })
  }

  const cat = getCategory(projectCategory)
  list.unshift({
    q: '¿Es el tipo de proyecto correcto?',
    a: `${cat.fitFor} ${cat.notFor}`,
  })

  return list
}

export function buildRecommendation(lead = {}, { plan = 'media', projectCategory = 'landing', premiumType, careIncluded = true } = {}) {
  const category = projectCategory || (premiumType === 'sistema' ? 'sistema' : premiumType === 'pedidos' ? 'pedidos' : 'landing')
  const need = detectNeed(lead)
  const name = firstName(lead.clientName)
  const chosen = planName(plan, category)
  const compare = whyThisNotThat(plan, category)
  const tagline = TIER_META[plan]?.tagline || ''
  const cat = getCategory(category)

  const sections = [
    {
      title: 'Qué te estoy recomendando',
      body: `${name}, para lo que contaste, te propongo ${chosen}. ${tagline}. ${whatItIs(plan, category)}`,
    },
    {
      title: '¿Por qué este tipo de proyecto?',
      body: `${cat.fitFor} ${cat.notFor}`,
    },
    {
      title: '¿En qué te ayudaría?',
      body: howItHelps(plan, category, need, lead.business),
    },
    {
      title: '¿Cómo se usa en el día a día?',
      body: howToUse(plan, category),
    },
    {
      title: '¿Por qué este plan y no otro?',
      body: [compare.vsLower, compare.vsHigher].filter(Boolean).join(' '),
    },
    {
      title: '¿Cómo impacta en tu marca?',
      body: brandImpact(plan, category, lead.business),
    },
  ]

  return {
    need,
    plan,
    projectCategory: category,
    premiumType,
    chosen,
    categoryLabel: cat.label,
    headline: `Recomendación: ${chosen}`,
    intro: 'Esta propuesta no es un menú para confundirte. Las tres opciones existen para que compares; la que te marco es la que yo tomaría en tu lugar, con la información que me diste.',
    sections,
    faqs: faqs(plan, category, careIncluded),
  }
}
