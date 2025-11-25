import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";
import tr from "./locales/tr.json";


const detectInitialLng = () => {

  if (typeof window === "undefined") {
    return "de";
  }


  const htmlLang = document.documentElement.lang;
  if (htmlLang) {
    return htmlLang.split("-")[0];
  }

  return "de";
};


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

    react: {
      useSuspense: false,
    },
  });

export default i18n;
