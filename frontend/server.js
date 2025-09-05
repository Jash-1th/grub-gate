import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

let vite;
let render;

if (!isProduction) {
  // Development mode with Vite dev server
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom'
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
app.get('/', handleSSR);
app.get(/.*/, handleSSR);

async function handleSSR(req, res, next) {
  const url = req.originalUrl;

  try {
    let template;
    let renderFunction;

    if (!isProduction) {
      // Development: read template and get render function from Vite
      template = fs.readFileSync(join(__dirname, 'index.html'), 'utf8');
      template = await vite.transformIndexHtml(url, template);
      const ssrModule = await vite.ssrLoadModule('/src/main.ssr.jsx');
      renderFunction = ssrModule.render;
    } else {
      // Production: use cached template and render function
      template = fs.readFileSync(join(__dirname, 'dist/client/index.html'), 'utf8');
      renderFunction = render;
    }

    let appHtml = '';
    
    if (renderFunction) {
      try {
        const rendered = renderFunction(url);
        appHtml = rendered.html;
      } catch (ssrError) {
        console.error('SSR render error:', ssrError);
        // Fall back to client-side rendering
        appHtml = '<div id="root"><!--ssr-outlet--></div>';
      }
    } else {
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

app.listen(PORT, () => {
  console.log(`🚀 ${isProduction ? 'Production' : 'Development'} server running on http://localhost:${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Open your browser to http://localhost:${PORT}`);
});