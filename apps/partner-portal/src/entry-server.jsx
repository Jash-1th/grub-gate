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
  
  try {
    console.log('Rendering SSR for URL:', normalizedUrl)
    
    // Initialize i18n for SSR
    await i18n.init()
    
    // Create the React app with StaticRouter for SSR
    const app = (
      <I18nextProvider i18n={i18n}>
        <StaticRouter location={normalizedUrl}>
          <App />
        </StaticRouter>
      </I18nextProvider>
    )
    
    // Render React components to HTML string
    const html = renderToString(app)
    console.log('SSR rendered HTML length:', html.length)
    
    // Generate SEO meta tags based on the route
    const seoMeta = generateSEOMeta(normalizedUrl)
    const structuredData = generateStructuredData(normalizedUrl)
    
    const head = `
      <title>${seoMeta.title}</title>
      <meta name="description" content="${seoMeta.description}" />
      <meta name="keywords" content="${seoMeta.keywords}" />
      
      <!-- Open Graph -->
      <meta property="og:title" content="${seoMeta.title}" />
      <meta property="og:description" content="${seoMeta.description}" />
      <meta property="og:image" content="${seoMeta.image}" />
      <meta property="og:url" content="https://partners.grubgate.app${normalizedUrl}" />
      
      <!-- Twitter Card -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${seoMeta.title}" />
      <meta name="twitter:description" content="${seoMeta.description}" />
      <meta name="twitter:image" content="${seoMeta.image}" />
      
      <!-- Structured Data -->
      <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
    `

    return { 
      html, // Actual rendered React HTML
      head 
    }
    
  } catch (error) {
    console.error('SSR Error:', error)
    
    // Fallback to CSR on error
    return {
      html: `<div class="ssr-error">
        <p>Loading GrubGate Partner Portal...</p>
        <p style="font-size: 12px; color: #666;">SSR Error: ${error.message}</p>
      </div>`,
      head: '<title>GrubGate Partner Portal</title>'
    }
  }
}
