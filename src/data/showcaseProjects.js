/**
 * Casos reales orientados a negocio (problema → solución).
 * Se usan en Home y como respaldo en /proyectos si la API no devuelve datos.
 */
export const SHOWCASE_PROJECTS = [
  {
    _id: 'showcase-gastronomia',
    title: 'Sistema de gestión gastronómica',
    description:
      'El local manejaba pedidos y cuentas con herramientas dispersas y mucho margen de error. Centralicé mesas, pedidos y flujo de caja en un sistema a medida para que el equipo trabaje más rápido y con números claros.',
    category: 'fullstack',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
    imageUrl: '',
    liveUrl: '',
    githubUrl: '',
    featured: true,
  },
  {
    _id: 'showcase-perfumeria',
    title: 'Tienda online para perfumería',
    description:
      'La marca necesitaba vender 24/7 con una vitrina ordenada y una compra simple en celular. Desarrollé un e-commerce enfocado en catálogo, confianza y checkout claro para aumentar conversiones sin fricción.',
    category: 'web',
    technologies: ['React', 'Node.js', 'MongoDB', 'E-commerce'],
    imageUrl: '',
    liveUrl: '',
    githubUrl: '',
    featured: true,
  },
  {
    _id: 'showcase-metalurgica',
    title: 'Web institucional para metalúrgica',
    description:
      'La empresa requería transmitir solidez y servicios industriales a nuevos clientes B2B. Entregué un sitio institucional rápido, con propuesta de valor explícita y contacto directo al área comercial.',
    category: 'web',
    technologies: ['React', 'Responsive', 'Performance', 'Formularios de contacto'],
    imageUrl: '',
    liveUrl: '',
    githubUrl: '',
    featured: true,
  },
]
