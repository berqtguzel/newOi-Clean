import "./bootstrap";
import "../css/app.css";
import "../css/theme.css";
import "../css/loading.css";
import "../css/404.css";
import "./i18n";

import React from "react";
import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { ThemeProvider } from "./Context/ThemeContext";

const APP_NAME = "O&I CLEAN group GmbH";

createInertiaApp({
    title: (title) => (title ? `${title} - ${APP_NAME}` : APP_NAME),

    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.jsx`, {
            ...import.meta.glob("./Pages/**/*.jsx"),
            ...import.meta.glob("./Pages/**/*.tsx"),
        }),

    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider initial={props?.initialPage?.props?.theme}>
                <App {...props} />
            </ThemeProvider>
        );
    },

    progress: {
        color: "var(--site-primary-color)",
        delay: 80,
        showSpinner: false,
    },

    swapOptions: {
        preserveState: true,
        preserveScroll: true,
        resetScroll: false,
    },
});
