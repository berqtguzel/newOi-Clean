import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
    // NOT: Laravel eklentisi bu outDir'i genellikle görmezden gelir ve public/build kullanır.
    // **DİKKAT:** Laravel eklentisi, bu ayar olmadan çıktı klasörünü yönetir.

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
    ssr: {
        // Hydration hatalarını önlemek için @inertiajs/react'in çözümlenmesi gerekiyor.
        noExternal: ['@inertiajs/react'],
        // GSAP'i derleme dışında tutmak için external ayarı.
        external: ['gsap'],
    },
    // DÜZELTME: Hata veren Ziggy alias kuralı kaldırıldı.
    // Artık Vite, node_modules içindeki ziggy-js'i otomatik çözecektir.
    resolve: {
        alias: {},
    },
})
