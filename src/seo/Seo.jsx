import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  OG_LOCALE,
  SITE_NAME,
  absoluteUrl,
  canonicalUrl,
} from './site'

const SCRIPT_ATTR = 'data-gbdev-jsonld'

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  robots,
  jsonLd,
  noindex = false,
}) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE
  const url = canonicalUrl(path)
  const imageUrl = absoluteUrl(image)
  const robotsContent = noindex ? 'noindex, nofollow' : robots || 'index, follow'
  const payloads = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : jsonLd ? [jsonLd] : []
  const serialized = JSON.stringify(payloads)

  useEffect(() => {
    const list = JSON.parse(serialized)
    document.querySelectorAll(`script[${SCRIPT_ATTR}]`).forEach((node) => node.remove())
    list.forEach((data) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute(SCRIPT_ATTR, 'true')
      script.textContent = JSON.stringify(data)
      document.head.appendChild(script)
    })
    return () => {
      document.querySelectorAll(`script[${SCRIPT_ATTR}]`).forEach((node) => node.remove())
    }
  }, [serialized])

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:locale" content={OG_LOCALE} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  )
}
