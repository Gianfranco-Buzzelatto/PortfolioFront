/**
 * Contenido comercial GB.Dev — alineado al mapa de vistas.
 * Casos anonimizados por rubro; demos con datos inventados.
 */

/** Poné en `true` para volver a mostrar /demos y botones de demo. El código queda en el repo. */
export const DEMOS_ENABLED = false

/** Logos vía Simple Icons (color de marca). */
export const TECH_STACK = [
  { name: 'React', slug: 'react', color: '61DAFB' },
  { name: 'JavaScript', slug: 'javascript', color: 'F7DF1E' },
  { name: 'TypeScript', slug: 'typescript', color: '3178C6' },
  { name: 'Next.js', slug: 'nextdotjs', color: 'FFFFFF' },
  { name: 'Node.js', slug: 'nodedotjs', color: '5FA04E' },
  { name: 'Express', slug: 'express', color: 'FFFFFF' },
  { name: 'MongoDB', slug: 'mongodb', color: '47A248' },
  { name: 'PostgreSQL', slug: 'postgresql', color: '4169E1' },
  { name: 'Supabase', slug: 'supabase', color: '3FCF8E' },
  { name: 'Vite', slug: 'vite', color: '646CFF' },
  { name: 'Tailwind', slug: 'tailwindcss', color: '06B6D4' },
  { name: 'Git', slug: 'git', color: 'F05032' },
  { name: 'GitHub', slug: 'github', color: 'FFFFFF' },
]

export const DIFFERENTIALS = [
  {
    icon: 'fa-comments',
    title: 'Hablo claro',
    desc: 'Sin tecnicismos. Entendés qué se hace, cuánto cuesta y en cuánto tiempo.',
  },
  {
    icon: 'fa-bullseye',
    title: 'Empezamos por el problema',
    desc: 'Te propongo lo que considero mejor para enfrentar el problema a solucionar.',
  },
  {
    icon: 'fa-layer-group',
    title: 'Alcance por etapas',
    desc: 'Primero lo urgente y después vamos adaptando según las necesidades.',
  },
  {
    icon: 'fa-handshake',
    title: 'Acompañamiento post-lanzamiento',
    desc: 'Podés seguir con nosotros (con descuento) o llevarte el código y trabajar con otro equipo.',
  },
]

export const TESTIMONIALS = [
  {
    quote:
      'Antes todo era WhatsApp suelto. Ahora el pedido llega ordenado y el equipo sabe en qué está cada uno.',
    name: 'Dueño de hamburguesería',
    meta: 'Sistema + pedidos · Buenos Aires',
  },
  {
    quote:
      'La tienda quedó simple de cargar. Vendemos aunque el local esté cerrado y no dependemos solo de Instagram.',
    name: 'Marca de producto',
    meta: 'E-commerce · Retail',
  },
  {
    quote:
      'Entendió el negocio rápido y me explicó las opciones sin marearme. La propuesta fue clara desde el día uno.',
    name: 'Emprendedora',
    meta: 'Landing + contacto',
  },
]

export const CLIENT_MARKS = [
  { label: 'Gastronomía', hint: 'Salón y cocina' },
  { label: 'Perfumería', hint: 'Retail' },
  { label: 'Velas', hint: 'Producto' },
  { label: 'Pedidos', hint: 'Delivery' },
  { label: 'Turnos', hint: 'Agenda online' },
]

export const HOME_PILLARS = [
  {
    icon: 'fa-user-plus',
    title: 'Conseguir clientes',
    desc: 'Una página que diga quién sos y haga que te escriban por WhatsApp.',
    to: '/soluciones#conseguir-clientes',
  },
  {
    icon: 'fa-store',
    title: 'Vender online',
    desc: 'Tu vitrina abierta 24 hs: el cliente elige, paga y vos recibís el pedido.',
    to: '/soluciones#vender-online',
  },
  {
    icon: 'fa-motorcycle',
    title: 'Recibir pedidos',
    desc: 'Centralizá tus pedidos en un solo lugar y evitá confusiones, olvidos y clientes sin respuesta.',
    to: '/soluciones#recibir-pedidos',
  },
  {
    icon: 'fa-calendar-check',
    title: 'Agendar turnos',
    desc: 'Automatizá las reservas y dejá que tus clientes elijan día y horario según tu disponibilidad.',
    to: '/soluciones#turneros',
  },
  {
    icon: 'fa-sitemap',
    title: 'Organizar el día a día',
    desc: 'Centralizá clientes, ventas, pedidos, tareas, stock y la información de tu negocio en un solo lugar.',
    to: '/soluciones#organizar-procesos',
  },
]

export const SOLUTIONS = [
  {
    id: 'conseguir-clientes',
    eyebrow: '01',
    title: 'Conseguir clientes',
    types: ['Landing page', 'Sitio institucional'],
    plainName: 'Tu carta de presentación online',
    forWhom: 'Para cuando te buscan en Google o Instagram y querés que te escriban, no que “miren y se vayan”.',
    plain:
      'Es una página (o un sitio chico) que explica qué hacés, para quién y por qué confiar. El objetivo no es “tener web”: es que la persona termine mandándote un WhatsApp o un mensaje.',
    dayToDay: 'Vos no tenés que “manejar un sistema”. Solo recibís consultas. Si más adelante querés cambiar un texto o una foto, se puede dejar simple de editar.',
    includes: [
      'Se ve bien en el celular (ahí llega casi todo el mundo)',
      'Botón grande a WhatsApp o formulario de contacto',
      'Textos claros: qué ofrecés y qué pasa después de escribirte',
      'Publicada en internet con un link para compartir',
    ],
    from: 180,
    demo: null,
    cta: '/cotizar',
  },
  {
    id: 'vender-online',
    eyebrow: '02',
    title: 'Vender online',
    types: ['Tienda online'],
    plainName: 'Tu tienda abierta aunque el local esté cerrado',
    forWhom: 'Para cuando vendés productos y te cansás de cotizar por chat, o querés cobrar sin que la gente tenga que ir al local.',
    plain:
      'Es como una vidriera + caja registradora en el celular: el cliente ve precios, elige, paga y vos recibís el pedido. El dinero entra a tu cuenta (por ejemplo Mercado Pago).',
    dayToDay: 'Vos cargás productos, precios y fotos desde un panel simple. No hace falta ser “técnico”.',
    includes: [
      'Catálogo con fotos y precios',
      'Carrito de compra (como en las tiendas grandes, pero a tu medida)',
      'Cobro online a tu nombre',
      'Panel para agregar o sacar productos sin pedir ayuda cada vez',
    ],
    from: 700,
    demo: '/demo/perfumeria',
    cta: '/cotizar',
  },
  {
    id: 'recibir-pedidos',
    eyebrow: '03',
    title: 'Recibir pedidos',
    types: ['Plataforma de pedidos'],
    plainName: 'Que el pedido llegue ordenado a tu equipo',
    forWhom: 'Para locales que entregan comida, take away o delivery y hoy reciben todo por WhatsApp: se mezclan, se pierden y nadie sabe en qué está cada pedido.',
    plain:
      'El cliente arma el pedido en una página clara. Del otro lado, tu equipo ve una lista: qué pidió, a qué hora, si está pendiente, en preparación o listo. Menos “¿me pasás de nuevo el pedido?”.',
    dayToDay: 'Cocina o mostrador mira una sola pantalla. Vos ves cómo viene el día. El cliente deja de depender de un chat interminable.',
    includes: [
      'Menú o catálogo para pedir desde el celular',
      'Estados del pedido (recién llegó → se prepara → listo)',
      'Vista pensada para quien atiende, no solo para el cliente',
      'Números del día: cuántos pedidos, qué se vendió',
    ],
    from: 1300,
    demo: '/demo/gastronomia',
    cta: '/cotizar',
  },
  {
    id: 'turneros',
    eyebrow: '04',
    title: 'Agendar turnos',
    types: ['Turnero online'],
    plainName: 'Que te reserven sin saturarte de mensajes',
    forWhom:
      'Para peluquerías, centros de estética, consultorios, talleres, estudios, profesores, clínicas veterinarias y cualquier rubro donde la gente pide “¿tenés lugar el martes?”.',
    plain:
      'El cliente elige día y horario en una página clara (según lo que vos habilites). Vos ves la agenda ordenada: quién viene, a qué hora y para qué. Menos ida y vuelta por WhatsApp y menos turnos dobles o olvidados.',
    dayToDay:
      'Abrís la agenda del día y sabés qué te espera. Podés bloquear horarios, feriados o profesionales. El cliente recibe confirmación; vos dejás de pelearte con el chat para acomodar horarios.',
    includes: [
      'Reserva desde el celular, sin instalar nada',
      'Agenda por día, servicio o profesional (según el rubro)',
      'Confirmación al cliente (WhatsApp o email, según lo que armemos)',
      'Control tuyo: horarios disponibles, duración y bloqueos',
    ],
    from: 550,
    demo: null,
    cta: '/cotizar',
  },
  {
    id: 'organizar-procesos',
    eyebrow: '05',
    title: 'Organizar el día a día',
    types: ['Sistema a medida'],
    plainName: 'Ordenar lo que hoy está “en la cabeza” o en Excel',
    forWhom: 'Para cuando el negocio creció y lo importante vive en planillas, papeles o mensajes. Cuesta entrenar gente nueva y se pierde información.',
    plain:
      'Es una herramienta hecha a tu forma de trabajar: clientes, stock, ventas, reportes o lo que realmente duela. No es “un programa genérico”: arrancamos por 1 o 2 cosas importantes y después se puede sumar más.',
    dayToDay: 'Tu equipo entra con usuario, ve solo lo que le corresponde y deja de preguntar “¿dónde lo anotamos?”. Vos ganás control sin complicarte la vida.',
    includes: [
      'Pantallas simples para lo que usás todos los días',
      'Menos dependencia de una sola persona que “sabe cómo es”',
      'Reportes básicos para cerrar el día o la semana',
      'Se construye por etapas: primero lo urgente',
    ],
    from: 1800,
    demo: '/demo/gastronomia',
    cta: '/cotizar',
  },
]

export const DEMO_CATALOG = [
  {
    slug: 'gastronomia',
    title: 'Sistema de gestión gastronómica',
    subtitle: 'Mesas, comandas y cierre de cuenta',
    filter: 'sistemas',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=900&q=80',
    blurb: 'Demo del panel de salón: libre / ocupada / cuenta, menú y totales.',
  },
  {
    slug: 'perfumeria',
    title: 'Tienda online para perfumería',
    subtitle: 'Catálogo, filtros y carrito',
    filter: 'ecommerce',
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=80',
    blurb: 'Navegá por familia olfativa y armá el carrito. Datos de muestra.',
  },
  {
    slug: 'velas',
    title: 'E-commerce para marca de velas',
    subtitle: 'Aromas, filtros y compra simple',
    filter: 'ecommerce',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=900&q=80',
    blurb: 'Vitrina de producto físico con carrito. Caso anonimizado.',
  },
]

export const PROCESS_STEPS = [
  { step: '01', title: 'Primer contacto', text: 'Brief o WhatsApp. Entiendo el negocio y el objetivo real.' },
  { step: '02', title: 'Propuesta', text: 'Alcance, plazos y precio en claro. Sin letra chica.' },
  { step: '03', title: 'Construcción', text: 'Entregas por etapas: primero lo que vende u ordena.' },
  { step: '04', title: 'Publicación', text: 'Salimos al aire, te dejo cómo usarlo y un plan de cuidado si hace falta.' },
]
