import React from "react";
import ReactDOMServer from "react-dom/server";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
// DÜZELTME: SSR build hatasını çözmek için göreceli vendor import'u yerine
// named npm import kullanılıyor.
import { route } from "ziggy-js";

import { ThemeProvider as SSRThemeProvider } from "./Context/ThemeContext.ssr";
import i18n from "./i18n";

const appName = "O&I CLEAN group GmbH";

createServer(async (page) => {
    const backendLocale = page.props.locale || "de";

    if (i18n.language !== backendLocale) {
        try {
            await i18n.changeLanguage(backendLocale);
        } catch (e) {
            console.error(
                `[SSR] Failed to change language to ${backendLocale}:`,
                e
            );
        }
    }

    return await createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.jsx`,
                import.meta.glob("./Pages/**/*.jsx")
            ),
        setup: ({ App, props }) => {
            // Ziggy route helper'ı artık named import'tan gelen 'route' fonksiyonunu kullanıyor
            global.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...page.props.ziggy,
                    location: new URL(page.props.ziggy.location),
                });

            return (
                <SSRThemeProvider initial="light">
                    <App {...props} />
                </SSRThemeProvider>
            );
        },
    });
});
