/**
 * Checklist de arranque post-aceptación.
 * Los `id` deben coincidir con backend/utils/kickoff.js
 */
export const KICKOFF_ITEMS = [
  { id: 'deposit', label: 'Anticipo / seña (40%) confirmada', owner: 'both' },
  { id: 'scope', label: 'Propuesta y alcance aceptados', owner: 'both' },
  { id: 'onboarding', label: 'Onboarding enviado', owner: 'client' },
  { id: 'approver', label: 'Quién aprueba cambios definido', owner: 'client' },
  { id: 'billing', label: 'Datos de facturación recibidos', owner: 'client' },
  { id: 'domain', label: 'Dominio resuelto (cuenta del cliente)', owner: 'client' },
  { id: 'hosting', label: 'Hosting definido (cuenta del cliente)', owner: 'client' },
  { id: 'brand', label: 'Logo / marca listos o fecha comprometida', owner: 'client' },
  { id: 'content', label: 'Textos / fotos base o fecha comprometida', owner: 'client' },
  { id: 'accesses', label: 'Accesos compartidos (sin contraseñas en claro)', owner: 'client' },
  { id: 'start_date', label: 'Fecha de inicio confirmada', owner: 'both' },
]

export const KICKOFF_OWNER_LABEL = {
  client: 'Cliente',
  both: 'Ambos',
  studio: 'GB.Dev',
}
