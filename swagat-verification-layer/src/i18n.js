import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import gu from './locales/gu.json';
import en from './locales/en.json';
import hi from './locales/hi.json';

i18n.use(initReactI18next).init({
  resources: {
    gu: { translation: gu },
    en: { translation: en },
    hi: { translation: hi }
  },
  lng: 'gu',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
