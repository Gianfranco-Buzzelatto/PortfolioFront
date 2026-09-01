import { absoluteUrl, getSiteUrl } from './site'

export function personJsonLd(settings = {}) {
  const name = settings.name || 'Gianfranco Buzzelatto'
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: settings.title || 'Desarrollador Web Full Stack',
    url: getSiteUrl(),
    email: settings.email,
    telephone: settings.phone,
    image: absoluteUrl('/images/gianfranco-gbdev.png'),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Buenos Aires',
      addressCountry: 'AR',
    },
    sameAs: [settings.github, settings.linkedin].filter(Boolean),
  }
}

export function professionalServiceJsonLd(settings = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'GB.Dev',
    alternateName: 'Gianfranco Buzzelatto',
    description:
      'Desarrollo web para pymes: landings, e-commerce, plataformas de pedidos, turneros y sistemas a medida.',
    url: getSiteUrl(),
    image: absoluteUrl('/images/gianfranco-gbdev.png'),
    telephone: settings.phone,
    email: settings.email,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Buenos Aires, Argentina',
    },
    priceRange: 'USD 180–1800+',
    founder: {
      '@type': 'Person',
      name: settings.name || 'Gianfranco Buzzelatto',
    },
  }
}

export function faqJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
