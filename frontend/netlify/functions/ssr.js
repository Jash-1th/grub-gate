import { render } from '../../dist/server/main.ssr.js';

export default async (request, context) => {
  const url = new URL(request.url);
  
  try {
    // Get the HTML template
    const template = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Grub-Gate - Your Daily Bite, Delivered Right. Partnering with local restaurants to deliver fresh, chef-prepared meals." />
    <title>Grub-Gate - Food Delivery Made Easy</title>
  </head>
  <body>
    <div id="root"><!--ssr-outlet--></div>
    <script type="module" src="/assets/main.js"></script>
  </body>
</html>`;

    // Server-side render the React app
    const { html } = render(url.pathname);
    
    // Replace the SSR outlet with the rendered HTML
    const finalHtml = template.replace('<!--ssr-outlet-->', html);
    
    return new Response(finalHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('SSR Error:', error);
    
    // Fallback to client-side rendering
    const fallbackHtml = template.replace('<!--ssr-outlet-->', '');
    
    return new Response(fallbackHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
};
