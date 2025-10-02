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

// Simplified handler function to prevent timeouts
exports.handler = async (event, context) => {
  const startTime = Date.now();
  
  try {
    const { path: urlPath = '/', headers = {} } = event;
    
    console.log('SSR Function called for:', urlPath);
    
    // Don't handle static assets at all - return 404 immediately
    if (urlPath.match(/\.(js|jsx|ts|tsx|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|map)$/) || 
        urlPath.startsWith('/assets/') || 
        urlPath.startsWith('/api/') || 
        urlPath.startsWith('/.netlify/')) {
      console.log('Static asset or API request, returning 404:', urlPath);
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Not found'
      };
    }
    
    // Return a simple, working HTML page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GrubGate Partner Portal</title>
  <meta name="description" content="Restaurant management platform for Montreal food delivery partners" />
  <meta name="theme-color" content="#800020" />
  <link rel="icon" type="image/png" href="/icons/Logo.png" />
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      margin: 0; 
      padding: 0; 
      background: #f9fafb; 
      color: #111827;
    }
    .loading { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      text-align: center; 
    }
    .logo { 
      width: 80px; 
      height: 80px; 
      background: #800020; 
      border-radius: 16px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: white; 
      font-size: 24px; 
      font-weight: bold; 
      margin-bottom: 24px;
    }
    .spinner { 
      border: 3px solid #e5e7eb; 
      border-top: 3px solid #800020; 
      border-radius: 50%; 
      width: 32px; 
      height: 32px; 
      animation: spin 1s linear infinite; 
      margin: 16px auto;
    }
    @keyframes spin { 
      0% { transform: rotate(0deg); } 
      100% { transform: rotate(360deg); } 
    }
    h1 { 
      margin: 0 0 8px 0; 
      font-size: 28px; 
      font-weight: 700; 
      color: #800020; 
    }
    p { 
      margin: 0; 
      color: #6b7280; 
      font-size: 16px; 
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="logo">G</div>
    <h1>GrubGate Partner Portal</h1>
    <div class="spinner"></div>
    <p>Loading your restaurant management platform...</p>
  </div>
  <div id="root"></div>
  
  <script type="module">
    console.log('🚀 Starting GrubGate Partner Portal...');
    
    // Try to load the built assets
    const loadAssets = async () => {
      try {
        console.log('🔍 Attempting to load assets...');
        
        // First, try to fetch the Vite manifest
        const manifestResponse = await fetch('/manifest.json');
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          console.log('📋 Vite manifest loaded:', Object.keys(manifest));
          
          // Look for the main entry point in the manifest
          const entryKey = Object.keys(manifest).find(key => 
            key === 'index.html' || 
            key === 'src/main.jsx' || 
            key.includes('main.jsx') ||
            key.includes('index.html')
          );
          
          if (entryKey && manifest[entryKey]) {
            const entry = manifest[entryKey];
            console.log('🎯 Found entry:', entryKey, entry);
            
            // Load CSS files
            if (entry.css && Array.isArray(entry.css)) {
              entry.css.forEach(cssFile => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssFile.startsWith('/') ? cssFile : '/' + cssFile;
                document.head.appendChild(link);
                console.log('🎨 Loaded CSS:', cssFile);
              });
            }
            
            // Load main JS file
            if (entry.file) {
              const script = document.createElement('script');
              script.type = 'module';
              script.src = entry.file.startsWith('/') ? entry.file : '/' + entry.file;
              script.onload = () => {
                console.log('✅ Main app loaded successfully');
                // Hide loading screen after a short delay
                setTimeout(() => {
                  const loading = document.querySelector('.loading');
                  if (loading) loading.style.display = 'none';
                }, 1000);
              };
              script.onerror = () => {
                console.error('❌ Failed to load main app script');
                tryFallbackAssets();
              };
              document.head.appendChild(script);
              console.log('📦 Loading main script:', entry.file);
              return; // Success, exit early
            }
          }
        }
        
        // If manifest loading failed, try fallback
        throw new Error('Manifest parsing failed');
        
      } catch (error) {
        console.warn('⚠️ Manifest loading failed:', error.message);
        tryFallbackAssets();
      }
    };
    
    // Fallback asset loading
    const tryFallbackAssets = async () => {
      console.log('🔄 Trying fallback asset loading...');
      
      const tryAsset = (src, type = 'script') => {
        return new Promise((resolve) => {
          if (type === 'script') {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = src;
            script.onload = () => {
              console.log('✅ Fallback loaded:', src);
              resolve(true);
            };
            script.onerror = () => {
              console.warn('❌ Fallback failed:', src);
              resolve(false);
            };
            document.head.appendChild(script);
          } else if (type === 'style') {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = src;
            link.onload = () => resolve(true);
            link.onerror = () => resolve(false);
            document.head.appendChild(link);
          }
        });
      };
      
      // Try to find assets by scanning the page or making educated guesses
      const commonPaths = [
        '/assets/index.js',
        '/assets/main.js',
        '/assets/app.js',
        '/src/main.jsx'
      ];
      
      // Try CSS files first
      const cssFiles = ['/assets/index.css', '/assets/main.css', '/assets/app.css'];
      for (const css of cssFiles) {
        await tryAsset(css, 'style');
      }
      
      // Try JS files
      for (const path of commonPaths) {
        const loaded = await tryAsset(path);
        if (loaded) {
          setTimeout(() => {
            const loading = document.querySelector('.loading');
            if (loading) loading.style.display = 'none';
          }, 1000);
          break;
        }
      }
      
      // If nothing worked, show error message
      setTimeout(() => {
        const loading = document.querySelector('.loading');
        if (loading && document.getElementById('root').children.length === 0) {
          loading.innerHTML = \`
            <div class="logo">G</div>
            <h1>GrubGate Partner Portal</h1>
            <p style="color: #ef4444;">Unable to load application assets.</p>
            <p style="font-size: 14px; margin-top: 16px;">
              <a href="/" style="color: #800020; text-decoration: underline;">Refresh Page</a>
            </p>
          \`;
        }
      }, 5000);
    };
    
    // Start loading assets
    loadAssets();
    
    // Hide loading screen when app mounts
    const observer = new MutationObserver(() => {
      const root = document.getElementById('root');
      if (root && root.children.length > 0) {
        document.querySelector('.loading').style.display = 'none';
        observer.disconnect();
      }
    });
    
    observer.observe(document.getElementById('root'), { childList: true });
  </script>
</body>
</html>`;
    
    console.log('✅ SSR completed in', Date.now() - startTime, 'ms');
    
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
    
    // Ultra-minimal fallback
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: `<!DOCTYPE html>
<html><head><title>GrubGate</title></head>
<body><div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
</body></html>`
    };
  }
};





