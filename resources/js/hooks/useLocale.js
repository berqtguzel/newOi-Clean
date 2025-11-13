import { useEffect, useState } from "react";

export function useLocale(defaultLocale = "de") {
  const getInitial = () => {
    try {
      return localStorage.getItem("locale") || defaultLocale;
    } catch {
      return defaultLocale;
    }
  };
  const [locale, setLocale] = useState(getInitial);

  useEffect(() => {
    const onChanged = (e) => {
      const next = e?.detail?.locale || getInitial();
      setLocale(String(next));
    };
    window.addEventListener("language-changed", onChanged);
    return () => window.removeEventListener("language-changed", onChanged);

  }, []);

  return locale;
}


