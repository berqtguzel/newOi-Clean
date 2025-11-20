import React from "react";
import ReactDOMServer from "react-dom/server";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import route from "../../vendor/tightenco/ziggy/dist/index.m";

import { ThemeProvider as SSRThemeProvider } from "./Context/ThemeContext.ssr";

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

            return (
                <SSRThemeProvider initial="light">
                    <App {...props} />
                </SSRThemeProvider>
            );
        },
    })
);
