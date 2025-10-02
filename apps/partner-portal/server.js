import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

async function createServer() {
  const app = express();

  if (!isProd) {
    // DEV: create Vite in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res) => {
      const url = req.originalUrl;

      try {
        // 1) Read raw HTML template
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

        // 2) Apply Vite HTML transforms (injects @vite/client, etc.)
        template = await vite.transformIndexHtml(url, template);

        // 3) Try to load SSR entry and render, with fallback to CSR
        let appHtml = '';
        let head = '';
        
        try {
          const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
          const result = await render(url);
          appHtml = result.html || '';
          head = result.head || '';
          console.log('SSR render successful for:', url);
        } catch (ssrError) {
          console.log('SSR failed, using CSR fallback for:', url, ssrError.message);
          // Use empty content for CSR fallback
          appHtml = '';
          head = '<title>GrubGate Partner Portal</title>';
        }

        // 4) DEV: inject global stylesheet
        const cssLinks = [
          '<link rel="stylesheet" href="/src/styles/index.css" />',
        ].join('\n');

        // 5) Assemble final HTML
        const html = template
          .replace('<!--app-head-->', `${head}\n${cssLinks}`)
          .replace('<!--app-html-->', appHtml);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        console.error('Server error:', e);
        vite.ssrFixStacktrace(e);
        
        // Fallback HTML in case of complete failure
        const fallbackHtml = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>GrubGate Partner Portal</title>
              <link rel="stylesheet" href="/src/styles/index.css" />
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.jsx"></script>
            </body>
          </html>
        `;
        
        res.status(200).set({ 'Content-Type': 'text/html' }).end(fallbackHtml);
      }
    });
  } else {
    // PRODUCTION: serve pre-built assets from /dist/client and use SSR bundle
    const clientDist = path.resolve(__dirname, 'dist/client');
    const ssrDist = path.resolve(__dirname, 'dist/server');
    const template = fs.readFileSync(path.join(clientDist, 'index.html'), 'utf-8');
    const manifest = JSON.parse(
      fs.readFileSync(path.join(clientDist, 'manifest.json'), 'utf-8')
    );

    app.use((await import('compression')).default());
    app.use(
      (await import('serve-static')).default(clientDist, {
        index: false,
      })
    );

    // Helper: render preload and CSS links from manifest
    function renderPreloadLinks(entry, manifest) {
      let links = '';
      const seen = new Set();

      function _helper(file) {
        if (seen.has(file)) return;
        seen.add(file);

        const chunk = manifest[file];
        if (!chunk) return;

        if (chunk.css) {
          for (const cssFile of chunk.css) {
            links += `<link rel="stylesheet" href="/${cssFile}">`;
          }
        }
        if (chunk.assets) {
          for (const asset of chunk.assets) {
            if (asset.endsWith('.woff2')) {
              links += `<link rel="preload" href="/${asset}" as="font" type="font/woff2" crossorigin>`;
            } else {
              links += `<link rel="preload" href="/${asset}" as="image">`;
            }
          }
        }
        if (chunk.imports) {
          for (const imp of chunk.imports) {
            _helper(imp);
          }
        }
      }

      _helper(entry);
      return links;
    }

    app.use('*', async (req, res) => {
      try {
        const url = req.originalUrl;

        // Load the SSR bundle (compiled entry-server)
        const { render } = await import(path.join(ssrDist, 'entry-server.js'));
        const { html: appHtml, head = '', entry = 'src/entry-client.jsx' } = await render(url);

        // Create preload + CSS links based on manifest and entry
        const preloadAndCssLinks = renderPreloadLinks(entry, manifest);

        const html = template
          .replace('<!--app-head-->', `${head || ''}\n${preloadAndCssLinks}`)
          .replace('<!--app-html-->', appHtml);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        console.error(e);
        res.status(500).end(e.message);
      }
    });
  }

  const port = process.env.PORT || 4001;
  app.listen(port, () => {
    console.log(`🚀 SSR server running at http://localhost:${port}`);
    console.log(`📁 Serving from: ${__dirname}`);
    console.log(`🔧 Environment: ${isProd ? 'production' : 'development'}`);
  });
}

createServer();