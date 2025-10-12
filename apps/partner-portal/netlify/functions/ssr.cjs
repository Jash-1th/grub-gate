// Netlify Serverless Function for GrubGate Partner Portal SSR
const fs = require('fs');
const path = require('path');

// Cached template and manifest - avoid complex operations that could timeout
let cachedTemplate = null;
let cachedManifest = null;

// Load vite-manifest.json to get dynamic asset names
const loadManifest = () => {
  if (cachedManifest) return cachedManifest;
  
  try {
    const manifestPath = path.join(__dirname, 'vite-manifest.json');
    console.log('🔍 Looking for manifest at:', manifestPath);
    console.log('📁 Directory contents:', fs.readdirSync(__dirname));
    
    if (fs.existsSync(manifestPath)) {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      cachedManifest = JSON.parse(manifestContent);
      console.log('✅ Loaded vite-manifest.json successfully:', Object.keys(cachedManifest));
      return cachedManifest;
    } else {
      console.warn('⚠️ vite-manifest.json not found at:', manifestPath);
    }
  } catch (err) {
    console.warn('⚠️ Could not load vite-manifest.json:', err.message);
  }
  
  return null;
};

// Extract asset paths from Vite manifest
const getAssetPaths = () => {
  const manifest = loadManifest();
  
  if (!manifest) {
    console.warn('⚠️ No Vite manifest found, using fallback asset detection');
    return { cssFile: null, jsFile: null };
  }
  
  // Find the main entry point (usually index.html or src/main.jsx)
  let mainEntry = manifest['index.html'] || manifest['src/main.jsx'] || manifest['main.jsx'];
  
  // If no direct entry, find the first entry that has a file property
  if (!mainEntry) {
    const entries = Object.values(manifest);
    mainEntry = entries.find(entry => entry.isEntry && entry.file);
  }
  
  if (!mainEntry) {
    console.warn('⚠️ No main entry found in Vite manifest');
    return { cssFile: null, jsFile: null };
  }
  
  // Extract CSS and JS files from the entry
  const cssFile = mainEntry.css && mainEntry.css.length > 0 ? `/${mainEntry.css[0]}` : null;
  const jsFile = mainEntry.file ? `/${mainEntry.file}` : null;
  
  console.log('✅ Extracted assets from Vite manifest:', { cssFile, jsFile });
  return { cssFile, jsFile };
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

// Ultra-simple handler to prevent timeouts
exports.handler = async (event, context) => {
  try {
    const { path: urlPath = '/' } = event;
    
    // Don't handle static assets - let Netlify serve them directly
    if (urlPath.match(/\.(js|jsx|ts|tsx|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|map)$/) || 
        urlPath.startsWith('/assets/') || 
        urlPath.startsWith('/icons/') || 
        urlPath.startsWith('/images/') || 
        urlPath.startsWith('/manifest.json') || 
        urlPath.startsWith('/service-worker.js') || 
        urlPath.startsWith('/api/') || 
        urlPath.startsWith('/.netlify/')) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Static asset - should be handled by Netlify'
      };
    }

    // Try to read the built HTML template quickly
    if (!cachedTemplate) {
      try {
        const templatePath = path.join(__dirname, 'index.html');
        console.log('🔍 Looking for HTML template at:', templatePath);
        
        if (fs.existsSync(templatePath)) {
          cachedTemplate = fs.readFileSync(templatePath, 'utf8');
          console.log('✅ Loaded HTML template successfully, length:', cachedTemplate.length);
        } else {
          console.warn('⚠️ HTML template not found at:', templatePath);
        }
      } catch (err) {
        console.warn('⚠️ Could not load HTML template:', err.message);
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

    // Get dynamic asset paths from manifest
    let { cssFile, jsFile } = getAssetPaths();
    
    // Fallback: try to extract asset names from the built index.html file
    if (!cssFile || !jsFile) {
      console.log('⚠️ Manifest assets not found, trying HTML extraction fallback');
      try {
        const indexPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
          const indexContent = fs.readFileSync(indexPath, 'utf8');
          
          // Extract CSS file from link tag
          if (!cssFile) {
            const cssMatch = indexContent.match(/href="([^"]*\.css)"/);
            if (cssMatch) cssFile = cssMatch[1];
          }
          
          // Extract JS file from script tag
          if (!jsFile) {
            const jsMatch = indexContent.match(/src="([^"]*\.js)"/);
            if (jsMatch) jsFile = jsMatch[1];
          }
          
          console.log('✅ Extracted assets from index.html fallback:', { cssFile, jsFile });
        } else {
          console.log('⚠️ index.html not found, using hardcoded fallback');
        }
      } catch (err) {
        console.log('⚠️ Could not extract assets from index.html, using hardcoded fallback:', err.message);
      }
      
      // Apply hardcoded fallback if still missing (will be updated by build process)
      if (!cssFile || !jsFile) {
        cssFile = cssFile || '/assets/index-BB2O6vWo.css';
        jsFile = jsFile || '/assets/index-BOnnzKuG.js';
        console.log('🎯 Using hardcoded fallback assets:', { cssFile, jsFile });
      }
    } else {
      console.log('✅ Using assets from manifest:', { cssFile, jsFile });
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
    
    // Try to get assets even in error state
    let { cssFile, jsFile } = getAssetPaths();
    cssFile = cssFile || '/assets/index-BB2O6vWo.css';
    jsFile = jsFile || '/assets/index-BOnnzKuG.js';
    
    console.log('🚨 Error state - using fallback assets:', { cssFile, jsFile });
    
    // Ultra-minimal fallback with dynamic asset names
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: `<!DOCTYPE html>
<html><head><title>GrubGate</title><link rel="stylesheet" href="${cssFile}" /></head>
<body><div id="root"></div>
<script type="module" src="${jsFile}"></script>
</body></html>`
    };
  }
};





