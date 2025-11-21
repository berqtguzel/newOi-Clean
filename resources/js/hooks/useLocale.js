import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import i18n from "@/i18n";

function resolveInitialLocale(props, defaultLocale = "de") {
    const fromProps =
        props?.locale ||
        props?.global?.locale ||
        props?.global?.language ||
        null;

    let fromStorage = null;
    if (typeof window !== "undefined") {
        fromStorage =
            localStorage.getItem("locale") ||
            localStorage.getItem("i18nextLng") ||
            null;
    }

    const fromI18n = i18n?.language || null;

    const chosen =
        (fromProps && String(fromProps)) ||
        (fromStorage && String(fromStorage)) ||
        (fromI18n && String(fromI18n)) ||
        defaultLocale;


    return chosen.slice(0, 2);
}

export function useLocale(defaultLocale = "de") {
    const { props } = usePage();

    const [locale, setLocale] = useState(() =>
        resolveInitialLocale(props, defaultLocale)
    );


    useEffect(() => {
        const next = resolveInitialLocale(props, defaultLocale);
        setLocale(next);
    }, [props.locale, props?.global?.locale, defaultLocale]);


    useEffect(() => {
        if (!locale) return;


        if (i18n.language?.slice(0, 2) !== locale) {
            i18n.changeLanguage(locale);
        }


        if (typeof window !== "undefined") {
            try {
                localStorage.setItem("locale", locale);
                localStorage.setItem("i18nextLng", locale);
            } catch (e) {

                console.warn("locale storage error", e);
            }
        }
    }, [locale]);

    return locale;
}
