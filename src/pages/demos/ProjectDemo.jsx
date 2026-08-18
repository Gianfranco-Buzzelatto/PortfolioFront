import { Navigate, useParams } from 'react-router-dom'
import GastronomiaDemo from './GastronomiaDemo'
import PerfumeriaDemo from './PerfumeriaDemo'
import MetalurgicaDemo from './MetalurgicaDemo'

const DEMOS = {
  gastronomia: GastronomiaDemo,
  perfumeria: PerfumeriaDemo,
  metalurgica: MetalurgicaDemo,
}

export default function ProjectDemo() {
  const { slug } = useParams()
  const Demo = DEMOS[slug]
  if (!Demo) return <Navigate to="/proyectos" replace />
  return <Demo />
}
