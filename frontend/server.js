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

    let appHtml = '';
    
    if (renderFunction) {
      try {
        const lng = req.headers['accept-language'] ? req.headers['accept-language'].split(',')[0] : 'en';
        await i18n.changeLanguage(lng);
        
        console.log(`Attempting SSR for URL: ${url}`);
        const rendered = renderFunction(url, i18n);
        appHtml = rendered.html;
        console.log(`SSR successful for URL: ${url}`);

        const initialI18nStore = {};
        i18n.languages.forEach((l) => {
          initialI18nStore[l] = i18n.getResourceBundle(l, 'translation');
        });

        const script = `
          <script>
            window.__INITIAL_I18N_STATE__ = ${JSON.stringify(initialI18nStore)};
            window.__INITIAL_LANGUAGE__ = "${lng}";
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
    }

    const html = template.replace('<!--ssr-outlet-->', appHtml);
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
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
