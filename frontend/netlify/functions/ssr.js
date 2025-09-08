// frontend/netlify/edge-functions/ssr.js

import { render } from '../../dist/server/main.ssr.js';
import i18next from 'i18next';
import FsBackend from 'i18next-fs-backend';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// --- Server-Side i18next Configuration ---
i18next
  .use(FsBackend)
  .init({
    initImmediate: false,
    fallbackLng: 'en',
    preload: ['en', 'fr'],
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      // Use process.cwd() to build an absolute path to the locales folder
      loadPath: path.join(process.cwd(), 'public/locales/{{lng}}/{{ns}}.json'),
    },
  });
// --- End i18next Configuration ---

export default async (request, context) => {
  const url = new URL(request.url);

  try {
    // 1. Load the built index.html as a template
    // This is better than a hardcoded string because it includes Vite's asset hashes.
    const templatePath = path.join(process.cwd(), 'dist/client/index.html');
    const template = await fs.readFile(templatePath, 'utf-8');

    // 2. Clone i18next instance and set language for the current request
    const i18n = i18next.cloneInstance();
    const lang = context.cookies.get('i18next') || request.headers.get('accept-language')?.split(',')[0] || 'en';
    await i18n.changeLanguage(lang.slice(0, 2));
    await i18n.loadNamespaces('translation');
    
    // 3. Render the React app to an HTML string, passing the i18n instance
    const { html } = render(url.pathname, i18n);

    // 4. Prepare the initial state to be injected for client-side hydration
    const initialI18nStore = {};
    i18n.languages.forEach((l) => {
      initialI18nStore[l] = { translation: i18n.getResourceBundle(l, 'translation') };
    });

    const stateScript = `
      <script>
        window.INITIAL_I18N_STATE = ${JSON.stringify(initialI18nStore)};
        window.INITIAL_LANGUAGE = "${i18n.language}";
      </script>
    `;

    // 5. Inject the rendered HTML and the state script into the template
    const finalHtml = template
      .replace(`<!--ssr-outlet-->`, html)
      .replace('</body>', `${stateScript}</body>`);

    return new Response(finalHtml, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('SSR Edge Function Error:', error);
    // If an error occurs, return a proper error response
    return new Response(`Server-Side Rendering Error: ${error.message}, { status: 500 }`);
  }
};
