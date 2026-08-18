import { CARE_PLANS, getCategory } from './quoteCatalog2026'

export const TIER_KEYS = ['base', 'media', 'premium']

export const CARE_PLAN = {
  name: 'Cuidado del sitio',
  tier: 'intermedio',
  price: CARE_PLANS.intermedio.price,
  minMonths: 3,
  includes: CARE_PLANS.intermedio.includes,
}

export const TIER_META = {
  base: {
    key: 'base',
    label: 'Básico',
    tagline: 'Lo esencial para arrancar bien',
    revisions: 2,
  },
  media: {
    key: 'media',
    label: 'Intermedio',
    tagline: 'El equilibrio ideal para la mayoría',
    revisions: 3,
    recommended: true,
  },
  premium: {
    key: 'premium',
    label: 'Premium',
    tagline: 'Máximo alcance y funcionalidad',
    revisions: 4,
  },
}

export function findCatalogItem(catalog, name) {
  for (const [category, items] of Object.entries(catalog)) {
    const item = items.find((i) => i.name === name)
    if (item) return { name: item.name, price: item.price, category }
  }
  return null
}

export function featuresFromNames(catalog, names) {
  return names.map((name) => findCatalogItem(catalog, name)).filter(Boolean)
}

export function buildDefaultPlans(categoryKey = 'landing') {
  const cat = getCategory(categoryKey)
  const plans = {}

  TIER_KEYS.forEach((tierKey) => {
    const tier = cat.tiers[tierKey]
    const meta = TIER_META[tierKey]
    plans[tierKey] = {
      features: tier.includes.map((name) => ({
        name,
        price: 0,
        category: cat.label,
      })),
      customFeatures: [],
      fixedPrice: tier.price,
      priceRange: tier.priceRange,
      deadline: tier.deadline,
      revisions: tier.revisions ?? meta.revisions,
    }
  })

  return plans
}

export function emptyPlans(categoryKey = 'landing') {
  const defaults = buildDefaultPlans(categoryKey)
  return {
    base: { ...defaults.base },
    media: { ...defaults.media },
    premium: { ...defaults.premium },
  }
}

/** Compat: premiumType viejo → categoría nueva */
export function premiumTypeToCategory(premiumType) {
  if (premiumType === 'sistema') return 'sistema'
  if (premiumType === 'pedidos') return 'pedidos'
  if (premiumType === 'tienda') return 'ecommerce'
  return null
}

export function resolveCategory(lead = {}) {
  if (lead.projectCategory && getCategory(lead.projectCategory)) {
    return lead.projectCategory
  }
  const mapped = premiumTypeToCategory(lead.premiumType)
  if (mapped) return mapped
  return 'landing'
}
