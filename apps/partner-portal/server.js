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

        // 3) Load your SSR entry and render the app
        //    Your entry should export: export async function render(url) { return { html, head } }
        const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
        const { html: appHtml, head = '' } = await render(url);

        // 4) DEV: inject global stylesheet as a normal <link> so CSS loads before hydration
        //    This prevents FOUC because Tailwind/global styles are present in the initial HTML.
        const cssLinks = [
          // Add your global stylesheet(s) here:
          '<link rel="stylesheet" href="/src/styles/index.css" />',
        ].join('\n');

        // 5) Assemble final HTML:
        //    Replace your markers in index.html (ensure you have <!--app-head--> and <!--app-html-->)
        const html = template
          .replace('<!--app-head-->', `${head || ''}\n${cssLinks}`)
          .replace('<!--app-html-->', appHtml);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        console.error(e);
        res.status(500).end(e.message);
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

  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`SSR server running at http://localhost:${port}`);
  });
}

createServer();