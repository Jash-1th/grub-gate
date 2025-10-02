import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { I18nextProvider } from 'react-i18next'
import i18n from './config/i18n.js'
import App from './App.jsx'
import { generateSEOMeta, generateStructuredData } from './utils/seo.js'

// Routes that should get full SSR treatment
const seoImportantRoutes = ['/', '/login', '/register', '/forgot-password']

export async function render(url, manifest) {
  // Normalize the URL - ensure it starts with / and handle empty string
  const normalizedUrl = url === '' ? '/' : url
  const isSEORoute = seoImportantRoutes.includes(normalizedUrl)
  
  // Always render something for all routes to prevent 404s
  // For non-SEO routes, we'll render a minimal shell

  try {
    // Ensure i18n is ready for SSR
    if (!i18n.isInitialized) {
      await i18n.init()
    }

    // Always render the app for all routes
    const html = renderToString(
      <I18nextProvider i18n={i18n}>
        <StaticRouter location={normalizedUrl}>
          <App />
        </StaticRouter>
      </I18nextProvider>
    )

    // Generate appropriate meta tags
    let head = ''
    
    if (isSEORoute) {
      // Full SEO treatment for important routes
      const seoData = generateSEOMeta(normalizedUrl === '/' ? 'home' : normalizedUrl.slice(1), {})
      const structuredData = generateStructuredData(normalizedUrl === '/' ? 'home' : normalizedUrl.slice(1), {})
      
      head = `
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
    } else {
      // Basic meta tags for dashboard routes
      head = `
        <title>GrubGate Partner Portal</title>
        <meta name="description" content="Restaurant management dashboard for GrubGate partners" />
        <meta name="robots" content="noindex, nofollow" />
      `
    }

    return { html, head }
    
  } catch (error) {
    console.error('SSR Error:', error)
    return {
      html: '<div>SSR Error occurred</div>',
      head: ''
    }
  }
}
