// Netlify Edge Function for GrubGate Partner Portal SSR
import { renderToString } from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { I18nextProvider } from 'react-i18next';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the SSR entry point
let App;
let i18n;

try {
  // Try to import the SSR build
  const ssrModule = await import('../../dist/server/main.ssr.js');
  App = ssrModule.default;
  i18n = ssrModule.i18n;
} catch (error) {
  console.error('Failed to load SSR module:', error);
  // Fallback to client-side rendering
  App = null;
  i18n = null;
}

// Read the HTML template
const getHTMLTemplate = () => {
  try {
    const templatePath = path.join(__dirname, '../../dist/client/index.html');
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error('Failed to read HTML template:', error);
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>GrubGate Partner Portal</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/entry-client.jsx"></script>
        </body>
      </html>
    `;
  }
};

// Generate meta tags for SEO
const generateMetaTags = (url, userAgent) => {
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const baseUrl = 'https://partners.grubgate.app';
  const fullUrl = `${baseUrl}${url}`;
  
  // Default meta tags
  let title = 'GrubGate Partner Portal - Restaurant Management Platform';
  let description = 'Join Montreal\'s leading restaurant network and grow your business with predictable revenue through subscription meal plans.';
  let image = `${baseUrl}/icons/logo512.png`;
  
  // Route-specific meta tags
  if (url.includes('/dashboard')) {
    title = 'Dashboard - GrubGate Partner Portal';
    description = 'Manage your restaurant dashboard, view analytics, and track your performance with GrubGate.';
  } else if (url.includes('/menu')) {
    title = 'Menu Management - GrubGate Partner Portal';
    description = 'Create and manage your restaurant menu items and subscription meal plans.';
  } else if (url.includes('/orders')) {
    title = 'Order Management - GrubGate Partner Portal';
    description = 'View and manage customer orders, track delivery status, and handle order updates.';
  } else if (url.includes('/analytics')) {
    title = 'Analytics - GrubGate Partner Portal';
    description = 'Track your restaurant performance with detailed analytics and insights.';
  } else if (url.includes('/settings')) {
    title = 'Settings - GrubGate Partner Portal';
    description = 'Configure your restaurant settings, manage your profile, and update preferences.';
  }
  
  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="restaurant management, food delivery, meal subscription, business analytics, Montreal restaurants" />
    <meta name="author" content="GrubGate" />
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json" />
    
    <!-- Theme and Status Bar -->
    <meta name="theme-color" content="#800020" />
    <meta name="msapplication-TileColor" content="#800020" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="GrubGate Partners" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="GrubGate Partner Portal" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    
    <!-- Additional SEO Meta Tags -->
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow" />
    <link rel="canonical" href="${fullUrl}" />
    
    <!-- Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/icons/Logo.png" />
    <link rel="apple-touch-icon" href="/icons/Logo.png" />
  `;
};

// Main handler function
export default async (request, context) => {
  const { url, headers } = request;
  const userAgent = headers.get('user-agent') || '';
  const acceptLanguage = headers.get('accept-language') || 'en';
  
  console.log('SSR Handler - URL:', url);
  console.log('SSR Handler - User Agent:', userAgent);
  console.log('SSR Handler - Accept Language:', acceptLanguage);
  
  try {
    // Get the HTML template
    let html = getHTMLTemplate();
    
    // If SSR module is available, try to render
    if (App && i18n) {
      try {
        console.log('Attempting SSR render...');
        
        // Extract the pathname from the URL
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        // Render the app to string
        const appHtml = renderToString(
          React.createElement(I18nextProvider, { i18n },
            React.createElement(StaticRouter, { location: pathname },
              React.createElement(App)
            )
          )
        );
        
        // Replace the root div content
        html = html.replace(
          '<div id="root"><!--app-html--></div>',
          `<div id="root">${appHtml}</div>`
        );
        
        // Replace the head content with dynamic meta tags
        const metaTags = generateMetaTags(pathname, userAgent);
        html = html.replace('<!--app-head-->', metaTags);
        
        console.log('SSR render successful');
      } catch (ssrError) {
        console.error('SSR render failed, falling back to CSR:', ssrError);
        // Keep the original HTML for client-side rendering
      }
    } else {
      console.log('SSR module not available, using CSR fallback');
      // Replace the head content with dynamic meta tags
      const urlObj = new URL(url);
      const metaTags = generateMetaTags(urlObj.pathname, userAgent);
      html = html.replace('<!--app-head-->', metaTags);
    }
    
    // Return the HTML response
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-SSR': App ? 'true' : 'false',
        'X-Render-Time': new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('SSR handler error:', error);
    
    // Return a basic error page
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>GrubGate Partner Portal</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #800020; }
          </style>
        </head>
        <body>
          <h1 class="error">GrubGate Partner Portal</h1>
          <p>Loading your restaurant management platform...</p>
          <div id="root"></div>
          <script type="module" src="/src/entry-client.jsx"></script>
        </body>
      </html>
    `;
    
    return new Response(errorHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};




