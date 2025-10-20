import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// Cargar expo-localization de forma opcional para evitar fallos si el módulo nativo no está disponible
let Localization: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Localization = require('expo-localization');
} catch (e) {
  console.log('expo-localization no disponible, usando fallback a en');
}
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importar archivos de idiomas
import es from '../locales/es.json';
import en from '../locales/en.json';
import pt from '../locales/pt.json';

// Detectar idioma del dispositivo con expo-localization
const getDeviceLanguage = () => {
  try {
    const supported = ['es', 'en', 'pt'];
    const locale = ((Localization && Localization.locale) ? Localization.locale : 'en').toLowerCase();
    const base = locale.split('-')[0];
    return supported.includes(base) ? base : 'en';
  } catch {
    return 'en';
  }
};

// Configurar i18next
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      es: { translation: es },
      en: { translation: en },
      pt: { translation: pt }
    },
    lng: getDeviceLanguage(), // Idioma del dispositivo
    fallbackLng: 'en', // Fallback a inglés si no está soportado
    
    interpolation: {
      escapeValue: false // React ya escapa por defecto
    },
    
    react: {
      useSuspense: false
    }
  });

// Persistencia de idioma preferido del usuario
const LANGUAGE_PREFERENCE_KEY = '@fitso_language_preference';

export async function loadSavedLanguagePreference() {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    if (saved && ['es', 'en', 'pt'].includes(saved)) {
      await i18n.changeLanguage(saved);
    }
  } catch {}
}

export async function setAppLanguage(lang: 'es' | 'en' | 'pt') {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, lang);
  } catch {}
}

export default i18n;
