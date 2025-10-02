// Netlify Serverless Function for GrubGate Partner Portal SSR
const fs = require('fs');
const path = require('path');

// Cache the HTML template to avoid reading it multiple times
let cachedTemplate = null;
let cachedManifest = null;

// Get the Vite manifest to find correct asset filenames
const getViteManifest = () => {
  if (cachedManifest) {
    return cachedManifest;
  }
  
  try {
    const manifestPaths = [
      path.join(__dirname, 'manifest.json'), // Check functions directory first
      path.join(__dirname, '../../dist/client/manifest.json'),
      path.join(__dirname, '../../../dist/client/manifest.json'),
      path.join(process.cwd(), 'dist/client/manifest.json')
    ];
    
    for (const manifestPath of manifestPaths) {
      try {
        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          cachedManifest = manifest;
          console.log('✅ Successfully loaded Vite manifest from:', manifestPath);
          return manifest;
        }
      } catch (err) {
        console.warn('Failed to parse manifest at:', manifestPath, err.message);
      }
    }
    
    console.warn('⚠️ Vite manifest not found in any location, using fallback');
    return null;
  } catch (error) {
    console.warn('❌ Failed to read Vite manifest:', error.message);
    return null;
  }
};

// Read the HTML template
const getHTMLTemplate = () => {
  if (cachedTemplate) {
    return cachedTemplate;
  }
  
  try {
    // Try to read the HTML template from the functions directory first
    const localTemplate = path.join(__dirname, 'index.html');
    
    if (fs.existsSync(localTemplate)) {
      const html = fs.readFileSync(localTemplate, 'utf8');
      console.log('Successfully loaded HTML template from functions directory');
      cachedTemplate = html;
      return html;
    }
    
    // Fallback: try other possible locations
    const possiblePaths = [
      path.join(__dirname, '../../dist/client/index.html'),
      path.join(__dirname, '../../../dist/client/index.html'),
      path.join(process.cwd(), 'dist/client/index.html'),
      path.join(process.cwd(), 'index.html')
    ];
    
    for (const templatePath of possiblePaths) {
      try {
        const html = fs.readFileSync(templatePath, 'utf8');
        console.log('Successfully loaded built HTML template from:', templatePath);
        return html;
      } catch (err) {
        // Continue to next path
      }
    }
    
    throw new Error('No HTML template found in any location');
  } catch (error) {
    console.error('Failed to read built HTML template, using fallback:', error.message);
    
    // Fallback: create a minimal HTML template that works with production assets
    // This will use CSR (Client-Side Rendering) as a last resort
    const manifest = getViteManifest();
    let cssLinks = '';
    let jsScripts = '';
    
    if (manifest) {
      // Extract CSS and JS files from manifest
      Object.values(manifest).forEach(entry => {
        if (entry.css) {
          entry.css.forEach(cssFile => {
            cssLinks += `<link rel="stylesheet" href="/${cssFile}" />`;
          });
        }
        if (entry.file && entry.file.endsWith('.js')) {
          jsScripts += `<script type="module" src="/${entry.file}"></script>`;
        }
      });
    } else {
      // Fallback: Try to read the built HTML template to extract asset names
      try {
        const htmlTemplate = getHTMLTemplate();
        if (htmlTemplate && htmlTemplate !== fallbackHTML) {
          // Extract CSS and JS links from the built HTML
          const cssMatch = htmlTemplate.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g);
          const jsMatch = htmlTemplate.match(/<script[^>]*src="([^"]*\.js)"[^>]*>/g);
          
          if (cssMatch) {
            cssLinks = cssMatch.join('\n          ');
          }
          if (jsMatch) {
            jsScripts = jsMatch.join('\n          ');
          }
          
          console.log('✅ Extracted assets from HTML template');
        } else {
          console.warn('⚠️ Using minimal fallback assets');
          // Minimal fallback - let the browser handle missing assets gracefully
          cssLinks = '<!-- CSS will be loaded dynamically -->';
          jsScripts = '<script type="module">import("/assets/index.js").catch(() => console.warn("Assets loading..."))</script>';
        }
      } catch (err) {
        console.warn('⚠️ Fallback asset extraction failed, using minimal assets');
        cssLinks = '<!-- CSS will be loaded dynamically -->';
        jsScripts = '<script type="module">import("/assets/index.js").catch(() => console.warn("Assets loading..."))</script>';
      }
    }
    
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
          <meta name="description" content="GrubGate Partner Portal - Manage your restaurant business with subscription meal plans." />
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
          
          <title>GrubGate Partner Portal - Restaurant Management Platform</title>
          
          <!--app-head-->
          
          ${cssLinks}
        </head>
        <body>
          <div id="root"><!--app-html--></div>
          
          ${jsScripts}
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
exports.handler = async (event, context) => {
  // Set a timeout to prevent 504 errors
  const startTime = Date.now();
  const timeout = 8000; // 8 seconds max
  
  try {
    const { path: urlPath, headers } = event;
    const userAgent = headers['user-agent'] || '';
    
    console.log('🚀 SSR Handler started - URL:', urlPath);
    
    // Quick timeout check
    if (Date.now() - startTime > timeout) {
      throw new Error('Function timeout');
    }
    
    // Don't handle static assets - let Netlify serve them directly
    if (urlPath.match(/\.(js|jsx|ts|tsx|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|map)$/)) {
      console.log('📄 Static asset request, skipping SSR:', urlPath);
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Static asset not found - should be served by Netlify directly'
      };
    }
    
    // Don't handle assets/ requests - these are built static assets
    if (urlPath.startsWith('/assets/')) {
      console.log('📦 Assets directory request, skipping SSR:', urlPath);
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Asset not found - should be served by Netlify directly'
      };
    }
    
    // Don't handle API or function requests
    if (urlPath.startsWith('/api/') || urlPath.startsWith('/.netlify/')) {
      console.log('🔧 API/Function request, skipping SSR:', urlPath);
      return {
        statusCode: 404,
        body: 'API endpoint not found'
      };
    }
    
    // Get the HTML template quickly
    let html;
    try {
      html = getHTMLTemplate();
      console.log('✅ HTML template loaded');
    } catch (err) {
      console.warn('⚠️ Template loading failed, using minimal fallback');
      html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GrubGate Partner Portal</title>
  <meta name="theme-color" content="#800020" />
</head>
<body>
  <div id="root"></div>
  <script type="module">
    // Fallback script loader
    const scripts = ['/assets/index.js', '/assets/main.js'];
    scripts.forEach(src => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      script.onerror = () => console.warn('Failed to load:', src);
      document.head.appendChild(script);
    });
  </script>
</body>
</html>`;
    }
    
    // Quick timeout check
    if (Date.now() - startTime > timeout) {
      throw new Error('Function timeout during HTML processing');
    }
    
    // Simple meta tag injection for SEO
    const title = urlPath.includes('/dashboard') ? 'Dashboard - GrubGate Partners' : 'GrubGate Partner Portal';
    const description = 'Restaurant management platform for Montreal food delivery partners';
    
    // Replace placeholders if they exist
    html = html.replace('<!--app-head-->', `<title>${title}</title><meta name="description" content="${description}" />`);
    html = html.replace('<div id="root"><!--app-html--></div>', '<div id="root"></div>');
    
    console.log('✅ SSR completed in', Date.now() - startTime, 'ms');
    
    // Return the HTML response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: html
    };
    
  } catch (error) {
    console.error('❌ SSR handler error:', error.message);
    
    // Return a minimal working page that will load the app
    const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GrubGate Partner Portal</title>
  <meta name="theme-color" content="#800020" />
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f9fafb; }
    .loading { text-align: center; padding: 50px; color: #800020; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #800020; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loading">
    <h1>GrubGate Partner Portal</h1>
    <div class="spinner"></div>
    <p>Loading your restaurant management platform...</p>
  </div>
  <div id="root"></div>
  <script type="module">
    // Try to load the main app assets
    const loadScript = (src) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      script.onload = () => console.log('✅ Loaded:', src);
      script.onerror = () => console.warn('❌ Failed to load:', src);
      document.head.appendChild(script);
    };
    
    // Try common asset paths
    const possiblePaths = ['/assets/index.js', '/assets/main.js', '/src/main.jsx'];
    possiblePaths.forEach(loadScript);
  </script>
</body>
</html>
    `;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: errorHtml
    };
  }
};





