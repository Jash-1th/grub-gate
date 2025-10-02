import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { I18nextProvider } from 'react-i18next'
import i18n from './config/i18n.js'
import App from './App.jsx'
import { generateSEOMeta, generateStructuredData } from './utils/seo.js'

// Public routes that should be SSR
const publicRoutes = ['/', '/login', '/register', '/forgot-password']

export async function render(url, manifest) {
  // Normalize the URL - ensure it starts with / and handle empty string
  const normalizedUrl = url === '' ? '/' : url
  const isPublicRoute = publicRoutes.includes(normalizedUrl)
  
  if (!isPublicRoute) {
    // For dashboard routes, return minimal HTML (CSR)
    return {
      html: '',
      head: ''
    }
  }

  try {
    // Ensure i18n is ready for SSR
    if (!i18n.isInitialized) {
      await i18n.init()
    }

    // For public routes, do SSR
    const html = renderToString(
      <I18nextProvider i18n={i18n}>
        <StaticRouter location={normalizedUrl}>
          <App />
        </StaticRouter>
      </I18nextProvider>
    )

    // Generate SEO meta tags
    const seoData = generateSEOMeta(normalizedUrl === '/' ? 'home' : normalizedUrl.slice(1), {})
    const structuredData = generateStructuredData(normalizedUrl === '/' ? 'home' : normalizedUrl.slice(1), {})
    
    const head = `
      <title>${seoData.title}</title>
      <meta name="description" content="${seoData.description}" />
      <meta name="keywords" content="${seoData.keywords}" />
      <link rel="canonical" href="${seoData.canonical}" />
      
      <!-- Open Graph -->
      <meta property="og:title" content="${seoData.ogTitle}" />
      <meta property="og:description" content="${seoData.ogDescription}" />
      <meta property="og:url" content="${seoData.canonical}" />
      
      <!-- Twitter Card -->
      <meta name="twitter:title" content="${seoData.ogTitle}" />
      <meta name="twitter:description" content="${seoData.ogDescription}" />
      
      ${structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : ''}
    `

    return { html, head }
    
  } catch (error) {
    console.error('SSR Error:', error)
    return {
      html: '<div>SSR Error occurred</div>',
      head: ''
    }
  }
}
