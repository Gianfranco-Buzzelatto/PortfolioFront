import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { launch } from 'puppeteer-core'
import { buildQuoteHTML } from '../src/utils/quotePDF.js'
import {
  buildBriefHTML,
  buildAgreementHTML,
  buildRevisionsHTML,
  buildDeliveryHTML,
  buildUserGuideHTML,
  buildMaintenanceHTML,
} from '../src/utils/documentPDF.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../public/docs/muestras')

const settings = {
  name: 'Gianfranco Buzzelatto',
  title: 'Desarrollador Web Full Stack',
  email: 'gianbuzzelatto@gmail.com',
  location: 'Buenos Aires, Argentina',
}

const quote = {
  clientName: 'Metalúrgica Demo',
  email: 'hola@metalurgica-demo.com',
  whatsapp: '+54 11 4160-9741',
  projectType: 'Sitio corporativo',
  projectName: 'Web institucional Metalúrgica Demo',
  description: 'Necesitamos una web clara para mostrar catálogo, pedir presupuesto y que WhatsApp sea el canal principal.',
  budget: 'USD 1.000–2.000',
  deadline: 25,
  revisions: 3,
  currency: 'USD',
  exchangeRate: 1,
  selectedPlan: 'media',
  projectCategory: 'institucional',
  carePlan: { included: true, tier: 'intermedio', price: 55, minMonths: 3 },
  adminNotes: 'Prioridad: confianza y pedidos por WhatsApp.',
  plans: [
    { key: 'base', label: 'Básico', finalPrice: 480, deadline: 18, revisions: 2, features: [{ name: 'Home + contacto' }, { name: 'WhatsApp' }] },
    { key: 'media', label: 'Intermedio', finalPrice: 890, deadline: 25, revisions: 3, features: [{ name: 'Home + contacto' }, { name: 'WhatsApp' }, { name: 'Catálogo' }, { name: 'Panel básico' }] },
    { key: 'premium', label: 'Premium', finalPrice: 1420, deadline: 35, revisions: 4, features: [{ name: 'Home + contacto' }, { name: 'WhatsApp' }, { name: 'Catálogo' }, { name: 'Panel básico' }, { name: 'Presupuestos' }] },
  ],
  features: [
    { name: 'Home + contacto', price: 180, category: 'Web' },
    { name: 'Catálogo', price: 220, category: 'Web' },
    { name: 'WhatsApp', price: 80, category: 'Integraciones' },
  ],
  finalPrice: 890,
}

const client = {
  clientName: 'Metalúrgica Demo',
  email: 'hola@metalurgica-demo.com',
  projectType: 'Sitio corporativo',
  projectName: 'Web institucional Metalúrgica Demo',
  tech: 'React · Node · MongoDB',
  finalPrice: 890,
  currency: 'USD',
  deadline: 25,
  revisions: 3,
  revisionsUsed: 2,
  stagingUrl: 'https://staging.metalurgica-demo.com',
  productionUrl: 'https://www.metalurgica-demo.com',
  adminUrl: 'https://www.metalurgica-demo.com/admin',
}

const revisions = [
  { description: 'Cambiar el hero de inicio por foto de planta', status: 'aprobado' },
  { description: 'Agregar filtro de productos por espesor', status: 'fuera-de-alcance' },
  { description: 'Corregir teléfono en el pie', status: 'pendiente' },
]

const carePlan = {
  price: 55,
  includes: [
    'Backups y actualización de dependencias',
    'Monitoreo de disponibilidad',
    'Hasta 3 cambios chicos al mes',
    'Hosting, dominio y base de datos incluidos',
  ],
}

async function chrome() {
  const candidates = [
    { channel: 'chrome' },
    { channel: 'msedge' },
    { executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
    { executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' },
  ]
  for (const opts of candidates) {
    try {
      return await launch({ ...opts, headless: true })
    } catch {
      /* try next */
    }
  }
  throw new Error('No encontré Chrome ni Edge para generar los PDF.')
}

async function htmlToPdf(browser, html, file) {
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 45000 })
  await page.pdf({
    path: file,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })
  await page.close()
}

const docs = [
  ['01-cotizacion.pdf', buildQuoteHTML(quote, settings)],
  ['02-brief.pdf', buildBriefHTML(quote, settings)],
  ['03-acuerdo.pdf', buildAgreementHTML(quote, settings)],
  ['04-revisiones.pdf', buildRevisionsHTML(client, revisions, settings)],
  ['05-entrega.pdf', buildDeliveryHTML(client, settings)],
  ['06-guia.pdf', buildUserGuideHTML(client, settings)],
  ['07-mantenimiento.pdf', buildMaintenanceHTML(client, carePlan, settings)],
]

fs.mkdirSync(outDir, { recursive: true })
const browser = await chrome()
try {
  for (const [name, html] of docs) {
    const file = path.join(outDir, name)
    await htmlToPdf(browser, html, file)
    console.log('OK', name)
  }
} finally {
  await browser.close()
}

console.log(`Listos en ${outDir}`)
