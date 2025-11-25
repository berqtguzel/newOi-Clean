import React from "react";
import ReactDOMServer from "react-dom/server";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import route from "../../vendor/tightenco/ziggy/dist/index.m";

import { ThemeProvider as SSRThemeProvider } from "./Context/ThemeContext.ssr";
import i18n from "./i18n";

const appName = "O&I CLEAN group GmbH";

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.jsx`,
                import.meta.glob("./Pages/**/*.jsx")
            ),
        setup: ({ App, props }) => {
            global.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...page.props.ziggy,
                    location: new URL(page.props.ziggy.location),
                });

            // HYDRATION FIX: Server-side'da i18n'i backend locale ile senkron başlat
            const backendLocale = props?.locale || "de";
            // Senkron olarak language'i ayarla (changeLanguage asenkron, bu yüzden direkt set ediyoruz)
            if (backendLocale && i18n.language !== backendLocale) {
                i18n.language = backendLocale;
            }

            return (
                <SSRThemeProvider initial="light">
                    <App {...props} />
                </SSRThemeProvider>
            );
        },
    })
);
