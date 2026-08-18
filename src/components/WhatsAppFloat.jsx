import { useSettings } from '../context/SettingsContext'
import { whatsappHref } from '../utils/whatsapp'
import './WhatsAppFloat.css'

export default function WhatsAppFloat() {
  const settings = useSettings()
  const href = whatsappHref(settings.phone)

  return (
    <a
      className="wa-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
    >
      <i className="fab fa-whatsapp" />
    </a>
  )
}
