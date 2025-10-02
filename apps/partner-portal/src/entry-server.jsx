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
    
    // For development, let's use a simple approach
    // Return empty HTML to let client-side rendering handle everything
    const head = `
      <title>GrubGate Partner Portal</title>
      <meta name="description" content="Restaurant management dashboard for GrubGate partners" />
    `

    return { 
      html: '', // Empty for CSR
      head 
    }
    
  } catch (error) {
    console.error('SSR Error:', error)
    return {
      html: '',
      head: '<title>GrubGate Partner Portal</title>'
    }
  }
}
