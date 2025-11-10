// resources/js/app.jsx
import "./bootstrap";
import "../css/app.css";

import React from "react";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import route from "../../vendor/tightenco/ziggy/dist/index.m.js";
import { ThemeProvider } from "./Context/ThemeContext";
// window.__SITE_COLORS__ Laravel'den geliyor
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
        console.error("Renkleri uygularken hata:", e);
    }
}

// 🌈 1️⃣ Backend'den gelen renkleri global değişkenlere uygula
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

// 🏷️ Uygulama adı
const APP_NAME = "O&I CLEAN group GmbH";

// 💡 Başlangıç temasını belirle
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

// ⚛️ Inertia uygulaması
createInertiaApp({
    title: (title) => (title ? `${title} - ${APP_NAME}` : APP_NAME),

    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.jsx`, {
            ...import.meta.glob("./Pages/**/*.jsx", { eager: true }),
            ...import.meta.glob("./Pages/**/*.tsx", { eager: true }),
        }),

    setup({ el, App, props }) {
        // 🔗 Ziggy route fonksiyonu global olarak tanımla
        const ziggy = props.initialPage?.props?.ziggy;
        if (ziggy) {
            window.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...ziggy,
                    location: new URL(ziggy.location),
                });
        }

        // 🌙 Tema belirle
        const initialTheme = getInitialTheme();

        // 🧩 React kökü
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

    progress: { color: "var(--site-primary-color)" }, // 🚀 progress bar da temaya göre renklenir
});
