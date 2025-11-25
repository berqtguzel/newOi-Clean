import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";
import tr from "./locales/tr.json";

// SSR ve CSR eşleşmesi için:
const detectInitialLng = () => {
  if (typeof window === "undefined") {
    // SSR her zaman DE olacak → mismatch yok
    return "de";
  }

  //
  // ❗ BURADA OTO-DETEKTE DİL PROBLEMLİYDİ.
  // Çünkü HTML lang = en → CSR "en" oluyordu.
  // Hydration mismatch doğuyordu.
  //
  // BİZ SERVER İLE AYNI BAŞLAMAK İSTİYORUZ → "de"
  //
  return document.documentElement.getAttribute("data-locale") || "de";
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
      tr: { translation: tr },
    },

    // 🔥 SSR ve CSR başlangıçta aynı dili kullanır
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
