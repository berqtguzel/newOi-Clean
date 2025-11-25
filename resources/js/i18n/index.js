import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";
import tr from "./locales/tr.json";

// HYDRATION FIX: Server ve client'ta aynı locale'i kullan
const detectInitialLng = () => {
  // Server-side: window yok, varsayılan "de" döndür
  if (typeof window === "undefined") {
    return "de";
  }
  
  // Client-side: HTML lang attribute'undan al veya varsayılan "de"
  const htmlLang = document.documentElement.lang;
  if (htmlLang) {
    return htmlLang.split("-")[0];
  }
  
  return "de";
};

// HYDRATION FIX: i18n'i senkron başlat
i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
      tr: { translation: tr },
    },
    lng: detectInitialLng(),
    fallbackLng: "de",
    supportedLngs: ["de", "en", "tr"],
    interpolation: {
      escapeValue: false,
    },
    // HYDRATION FIX: React Suspense'i devre dışı bırak
    react: {
      useSuspense: false,
    },
  });

export default i18n;
