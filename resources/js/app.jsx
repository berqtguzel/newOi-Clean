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
import i18n from "i18next";

if (document.documentElement.style.visibility === "hidden") {
} else {
    document.documentElement.style.visibility = "visible";
}

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

        if (i18n.isInitialized) {
            i18n.language = initialLocale;
        }

        const startApp = () => {
            if (appStarted) return;
            appStarted = true;

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

            if (el.hasChildNodes()) {
                try {
                    hydrateRoot(el, Root);
                } catch (e) {
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

        if (i18n.isInitialized) {
            setTimeout(startApp, 10);
        } else {
            i18n.on("initialized", startApp);
        }

        const ziggy = initialPageProps?.ziggy;
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
