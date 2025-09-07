import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { I18nextProvider } from 'react-i18next';
import App from './App.jsx';

export function render(url, i18n) {
  const html = renderToString(
    <I18nextProvider i18n={i18n}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </I18nextProvider>
  );
  return { html };
}
