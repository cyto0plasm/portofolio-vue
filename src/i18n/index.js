import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import zh from './locales/zh.json';  
import ja from './locales/ja.json';  

const countryToLang = {
  US: 'en', GB: 'en', AU: 'en',
  EG: 'ar', SA: 'ar', AE: 'ar', MA: 'ar',
  FR: 'fr', BE: 'fr', CH: 'fr',
  ES: 'es', MX: 'es', AR: 'es', 
  CN: 'zh', HK: 'zh', TW: 'zh', 
  JP: 'ja', 
  
};

export async function detectLanguage() {
  // Check saved preference
  const saved = localStorage.getItem('lang');
  if (saved) return saved;

  try {
    // Detect by IP geolocation
    const res = await fetch('https://ipwho.is/');
    const data = await res.json();
    const lang = countryToLang[data.country_code] || 'en';
    return lang;
  } catch (e) {
    // Fallback to browser language
    return navigator.language?.slice(0, 2) || 'en';
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, ar, fr, es, zh, ja },
});