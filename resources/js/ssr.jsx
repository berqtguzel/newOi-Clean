// resources/js/ssr.jsx
import React from "react";
import ReactDOMServer from "react-dom/server";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import route from "../../vendor/tightenco/ziggy/dist/index.m.js";

const appName = "Laravel";

createServer((page) =>
    createInertiaApp({
        page,
        render: (element) => ReactDOMServer.renderToString(element),
        title: (title) => (title ? `${title} - ${appName}` : appName),

        // Hem .jsx hem .tsx sayfaları destekle
        resolve: (name) =>
            resolvePageComponent(`./Pages/${name}.jsx`, {
                ...import.meta.glob("./Pages/**/*.jsx", { eager: true }),
                ...import.meta.glob("./Pages/**/*.tsx", { eager: true }),
            }),

        setup: ({ App, props }) => {
            // Ziggy'yi SSR sırasında global'e ekle
            global.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...page.props.ziggy,
                    location: new URL(page.props.ziggy.location),
                });

            return <App {...props} />;
        },
    })
);
