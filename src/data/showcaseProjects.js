/**
 * Casos reales anonimizados (rubro, sin marca).
 * Datos inventados en demos — sin info privada del cliente.
 */
export const SHOWCASE_PROJECTS = [
  {
    _id: 'showcase-janz',
    slug: 'gestion-gastronomia',
    title: 'Sistema de gestión para hamburguesería',
    description:
      'El local operaba mesas, comandas y comunicación con el cliente en herramientas dispersas. Armé un sistema a medida con panel en tiempo real, reportes y aviso por WhatsApp para ordenar el salón y la cocina.',
    longDescription:
      'Panel unificado: mesas, comandas, cierre de caja, reportes y notificaciones. Pensado para que el equipo deje de depender de planillas y chats sueltos.',
    problem:
      'Mesas, comandas y avisos al cliente vivían en planillas, chats y cabeza del encargado. Difícil cerrar el día con números claros.',
    solution:
      'Un panel único para salón y cocina, con estados de mesa, comandas y cierre. Menos fricción operativa, más control.',
    outcomes: [
      { value: '1 panel', label: 'Salón + cocina' },
      { value: 'WhatsApp', label: 'Avisos al cliente' },
      { value: 'Caja', label: 'Cierre ordenado' },
    ],
    category: 'fullstack',
    technologies: ['React', 'Vite', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Cloudinary', 'WhatsApp'],
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    demoUrl: '/demo/gastronomia',
    liveUrl: '',
    githubUrl: '',
    featured: true,
  },
  {
    _id: 'showcase-toni',
    slug: 'tienda-perfumeria',
    title: 'Tienda online para perfumería',
    description:
      'La marca necesitaba vender 24/7 con catálogo claro y compra simple desde el celular. Desarrollé un e-commerce con carrito, panel admin y experiencia pensada para conversión en mobile.',
    longDescription:
      'Catálogo por familias, fichas de producto, carrito, checkout y administración de stock/productos. Integración de imágenes en la nube y paneles de seguimiento.',
    problem:
      'La venta dependía del local y de redes. Faltaba un catálogo claro y un checkout simple en el celular.',
    solution:
      'E-commerce con familias olfativas, carrito y panel para cargar productos e imágenes sin tocar código.',
    outcomes: [
      { value: '24/7', label: 'Vitrina online' },
      { value: 'Mobile', label: 'Compra simple' },
      { value: 'Admin', label: 'Stock y catálogo' },
    ],
    category: 'web',
    technologies: ['React', 'Vite', 'Tailwind', 'Zustand', 'React Query', 'Node.js', 'Express', 'MongoDB', 'Cloudinary', 'Socket.io'],
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    demoUrl: '/demo/perfumeria',
    liveUrl: '',
    githubUrl: '',
    featured: true,
  },
  {
    _id: 'showcase-simma',
    slug: 'ecommerce-velas',
    title: 'E-commerce y CRM para marca de velas',
    description:
      'La marca necesitaba vitrina online y orden interno (pedidos, clientes, catálogo). Entregué una plataforma con tienda + panel para operar el negocio sin perder el control del stock y las ventas.',
    longDescription:
      'Catálogo, carrito, gestión de pedidos y clientes, y generación de documentos. Stack MERN con panel admin y carga de imágenes.',
    problem:
      'Pedidos y clientes se mezclaban entre Instagram, Excel y memoria. Difícil escalar sin perder el control.',
    solution:
      'Tienda + panel: catálogo, pedidos, clientes y documentos. Una sola fuente de verdad para operar.',
    outcomes: [
      { value: 'Tienda', label: '+ panel interno' },
      { value: 'Pedidos', label: 'Trazables' },
      { value: 'PDF', label: 'Documentos' },
    ],
    category: 'fullstack',
    technologies: ['React', 'Vite', 'Tailwind', 'Node.js', 'Express', 'MongoDB', 'Cloudinary', 'PDF'],
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80',
    demoUrl: '/demo/velas',
    liveUrl: '',
    githubUrl: '',
    featured: true,
  },
  {
    _id: 'showcase-burgershop',
    slug: 'pedidos-hamburgueseria',
    title: 'Plataforma de pedidos para hamburguesería',
    description:
      'El negocio necesitaba tomar pedidos online con seguimiento en vivo y panel operativo. Armé una plataforma PWA con carrito, tiempo real y métricas para cocina y mostrador.',
    longDescription:
      'Pedidos online, estados en tiempo real (Socket.io), panel con métricas, autenticación y carga de medios. Enfoque mobile-first y listo para instalar como app.',
    problem:
      'Los pedidos llegaban por WhatsApp sin cola ni estados. Cocina y mostrador no veían lo mismo.',
    solution:
      'PWA de pedidos con carrito, estados en vivo y métricas del turno para cocina y mostrador.',
    outcomes: [
      { value: 'PWA', label: 'Como app' },
      { value: 'En vivo', label: 'Estados' },
      { value: 'Métricas', label: 'Del turno' },
    ],
    category: 'fullstack',
    technologies: ['React', 'Vite', 'Tailwind', 'Zustand', 'React Query', 'PWA', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Cloudinary'],
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    demoUrl: '/demo/gastronomia',
    liveUrl: '',
    githubUrl: '',
    featured: true,
  },
]

export const DEMO_SLUGS = ['gastronomia', 'perfumeria', 'velas']

export function getProjectSlug(project) {
  if (!project) return ''
  if (project.slug) return project.slug
  const id = String(project._id || '')
  if (id.startsWith('showcase-')) return id.replace('showcase-', '')
  return id
}

export function findShowcaseBySlug(slug) {
  return SHOWCASE_PROJECTS.find((p) => getProjectSlug(p) === slug) || null
}
