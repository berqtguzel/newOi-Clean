import "./bootstrap";
import "../css/app.css";
import "../css/theme.css";
import "../css/loading.css";
import "../css/404.css";
import "./i18n";

import React, { useEffect } from "react";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import route from "../../vendor/tightenco/ziggy/dist/index.m.js";
import { ThemeProvider } from "./Context/ThemeContext";
import i18n from "i18next"; // i18next kütüphanesini içeri aktarın

/*
|--------------------------------------------------------------------------
| 0. FOUC ENGELLEMEK İÇİN GİZLEME (Hydration için GÜVENLİ Yöntem)
|--------------------------------------------------------------------------
*/
if (document.documentElement.style.visibility === "hidden") {
    // Görünürlüğü kaldırma işi artık RootComponent'te yönetilecek.
} else {
    document.documentElement.style.visibility = "visible";
}

/*
|--------------------------------------------------------------------------
| 1. Renkleri Uygula (Aynen Korundu)
|--------------------------------------------------------------------------
*/
function applyCssVarsFromColors(colors = {}) {
    Object.entries(colors).forEach(([key, val]) => {
        if (!val) return;
        document.documentElement.style.setProperty(
            `--${key.replace(/_/g, "-")}`,
            val
        );
    });
}

if (typeof window !== "undefined" && window.__SITE_COLORS__) {
    try {
        applyCssVarsFromColors(window.__SITE_COLORS__);
    } catch (e) {
        console.error("Renk değişkenleri uygulanamadı:", e);
    }
}

if (window.__SITE_COLORS__) {
    const root = document.documentElement;
    const colors = window.__SITE_COLORS__;

    Object.entries(colors).forEach(([key, value]) => {
        if (typeof value === "string" && value.startsWith("#")) {
            const cssVar = `--${key.replace(/_/g, "-")}`;
            root.style.setProperty(cssVar, value);
        }
    });
}

const APP_NAME = "O&I CLEAN group GmbH";

/*
|--------------------------------------------------------------------------
| 2. Dark Mode başlangıç modu (Aynen Korundu)
|--------------------------------------------------------------------------
*/
function getInitialTheme() {
    if (typeof window === "undefined") return "light";
    try {
        const saved = localStorage.getItem("theme");
        if (saved === "dark" || saved === "light") return saved;
        const prefersDark = window.matchMedia?.(
            "(prefers-color-scheme: dark)"
        )?.matches;
        return prefersDark ? "dark" : "light";
    } catch {
        return "light";
    }
}

/*
|--------------------------------------------------------------------------
| 3. Kök Bileşen (Aynen Korundu)
|--------------------------------------------------------------------------
*/
const RootComponent = ({ App, props, initialTheme }) => {
    useEffect(() => {
        requestAnimationFrame(() => {
            document.documentElement.style.visibility = "visible";
        });
    }, []);

    return (
        <ThemeProvider initial={initialTheme}>
            <App {...props} />
        </ThemeProvider>
    );
};

/*
|--------------------------------------------------------------------------
| 4. INERTIA APP BAŞLATMA VE KRİTİK DİL BEKLEMESİ
|--------------------------------------------------------------------------
*/
createInertiaApp({
    title: (title) => (title ? `${title} - ${APP_NAME}` : APP_NAME),

    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.jsx`, {
            ...import.meta.glob("./Pages/**/*.jsx", { eager: true }),
            ...import.meta.glob("./Pages/**/*.tsx", { eager: true }),
        }),

    setup({ el, App, props }) {
        const initialPageProps = props.initialPage?.props;
        const initialLocale = initialPageProps?.locale || "de";
        const initialTheme = getInitialTheme();

        let appStarted = false;

        // 🚨 HİDRASYON ÇÖZÜMÜ: i18n'in YÜKLENMESİNİ BEKLE ve DİLİ ZORLA

        // 1. Dili senkron olarak zorla.
        if (i18n.isInitialized) {
            i18n.language = initialLocale;
        }

        // 2. Hydrate/Render işlemini i18n'in kaynakları yükleyip "hazır" olana kadar geciktir.
        const startApp = () => {
            if (appStarted) return;
            appStarted = true;

            // DİL KESİNLEŞTİKTEN SONRA TEKRAR KONTROL
            if (i18n.language !== initialLocale) {
                i18n.language = initialLocale;
            }

            const Root = (
                <RootComponent
                    App={App}
                    props={props}
                    initialTheme={initialTheme}
                />
            );

            // 🚨 KRİTİK DEĞİŞİKLİK: Hidrasyonu Kontrollü Dene
            if (el.hasChildNodes()) {
                try {
                    // Hidrasyonu dene. Başarılı olursa hız kazanılır.
                    hydrateRoot(el, Root);
                } catch (e) {
                    // Eğer hidrasyon başarısız olursa (DOM uyuşmazlığı),
                    // hatayı yut ve tamamen client-side render'a geç (yavaş ama hatasız).
                    console.error(
                        "Hydration Failed. Falling back to client-side render.",
                        e
                    );
                    createRoot(el).render(Root);
                }
            } else {
                createRoot(el).render(Root);
            }
        };

        // 3. Başlatma mantığı: İki ana yolu kontrol et.
        if (i18n.isInitialized) {
            // Eğer i18n hazırsa, hafif bir gecikmeyle (DOM'un tamamen stabilize olması için) başlat.
            setTimeout(startApp, 10);
        } else {
            // Eğer i18n asenkron yükleme yapıyorsa, 'initialized' event'ini bekle.
            i18n.on("initialized", startApp);
        }

        // Ziggy ve diğer ayarlar
        const ziggy = initialPageProps?.ziggy;
        if (ziggy) {
            window.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...ziggy,
                    location: new URL(ziggy.location),
                });
        }
    },

    /*
    |--------------------------------------------------------------------------
    | 5. Inertia Progress Bar (Aynen Korundu)
    |--------------------------------------------------------------------------
    */
    progress: {
        color: "var(--site-primary-color)",
        delay: 80,
    },
});
