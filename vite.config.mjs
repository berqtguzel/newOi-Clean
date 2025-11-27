// vite.config.js

import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

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
            
            // 💡 SSR YAPILANDIRMASINI BURAYA TAŞIYIN
            ssr: {
                external: ['react', 'react-dom', 'gsap'], 
                noExternal: ['@inertiajs/react'],
            }
        }),
    ],

    // 🛑 DİKKAT: Ana defineConfig seviyesindeki eski 'ssr' bloğunu SİLİN VEYA YORUM SATIRI YAPIN!
    // Eğer burada tutarsanız, çakışma devam edebilir.

    resolve: {
        alias: {},
    },
})