// vite.config.js
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.jsx',
            ],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
    ],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },

    // 👉 SSR ayarı buraya gelecek
    ssr: {
        noExternal: ['@inertiajs/react'],
    },
})
