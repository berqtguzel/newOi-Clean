import "./bootstrap";
import "../css/app.css";
import "../css/theme.css";
import "../css/loading.css";
import "../css/404.css";
import "./i18n";

import React from "react";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import route from "../../vendor/tightenco/ziggy/dist/index.m.js";
import { ThemeProvider } from "./Context/ThemeContext";

/*
|--------------------------------------------------------------------------
| 0. BODY'YI FOUC ENGELLEMEK İÇİN GİZLE
|--------------------------------------------------------------------------
*/
document.documentElement.style.visibility = "hidden";

/*
|--------------------------------------------------------------------------
| 1. Renkleri Uygula
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
    } catch (e) {}
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
| 2. Dark Mode başlangıç modu
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
| 3. INERTIA APP
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
        const ziggy = props.initialPage?.props?.ziggy;
        if (ziggy) {
            window.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...ziggy,
                    location: new URL(ziggy.location),
                });
        }

        const initialTheme = getInitialTheme();

        const Root = (
            <ThemeProvider initial={initialTheme}>
                <App {...props} />
            </ThemeProvider>
        );

        /*
        |--------------------------------------------------------------------------
        | 4. Rehidrasyon bittiğinde FOUC'i tamamen kaldır
        |--------------------------------------------------------------------------
        */
        requestAnimationFrame(() => {
            document.documentElement.style.visibility = "visible";
        });

        if (el.hasChildNodes()) {
            hydrateRoot(el, Root);
        } else {
            createRoot(el).render(Root);
        }
    },

    /*
    |--------------------------------------------------------------------------
    | 5. Inertia Progress Bar
    |--------------------------------------------------------------------------
    */
    progress: {
        color: "var(--site-primary-color)",
        delay: 80, // flicker azaltır
    },
});
