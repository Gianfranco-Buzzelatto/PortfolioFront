import { Navigate, useParams } from 'react-router-dom'
import GastronomiaDemo from './GastronomiaDemo'
import PerfumeriaDemo from './PerfumeriaDemo'
import VelasDemo from './VelasDemo'

const DEMOS = {
  gastronomia: GastronomiaDemo,
  perfumeria: PerfumeriaDemo,
  velas: VelasDemo,
  metalurgica: VelasDemo, // compat: la demo vieja ahora apunta a velas
}

export default function ProjectDemo() {
  const { slug } = useParams()
  const Demo = DEMOS[slug]
  if (!Demo) return <Navigate to="/proyectos" replace />
  return <Demo />
}
