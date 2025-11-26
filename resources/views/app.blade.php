<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"
      data-locale="{{ app()->getLocale() }}">
<head>
    {{-- 1. TEMEL META AYARLARI --}}
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    {{--
        2. KRİTİK: REACT VE VITE YÜKLEME SIRASI
        Bu sıralama değiştirilmemelidir. ReactRefresh en üstte olmazsa "preamble" hatası alırsın.
    --}}
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    {{-- 3. PHP VERİ ÇEKME VE AYARLAR --}}
    @php
        use Illuminate\Support\Facades\Http;
        use Illuminate\Support\Facades\Cache;

        $apiBase = env('VITE_REMOTE_API_BASE', 'https://omerdogan.de/api');
        if (!str_ends_with($apiBase, '/v1')) { $apiBase .= '/v1'; }
        $tenantId = env('VITE_REMOTE_TALENT_ID', 'oi_cleande_690e161c3a1dd');
        $locale = app()->getLocale();

        // Tüm ayarları tek seferde ve cache ile çek
        $settings = Cache::remember("app_settings_{$tenantId}_{$locale}", 0, function () use ($apiBase, $tenantId, $locale) {
            $data = [];
            foreach (['general', 'seo', 'branding', 'colors'] as $ep) {
                try {
                    $res = Http::withHeaders(['X-Tenant-ID' => $tenantId])->timeout(2)->get("{$apiBase}/settings/{$ep}", ['locale' => $locale]);
                    if ($res->successful()) $data[$ep] = $res->json()['data'] ?? $res->json();
                } catch (\Exception $e) { $data[$ep] = []; }
            }
            return $data;
        });

        // Değişken atamaları
        $gen = $settings['general'] ?? [];
        $seo = $settings['seo'] ?? [];
        $brand = $settings['branding'] ?? [];
        $cols = $settings['colors'] ?? [];

        $siteName = $seo['meta_title'] ?? $gen['site_name'] ?? $brand['site_name'] ?? config('app.name');
        $siteDesc = $seo['meta_description'] ?? $gen['site_description'] ?? '';
        $siteKeys = $seo['meta_keywords'] ?? $gen['site_keywords'] ?? '';

        $favRaw = $brand['favicon'] ?? $gen['favicon'] ?? null;
        $favicon = is_array($favRaw) ? ($favRaw['url'] ?? '/favicon.ico') : ($favRaw ?? '/favicon.ico');

        $ogImage = asset('og-default.jpg');
        if (!empty($seo['og_image'])) {
            $ogImage = is_array($seo['og_image']) ? ($seo['og_image']['url'] ?? $ogImage) : $seo['og_image'];
        }

        // Renk varsayılanları
        $defaultColors = [
            'site_primary_color' => '#0284c7', 'site_secondary_color' => '#6c757d',
            'site_accent_color' => '#f59e0b', 'button_color' => '#2563eb',
            'text_color' => '#111827', 'link_color' => '#007bff',
            'background_color' => '#ffffff', 'header_background_color' => '#ffffff',
            'footer_background_color' => '#f8f9fa',
        ];
        $c = array_merge($defaultColors, $cols);

        // Gizli SEO Linkleri için veri - Sadece kategori "SEO" olan servisler
        $seoHiddenLinks = Cache::remember("seo_links_{$tenantId}_{$locale}", 0, function () use ($apiBase, $tenantId, $locale) {
            try {
                $res = Http::withHeaders(['X-Tenant-ID' => $tenantId])->timeout(5)->get("{$apiBase}/services", ['locale' => $locale]);

                if ($res->successful()) {
                    $json = $res->json();
                    // API yanıt yapısını kontrol et: data.services, data, veya direkt services
                    $services = $json['data']['services'] ?? $json['data'] ?? $json['services'] ?? [];

                    // Sadece kategori "SEO" olan servisleri filtrele
                    return collect($services)
                        ->filter(function($service) {
                            $categoryName = strtolower(trim($service['category_name'] ?? ''));
                            $categorySlug = strtolower(trim($service['category_slug'] ?? ''));

                            // Nested category objesi kontrolü
                            $nestedCategoryName = '';
                            $nestedCategorySlug = '';
                            if (isset($service['category']) && is_array($service['category'])) {
                                $nestedCategoryName = strtolower(trim($service['category']['name'] ?? ''));
                                $nestedCategorySlug = strtolower(trim($service['category']['slug'] ?? ''));
                            }

                            // Kategori adı veya slug'ı tam olarak "seo" olmalı
                            return (
                                $categoryName === 'seo' ||
                                $categorySlug === 'seo' ||
                                $nestedCategoryName === 'seo' ||
                                $nestedCategorySlug === 'seo'
                            );
                        })
                        ->map(function($service) {
                            // Link için slug veya id kullan
                            $slug = $service['slug'] ?? '';
                            $href = !empty($slug) ? '/' . ltrim($slug, '/') : null;

                            // İsim için title veya name kullan
                            $name = $service['title'] ?? $service['name'] ?? '';

                            return [
                                'href' => $href,
                                'name' => $name,
                                'slug' => $slug
                            ];
                        })
                        ->filter(function($link) {
                            // Sadece geçerli href ve name olan linkleri döndür
                            return !empty($link['href']) && !empty($link['name']);
                        })
                        ->values()
                        ->all();
                }
            } catch (\Exception $e) {
                // Hata durumunda boş array döndür
            }
            return [];
        });

    @endphp

    {{-- 4. SEO ETİKETLERİ (SERVER-SIDE DEFAULT) --}}
    <title inertia>{{ $siteName }}</title>
    <meta name="description" content="{{ $siteDesc }}">
    <meta name="keywords" content="{{ $siteKeys }}">
    <meta name="theme-color" content="{{ $c['site_primary_color'] }}" />
    <meta name="robots" content="index, follow">

    <link rel="icon" href="{{ $favicon }}">
    <link rel="apple-touch-icon" href="{{ $favicon }}">

    {{-- Open Graph --}}
    <meta property="og:site_name" content="{{ $siteName }}">
    <meta property="og:title" content="{{ $seo['og_title'] ?? $siteName }}">
    <meta property="og:description" content="{{ $seo['og_description'] ?? $siteDesc }}">
    <meta property="og:image" content="{{ $ogImage }}">
    <meta name="twitter:card" content="summary_large_image">

    {{-- 5. KRİTİK CSS & GÖRÜNÜRLÜK AYARLARI --}}
    <style>
        :root {

        --site-primary-color: {{ $c['site_primary_color'] ?? '#003dff' }};
        --site-secondary-color: {{ $c['site_secondary_color'] ?? '#006aff' }};
        --site-accent-color: {{ $c['site_accent_color'] ?? '#00b9ff' }};


        --button-color: {{ $c['button_color'] ?? '#005eff' }};
        --text-color: {{ $c['text_color'] ?? '#ffffff' }};
        --link-color: {{ $c['link_color'] ?? '#000000' }};


        --h1-color: {{ $c['h1_color'] ?? '#000000' }};
        --h2-color: {{ $c['h2_color'] ?? '#000000' }};
        --h3-color: {{ $c['h3_color'] ?? '#000000' }};


        --background-color: {{ $c['background_color'] ?? '#ffffff' }};
        --header-background-color: {{ $c['header_background_color'] ?? '#6387f1' }};
        --footer-background-color: {{ $c['footer_background_color'] ?? '#004cff' }};
    }

        html { background-color: {{ $c['background_color'] }}; }


        body { opacity: 0; transition: opacity 0.3s ease-in-out; }
    </style>

    {{-- 6. JS DEĞİŞKENLERİ --}}
    <script>
        window.__SITE_COLORS__ = @json($c);

        (function () {
            try {
                const ls = localStorage.getItem('theme');
                const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (ls === 'dark' || (!ls && dark)) document.documentElement.classList.add('dark');
            } catch {}
        })();
    </script>

    {{-- Fontlar --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    @routes
    @inertiaHead
</head>

<body class="font-sans antialiased">

    {{-- 7. GİZLİ SEO LİNKLERİ (KAYNAK KODDA GÖRÜNÜR) --}}
    @if (!empty($seoHiddenLinks))
        {{-- KESİN GİZLEME KURALI --}}
        <div aria-hidden="true" style="
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        ">
            @foreach ($seoHiddenLinks as $link)
                @php
                    $href = !empty($link['slug']) ? $link['slug'] : ($link['id'] ?? null);
                    $name = $link['name'] ?? $link['title'] ?? 'Service';

                    // Sadece geçerli slug'lar ve isimler için link oluştur
                    if (!$href || !$name) continue;

                    $href = str_starts_with($href, '/') ? $href : '/' . $href;
                @endphp
                <a href="{{ url($href) }}">{{ $name }}</a>
                &nbsp;
            @endforeach
        </div>
    @endif

    {{-- 8. ANA UYGULAMA --}}
    @inertia

    {{-- 9. GÖRÜNÜRLÜK SCRİPTİ (GÜVENLİ AÇILIŞ) --}}
    <script>
        (function() {
            function show() { document.body.style.opacity = '1'; }

            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                setTimeout(show, 10);
            } else {
                document.addEventListener('DOMContentLoaded', show);
            }


            setTimeout(show, 500);
        })();
    </script>
</body>
</html>
