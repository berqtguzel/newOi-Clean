import "./bootstrap";
import "../css/app.css";
import "../css/theme.css";
import "../css/loading.css";
import "../css/404.css";
import "./i18n";

import React, { useMemo } from "react";
import { createInertiaApp } from "@inertiajs/react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { route } from "ziggy-js";
import { ThemeProvider } from "./Context/ThemeContext";
import i18n from "i18next";

/* ---------------------------------------------------------
    Renk Değişkenleri
--------------------------------------------------------- */
function applyCssVarsFromColors(colors = {}) {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
        if (!value) return;
        root.style.setProperty(`--${key.replace(/_/g, "-")}`, value);
    });
}

if (typeof window !== "undefined" && window.__SITE_COLORS__) {
    try {
        applyCssVarsFromColors(window.__SITE_COLORS__);
    } catch (e) {
        console.error("Renk değişkenleri uygulanamadı:", e);
    }
}

/* ---------------------------------------------------------
    Tema Algılama
--------------------------------------------------------- */
function getInitialTheme() {
    if (typeof window === "undefined") return "light";

    try {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") return saved;
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    } catch {
        return "light";
    }
}

const APP_NAME = "O&I CLEAN group GmbH";

/* ---------------------------------------------------------
    Root Wrapper Component
--------------------------------------------------------- */
const RootComponent = ({ App, props, initialTheme }) => (
    <ThemeProvider initial={initialTheme}>
        <App {...props} />
    </ThemeProvider>
);

/* ---------------------------------------------------------
    INERTIA APP (SSR UYUMLU)
--------------------------------------------------------- */
createInertiaApp({
    title: (title) => (title ? `${title} - ${APP_NAME}` : APP_NAME),

    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.jsx`, {
            ...import.meta.glob("./Pages/**/*.jsx"),
            ...import.meta.glob("./Pages/**/*.tsx"),
        }),

    setup({ el, App, props }) {
        const initialLocale = props?.initialPage?.props?.locale || "de";
        const initialTheme = getInitialTheme();

        const reactApp = (
            <RootComponent
                App={App}
                props={props}
                initialTheme={initialTheme}
            />
        );

        /** Dil eşleme (SSR → Client) */
        let rootInstance = null;
        const startApp = async () => {
            if (i18n.language !== initialLocale) {
                await i18n.changeLanguage(initialLocale);
            }

            if (el.hasChildNodes()) {
                try {
                    // Hydration denemesi
                    rootInstance = hydrateRoot(el, reactApp);
                } catch (err) {
                    console.warn(
                        "Hydration error, SPA render uygulanıyor:",
                        err
                    );
                    // Hydration başarısız oldu, mevcut root'u kullan veya yeni oluştur
                    if (!rootInstance) {
                        rootInstance = createRoot(el);
                    }
                    rootInstance.render(reactApp);
                }
            } else {
                // SPA modu - yeni root oluştur
                if (!rootInstance) {
                    rootInstance = createRoot(el);
                }
                rootInstance.render(reactApp);
            }
        };

        if (i18n.isInitialized) startApp();
        else i18n.on("initialized", startApp);

        const ziggy = props?.initialPage?.props?.ziggy;
        if (ziggy) {
            window.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...ziggy,
                    location: new URL(ziggy.location),
                });
        }
    },

    progress: {
        color: "var(--site-primary-color)",
        delay: 80,
    },
});
