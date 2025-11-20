import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePage } from "@inertiajs/react";

export function useAppLocale(fallback = "de") {
  const { i18n } = useTranslation();
  const { props } = usePage();


  const backendLocale =
    props?.global?.locale ||
    props?.meta?.languages?.current ||
    fallback;

  useEffect(() => {
    if (!backendLocale) return;
    if (i18n.language !== backendLocale) {
      i18n.changeLanguage(backendLocale);
    }
  }, [backendLocale, i18n]);

  return backendLocale;
}
