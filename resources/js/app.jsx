// resources/js/app.jsx
import "./bootstrap";
import "../css/app.css";

import React from "react";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import route from "../../vendor/tightenco/ziggy/dist/index.m.js"; // Ziggy (client)
import { ThemeProvider } from "./Context/ThemeContext";

const appName =
    window.document.getElementsByTagName("title")[0]?.innerText || "Laravel";

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

    // Hem .jsx hem .tsx sayfalarını yakala
    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.jsx`, {
            ...import.meta.glob("./Pages/**/*.jsx", { eager: true }),
            ...import.meta.glob("./Pages/**/*.tsx", { eager: true }),
        }),

    setup({ el, App, props }) {
        // Ziggy'yi window.route olarak sağlayalım (client tarafı)
        const ziggy = props.initialPage?.props?.ziggy;
        if (ziggy) {
            window.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...ziggy,
                    location: new URL(ziggy.location),
                });
        }

        const app = (
            <ThemeProvider>
                <App {...props} />
            </ThemeProvider>
        );

        // SSR açıksa hydrate, değilse createRoot
        if (el.hasChildNodes()) {
            hydrateRoot(el, app);
        } else {
            createRoot(el).render(app);
        }
    },

    progress: { color: "#4B5563" },
});
