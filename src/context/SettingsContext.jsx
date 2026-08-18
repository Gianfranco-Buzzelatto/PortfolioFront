import { createContext, useContext, useState, useEffect } from 'react'
import api from '../hooks/useApi'

const FALLBACK = {
  name: 'Gianfranco Buzzelatto',
  title: 'Desarrollador Web Full Stack',
  bio: 'Webs, tiendas online y sistemas a medida para que tu negocio venda mejor y opere con menos fricción.',
  email: 'gianbuzzelatto@gmail.com',
  phone: '+54 11 4160-9741',
  location: 'Buenos Aires, Argentina',
  github: 'https://github.com/Gianfranco-Buzzelatto',
  linkedin: 'https://www.linkedin.com/in/gianfranco-joel-buzzelatto-a0827a163/',
  heroTexts: [
    'Landing pages que convierten',
    'Tiendas online listas para vender',
    'Sistemas a medida para tu equipo',
  ],
  skills: ['React', 'Node.js', 'Express', 'MongoDB', 'APIs REST', 'E-commerce', 'Responsive'],
}

const SettingsContext = createContext(FALLBACK)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK)

  useEffect(() => {
    api
      .get('/settings')
      .then((r) => setSettings({ ...FALLBACK, ...r.data }))
      .catch(() => {})
  }, [])

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
