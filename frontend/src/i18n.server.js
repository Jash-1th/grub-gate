import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import FsBackend from 'i18next-fs-backend';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

i18n
  .use(FsBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    backend: {
      loadPath: join(__dirname, '../public/locales/{{lng}}/{{ns}}.json'),
    },
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
