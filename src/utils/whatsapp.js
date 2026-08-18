export function phoneDigits(phone) {
  const digits = String(phone || '').replace(/[^\d]/g, '')
  if (!digits) return '541141609741'
  if (digits.startsWith('54')) return digits
  if (digits.startsWith('11') && digits.length >= 10) return `54${digits}`
  return digits
}

export function whatsappHref(phone, message) {
  const text = encodeURIComponent(
    message || 'Hola Gianfranco, vi GB.Dev y quiero consultar por una web para mi negocio.'
  )
  return `https://wa.me/${phoneDigits(phone)}?text=${text}`
}
