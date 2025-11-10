// resources/js/app.jsx
import "./bootstrap";
import "../css/app.css";

import React from "react";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import route from "../../vendor/tightenco/ziggy/dist/index.m.js";
import { ThemeProvider } from "./Context/ThemeContext";

// Uygulama adı sabit – <title inertia> DOM’undan okumaya gerek yok
const APP_NAME = "O&I CLEAN group GmbH";

// İstemci tarafında başlangıç teması: localStorage > system > light
function getInitialTheme() {
    if (typeof window === "undefined") return "light";
    try {
        const saved = localStorage.getItem("theme"); // "dark" | "light" | null
        if (saved === "dark" || saved === "light") return saved;
        const prefersDark = window.matchMedia?.(
            "(prefers-color-scheme: dark)"
        )?.matches;
        return prefersDark ? "dark" : "light";
    } catch {
        return "light";
    }
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${APP_NAME}` : APP_NAME),

    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.jsx`, {
            ...import.meta.glob("./Pages/**/*.jsx", { eager: true }),
            ...import.meta.glob("./Pages/**/*.tsx", { eager: true }),
        }),

    setup({ el, App, props }) {
        // Ziggy: global route() fonksiyonu
        const ziggy = props.initialPage?.props?.ziggy;
        if (ziggy) {
            window.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...ziggy,
                    location: new URL(ziggy.location),
                });
        }

        // Başlangıç temasını belirle
        const initialTheme = getInitialTheme();

        const Root = (
            <ThemeProvider initial={initialTheme}>
                <App {...props} />
            </ThemeProvider>
        );

        if (el.hasChildNodes()) {
            hydrateRoot(el, Root);
        } else {
            createRoot(el).render(Root);
        }
    },

    progress: { color: "#4B5563" },
});
