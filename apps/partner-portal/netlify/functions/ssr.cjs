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
  const { path: urlPath, headers } = event;
  const userAgent = headers['user-agent'] || '';
  
  console.log('SSR Handler - URL:', urlPath);
  console.log('SSR Handler - User Agent:', userAgent);
  
  // Don't handle static assets - let Netlify serve them directly
  if (urlPath.match(/\.(js|jsx|ts|tsx|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|map)$/)) {
    console.log('Static asset request, skipping SSR:', urlPath);
    return {
      statusCode: 404,
      body: 'Static asset not found'
    };
  }
  
  // Don't handle src/ requests - these should be handled by Vite in development
  if (urlPath.startsWith('/src/')) {
    console.log('Source file request, skipping SSR:', urlPath);
    return {
      statusCode: 404,
      body: 'Source file not found'
    };
  }
  
  // Don't handle assets/ requests - these are built static assets
  if (urlPath.startsWith('/assets/')) {
    console.log('Assets request, skipping SSR:', urlPath);
    return {
      statusCode: 404,
      body: 'Asset not found'
    };
  }
  
  try {
    // Get the HTML template
    let html = getHTMLTemplate();
    
    // For now, use CSR (Client-Side Rendering) to avoid hydration issues
    // This ensures the app works reliably while we can optimize SSR later
    console.log('Using CSR fallback for reliable routing');
    
    // Generate appropriate meta tags based on the route
    const metaTags = generateMetaTags(urlPath || '/', userAgent);
    html = html.replace('<!--app-head-->', metaTags);
    
    // Ensure the root div is empty for client-side rendering
    html = html.replace(
      '<div id="root"><!--app-html--></div>',
      '<div id="root"></div>'
    );
    
    // Replace development script with production scripts
    // The built HTML should have the correct script tags, but if not, we'll fix it
    if (html.includes('/src/main.jsx')) {
      // This is the development template, replace with production script loading
      html = html.replace(
        '<script type="module" src="/src/main.jsx"></script>',
        '<!-- Production scripts will be injected by Vite build process -->'
      );
    }
    
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
          <script type="module" src="/src/main.jsx"></script>
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





