// Netlify Serverless Function for GrubGate Partner Portal SSR
const fs = require('fs');
const path = require('path');

// Simple cached template - avoid complex operations that could timeout
let cachedTemplate = null;

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

// Ultra-simple handler to prevent timeouts
exports.handler = async (event, context) => {
  try {
    const { path: urlPath = '/' } = event;
    
    // Don't handle static assets - let Netlify serve them directly
    if (urlPath.match(/\.(js|jsx|ts|tsx|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|map)$/) || 
        urlPath.startsWith('/assets/') || 
        urlPath.startsWith('/api/') || 
        urlPath.startsWith('/.netlify/')) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Not found'
      };
    }

    // Try to read the built HTML template quickly
    if (!cachedTemplate) {
      try {
        const templatePath = path.join(__dirname, 'index.html');
        if (fs.existsSync(templatePath)) {
          cachedTemplate = fs.readFileSync(templatePath, 'utf8');
        }
      } catch (err) {
        // Ignore errors, use fallback
      }
    }

    // If we have the template, use it
    if (cachedTemplate) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: cachedTemplate
      };
    }

    // Extract asset names from the built index.html file
    let cssFile = '/assets/index-DKLhbucu.css';  // Updated to current build
    let jsFile = '/assets/index-DHQ066yb.js';    // Updated to current build
    
    try {
      // Try to extract asset names from the built index.html
      const indexPath = path.join(__dirname, 'index.html');
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        
        // Extract CSS file from link tag
        const cssMatch = indexContent.match(/href="([^"]*\.css)"/);
        if (cssMatch) cssFile = cssMatch[1];
        
        // Extract JS file from script tag
        const jsMatch = indexContent.match(/src="([^"]*\.js)"/);
        if (jsMatch) jsFile = jsMatch[1];
        
        console.log('✅ Extracted assets from index.html:', { cssFile, jsFile });
      }
    } catch (err) {
      console.log('⚠️ Could not extract assets from index.html, using fallback:', err.message);
    }
    
    // Ultra-simple fallback HTML - no complex operations
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GrubGate Partner Portal</title>
  <meta name="theme-color" content="#800020" />
  <link rel="icon" type="image/png" href="/icons/Logo.png" />
  <link rel="manifest" href="/manifest.json" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
    .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: white; z-index: 9999; }
    .logo { width: 60px; height: 60px; background: #800020; border-radius: 12px; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; margin-bottom: 16px; }
    .loading.hidden { display: none; }
  </style>
</head>
<body>
  <div class="loading">
    <div class="logo">G</div>
    <h1>GrubGate Partner Portal</h1>
    <p>Loading...</p>
  </div>
  <div id="root"></div>
  <link rel="stylesheet" href="${cssFile}" />
  <script type="module" src="${jsFile}"></script>
  <script>
    // Hide loading screen when React app mounts
    const observer = new MutationObserver(() => {
      const root = document.getElementById('root');
      if (root && root.children.length > 0) {
        const loading = document.querySelector('.loading');
        if (loading) {
          loading.classList.add('hidden');
        }
        observer.disconnect();
      }
    });
    observer.observe(document.getElementById('root'), { childList: true });
    
    // Fallback: hide loading after 3 seconds
    setTimeout(() => {
      const loading = document.querySelector('.loading');
      if (loading) loading.classList.add('hidden');
    }, 3000);
  </script>
</body>
</html>`;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: html
    };
    
  } catch (error) {
    console.error('❌ SSR Error:', error);
    
    // Ultra-minimal fallback with current asset names
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: `<!DOCTYPE html>
<html><head><title>GrubGate</title><link rel="stylesheet" href="/assets/index-DKLhbucu.css" /></head>
<body><div id="root"></div>
<script type="module" src="/assets/index-DHQ066yb.js"></script>
</body></html>`
    };
  }
};





