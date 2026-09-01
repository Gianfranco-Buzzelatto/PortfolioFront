/** A4 width at 96dpi — keeps layout identical across viewports */
const A4_WIDTH_PX = 794

/**
 * Uniform reserved bands (mm). Content never paints into these zones.
 * Page 1 uses the full header/footer; later pages use a compact logo-only chrome
 * inside the same reserved space so nothing gets covered.
 */
const HEADER_MARGIN_MM = 26
const FOOTER_MARGIN_MM = 14

const BRAND_RED = [232, 20, 30]
const BRAND_BLACK = [15, 15, 15]

export function pdfFilename(prefix, name) {
  const safe = String(name || 'documento')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return `${prefix}-${safe || 'GBDev'}.pdf`
}

async function waitForAssets(root) {
  try {
    if (document.fonts?.ready) await document.fonts.ready
  } catch { /* ignore */ }

  const imgs = [...root.querySelectorAll('img')]
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = img.onerror = () => res()
              setTimeout(res, 1200)
            }),
    ),
  )

  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
}

function textOf(el, sel) {
  return el?.querySelector(sel)?.textContent?.trim() || ''
}

function extractChrome(capture) {
  const header = capture.querySelector('.header-main')
  const footer = capture.querySelector('.footer-bar')
  const contactNode = footer?.querySelector('.footer-contact')

  const meta = {
    brandSub: textOf(header, '.brand-sub') || 'Desarrollador Web Full Stack',
    docLabel: textOf(header, '.doc-label') || 'Documento',
    docDate: textOf(header, '.doc-date') || '',
    docNum: textOf(header, '.doc-num') || '',
    footerBrand: textOf(footer, '.footer-brand') || 'GB.Dev',
    contactLines: contactNode
      ? (contactNode.innerHTML || '')
          .split(/<br\s*\/?>/i)
          .map((s) => s.replace(/<[^>]+>/g, '').trim())
          .filter(Boolean)
      : [],
  }

  header?.remove()
  capture.querySelector('.accent-bar')?.remove()
  footer?.remove()

  return meta
}

function drawBrandLogo(pdf, x, y, fontSize = 14) {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(fontSize)
  pdf.setTextColor(255, 255, 255)
  pdf.text('GB', x, y)
  const gbW = pdf.getTextWidth('GB')
  pdf.setTextColor(...BRAND_RED)
  pdf.text('.', x + gbW * 0.98, y)
  const dotW = pdf.getTextWidth('.')
  pdf.setTextColor(255, 255, 255)
  pdf.text('Dev', x + gbW + dotW, y)
}

function stampHeader(pdf, pageIndex, meta) {
  const pageW = pdf.internal.pageSize.getWidth()
  const isFirst = pageIndex === 1
  // Same bar height on every page (= reserved top margin minus accent), so content never collides
  const barH = 22
  const accentH = 1.2

  pdf.setFillColor(...BRAND_BLACK)
  pdf.rect(0, 0, pageW, barH, 'F')
  pdf.setFillColor(...BRAND_RED)
  pdf.rect(0, barH, pageW, accentH, 'F')

  if (isFirst) {
    drawBrandLogo(pdf, 12, 10, 14)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    pdf.setTextColor(170, 170, 170)
    const sub = (meta.brandSub || '').toUpperCase()
    if (sub) pdf.text(sub, 12, 16)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(170, 170, 170)
    pdf.text((meta.docLabel || '').toUpperCase(), pageW - 12, 8, { align: 'right' })

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(210, 210, 210)
    if (meta.docDate) pdf.text(meta.docDate, pageW - 12, 13.5, { align: 'right' })

    pdf.setFontSize(8)
    pdf.setTextColor(140, 140, 140)
    if (meta.docNum) pdf.text(meta.docNum, pageW - 12, 18.5, { align: 'right' })
  } else {
    // Later pages: same chrome band, logo only (no doc meta)
    drawBrandLogo(pdf, 12, 13.5, 13)
  }
}

function stampFooter(pdf, pageIndex, total, meta) {
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const isFirst = pageIndex === 1
  const yLine = pageH - 10
  const yText = pageH - 5.5

  pdf.setDrawColor(239, 239, 239)
  pdf.setLineWidth(0.25)
  pdf.line(10, yLine, pageW - 10, yLine)

  if (isFirst) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(...BRAND_BLACK)
    // Render "GB.Dev — Name" with red dot approximation via plain text (helvetica can't color mid-string easily)
    pdf.text(meta.footerBrand || 'GB.Dev', 12, yText)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    const right = (meta.contactLines || []).filter(Boolean).join('  ·  ')
    if (right) pdf.text(right, pageW - 12, yText, { align: 'right' })
  } else {
    drawBrandLogoCompactFooter(pdf, 12, yText)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text(`${pageIndex} / ${total}`, pageW - 12, yText, { align: 'right' })
  }
}

/** Compact footer brand in black (not on dark bar) */
function drawBrandLogoCompactFooter(pdf, x, y) {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(...BRAND_BLACK)
  pdf.text('GB', x, y)
  const gbW = pdf.getTextWidth('GB')
  pdf.setTextColor(...BRAND_RED)
  pdf.text('.', x + gbW * 0.98, y)
  const dotW = pdf.getTextWidth('.')
  pdf.setTextColor(...BRAND_BLACK)
  pdf.text('Dev', x + gbW + dotW, y)
}

function stampChrome(pdf, meta) {
  const total = pdf.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i)
    stampHeader(pdf, i, meta)
    stampFooter(pdf, i, total, meta)
  }
}

const FORBIDDEN_TAGS = 'script,iframe,object,embed,base,form,link,meta,svg,math'
const SAFE_URL = /^(https?:|data:image\/|blob:|#|\/|\.)/i

/**
 * Defensa en profundidad sobre el escapado de las plantillas: el HTML se monta
 * en el documento real para capturarlo, así que cualquier resto de markup
 * ejecutable (onerror, onload, src raros) se elimina antes de tocar el DOM.
 */
function scrubDocument(doc) {
  doc.querySelectorAll(FORBIDDEN_TAGS).forEach((node) => node.remove())

  doc.querySelectorAll('*').forEach((node) => {
    for (const attr of [...node.attributes]) {
      const name = attr.name.toLowerCase()
      if (name.startsWith('on')) {
        node.removeAttribute(attr.name)
      } else if ((name === 'src' || name === 'href' || name === 'xlink:href') && !SAFE_URL.test(attr.value.trim())) {
        node.removeAttribute(attr.name)
      }
    }
  })

  return doc
}

/**
 * Mount PDF HTML in the parent document, strip flowing header/footer,
 * render body at fixed A4 width, then stamp chrome on every page
 * (full on page 1, logo-only on the rest) inside reserved margins.
 */
export async function downloadHtmlAsPdf(html, filename) {
  const html2pdf = (await import('html2pdf.js')).default
  const parsed = scrubDocument(new DOMParser().parseFromString(String(html), 'text/html'))

  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.className = 'gbdev-pdf-host'
  host.style.cssText = [
    'position:fixed',
    'left:-10000px',
    'top:0',
    `width:${A4_WIDTH_PX}px`,
    'margin:0',
    'padding:0',
    'overflow:visible',
    'opacity:0',
    'pointer-events:none',
    'z-index:-1',
  ].join(';')

  const capture = document.createElement('div')
  capture.className = 'gbdev-pdf-capture'
  capture.style.cssText = [
    `width:${A4_WIDTH_PX}px`,
    `max-width:${A4_WIDTH_PX}px`,
    'margin:0',
    'padding:0',
    'background:#ffffff',
    'overflow:visible',
  ].join(';')

  for (const style of parsed.querySelectorAll('style')) {
    capture.appendChild(document.importNode(style, true))
  }
  const root = parsed.querySelector('.pdf-root') || parsed.body
  capture.appendChild(document.importNode(root, true))

  const meta = extractChrome(capture)

  host.appendChild(capture)
  document.body.appendChild(host)

  await waitForAssets(capture)
  await new Promise((r) => setTimeout(r, 250))

  const file = filename.endsWith('.pdf') ? filename : `${filename}.pdf`

  try {
    const worker = html2pdf()
      .set({
        margin: [HEADER_MARGIN_MM, 0, FOOTER_MARGIN_MM, 0],
        filename: file,
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
          windowWidth: A4_WIDTH_PX,
          width: A4_WIDTH_PX,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: [
            '.avoid-break',
            '.plan-card',
            '.term-item',
            '.highlight-box',
            '.care',
            '.info-grid',
            '.signature-row',
            '.section-title',
            '.rec-box h3',
            '.rec-box h4',
            'h3',
            'h4',
            'img',
          ],
        },
      })
      .from(capture)

    const pdf = await worker.toPdf().get('pdf')
    stampChrome(pdf, meta)
    pdf.save(file)
  } finally {
    host.remove()
  }
}
