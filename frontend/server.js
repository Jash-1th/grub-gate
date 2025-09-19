import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import fs from 'fs';
import i18n from './src/i18n.server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

let vite;
let render;

// Serve static files from public directory (including locales)
app.use(express.static(join(__dirname, 'public')));

if (!isProduction) {
  // Development mode with Vite dev server
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { 
      middlewareMode: true,
      hmr: {
        port: 24679, // Use clean port for HMR
        host: 'localhost'
      }
    },
    appType: 'custom',
    clearScreen: false,
    logLevel: 'info'
  });
  app.use(vite.middlewares);
} else {
  // Production mode - serve static files and use pre-built SSR
  app.use(express.static(join(__dirname, 'dist/client'), { index: false }));
  
  // Import the server-side render function
  try {
    const ssrModule = await import('./dist/server/main.ssr.js');
    render = ssrModule.render;
  } catch (error) {
    console.error('Failed to load SSR module:', error);
    console.log('Falling back to client-side rendering');
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// SSR route handler - catch all routes
app.get(/.*/, handleSSR);

async function handleSSR(req, res, next) {
  const url = req.originalUrl;
  
  // Skip SSR for development/browser specific files that don't need processing
  const skipSSRPatterns = [
    '/.well-known/',
    '/chrome-devtools/',
    '/__vite_ping',
    '/@vite/',
    '/@fs/',
    '/node_modules/',
    '/favicon.ico',
    '.map',
    '.css',
    '.js',
    '.ts',
    '.tsx',
    '.json',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico'
  ];
  
  const shouldSkipSSR = skipSSRPatterns.some(pattern => url.includes(pattern));
  
  if (shouldSkipSSR) {
    console.log(`Skipping SSR for: ${url}`);
    return next();
  }
  
  // Serve static assets directly if they exist
  const filePath = join(__dirname, 'dist/client', req.originalUrl);
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }

  try {
    let template;
    let renderFunction;

    if (!isProduction) {
      // Development: read template and get render function from Vite
      template = fs.readFileSync(join(__dirname, 'index.html'), 'utf8');
      template = await vite.transformIndexHtml(url, template);
      // Invalidate module cache to ensure fresh SSR in development
      const moduleId = '/src/main.ssr.jsx';
      const mod = vite.moduleGraph.getModuleById(moduleId);
      if (mod) {
        vite.reloadModule(mod);
      }
      const ssrModule = await vite.ssrLoadModule(moduleId);
      renderFunction = ssrModule.render;
    } else {
      // Production: use cached template and render function
      template = fs.readFileSync(join(__dirname, 'dist/client/index.html'), 'utf8');
      renderFunction = render;
    }

    let appHtml;
    
    if (renderFunction) {
      try {
        let initialData = {
          showLaunchScreen: false,
        };
        
        try {
          // Import the fetchInitialData function dynamically
          const { fetchInitialData } = await import('./src/utils/serverData.js');
          const pageData = await fetchInitialData();
          initialData = { ...initialData, ...pageData };
        } catch (error) {
          console.error('Error fetching initial data:', error);
          // Continue with default initial data
        }
        
        const lng = req.headers['accept-language'] ? req.headers['accept-language'].split(',')[0] : 'en';
        await i18n.changeLanguage(lng);
        
        console.log(`Attempting SSR for URL: ${url}`);
        const rendered = renderFunction(url, i18n, initialData);
        appHtml = rendered.html;
        console.log(`SSR successful for URL: ${url}`);

        // Create a safe version of i18n state for client-side hydration
        const getSafeI18nState = () => {
          try {
            const initialI18nStore = {};
            const languages = Array.isArray(i18n.languages) ? [...i18n.languages] : [];
            
            // Safely get resource bundles
            languages.forEach((l) => {
              try {
                const bundle = i18n.getResourceBundle(l, 'translation');
                if (bundle) {
                  initialI18nStore[l] = bundle;
                }
              } catch (e) {
                console.warn(`Failed to load translations for language: ${l}`, e);
              }
            });
            
            // Create a safe object with only the data we need
            const safeState = {
              language: i18n.language || 'en',
              languages: languages,
              store: initialI18nStore,
              services: {}
            };
            
            // Safely add resource store data if available
            try {
              if (i18n.services?.resourceStore?.data) {
                safeState.services.resourceStore = {
                  data: { ...i18n.services.resourceStore.data }
                };
              }
            } catch (e) {
              console.warn('Failed to serialize resource store', e);
            }
            
            return safeState;
          } catch (error) {
            console.error('Error creating safe i18n state:', error);
            return {
              language: 'en',
              languages: ['en'],
              store: {},
              services: { resourceStore: { data: {} } }
            };
          }
        };

        const safeI18nState = getSafeI18nState();
        
        // Stringify the i18n state with a replacer function to handle circular references
        const getSafeI18nStateString = (state) => {
          const seen = new WeakSet();
          return JSON.stringify(state, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) return '[Circular]';
              seen.add(value);
            }
            return value;
          });
        };

        // Add a script to handle launch screen and initial state
        const script = `
          <script>
            // Store initial data for client-side hydration
            window.__INITIAL_STATE__ = ${JSON.stringify(initialData).replace(/</g, '\\u003c')};
            
            // Initialize i18n with server-rendered translations
            (function() {
              const i18nState = ${getSafeI18nStateString(safeI18nState)};
              
              // Add changeLanguage function
              i18nState.changeLanguage = function(lng) {
                return fetch('/api/change-language', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ lng })
                });
              };
              
              window.i18n = i18nState;
            })();
            
            // Function to hide launch screen
            window.hideLaunchScreen = function() {
              const launchScreen = document.getElementById('launch-screen');
              if (launchScreen) {
                launchScreen.classList.add('hidden');
              }
              document.documentElement.classList.add('app-loaded');
              console.log('Launch screen hidden by React hydration');
            };
            
            // Hide launch screen immediately if app is already loaded
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
              window.hideLaunchScreen();
            } else {
              document.addEventListener('DOMContentLoaded', window.hideLaunchScreen);
            }
          </script>
        `;
        template = template.replace('</body>', `${script}</body>`);
      } catch (ssrError) {
        console.error('SSR render error for URL:', url, ssrError);
        // Fall back to client-side rendering
        appHtml = '<div id="root"><!--ssr-outlet--></div>';
      }
    } else {
      console.log('No SSR function available, using client-side rendering');
      // No SSR available, use client-side rendering
      appHtml = '<div id="root"><!--ssr-outlet--></div>';
      
      // Add minimal client-side hydration for non-SSR fallback
      const fallbackScript = `
        <script>
          document.body.classList.add('hydrating');
          document.addEventListener('DOMContentLoaded', function() {
            document.body.classList.remove('hydrating');
            document.body.classList.add('hydrated');
          });
        </script>
      `;
      template = template.replace('</body>', `${fallbackScript}</body>`);
    }
    
    // Replace the SSR outlet with the rendered content
    let html = template.replace('<!--ssr-outlet-->', appHtml);
    
    // Ensure proper meta tags for client-side routing
    if (!html.includes('<meta name="viewport"')) {
      html = html.replace('<head>', '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    }
    
    // Add cache control headers to prevent stale content
    res.status(200).set({ 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }).end(html);
  } catch (error) {
    console.error('Server error:', error);
    if (!isProduction && vite) {
      vite.ssrFixStacktrace(error);
    }
    res.status(500).send('Internal Server Error');
  }
}

const httpServer = createServer(app);

httpServer.listen(PORT, 'localhost', () => {
  console.log(`🚀 ${isProduction ? 'Production' : 'Development'} server running on http://localhost:${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Open your browser to http://localhost:${PORT}`);
  if (!isProduction) {
    console.log(`🔥 HMR WebSocket running on ws://localhost:24679`);
  }
});
