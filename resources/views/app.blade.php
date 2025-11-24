<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    {{-- 1. TEMEL META AYARLARI --}}
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    {{-- 2. VITE + REACT (SIRAYI BOZMA) --}}
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    {{-- 3. PHP TARAFI: AYARLAR VE CACHE --}}
    @php
        use Illuminate\Support\Facades\Http;
        use Illuminate\Support\Facades\Cache;

        $apiBase = env('VITE_REMOTE_API_BASE', 'https://omerdogan.de/api');
        if (!str_ends_with($apiBase, '/v1')) {
            $apiBase .= '/v1';
        }

        $tenantId = env('VITE_REMOTE_TALENT_ID', 'oi_cleande_690e161c3a1dd');
        $locale   = app()->getLocale();

        // Tüm ayarları tek seferde ve cache ile çek
        $settings = Cache::remember("app_settings_{$tenantId}_{$locale}", 3600, function () use ($apiBase, $tenantId, $locale) {
            $data = [];

            foreach (['general', 'seo', 'branding', 'colors'] as $ep) {
                try {
                    $res = Http::withHeaders(['X-Tenant-ID' => $tenantId])
                        ->timeout(2)
                        ->get("{$apiBase}/settings/{$ep}", ['locale' => $locale]);

                    if ($res->successful()) {
                        $json = $res->json();
                        $data[$ep] = $json['data'] ?? $json;
                    }
                } catch (\Exception $e) {
                    $data[$ep] = [];
                }
            }

            return $data;
        });

        // Kısa alias’lar
        $gen   = $settings['general']  ?? [];
        $seo   = $settings['seo']      ?? [];
        $brand = $settings['branding'] ?? [];
        $cols  = $settings['colors']   ?? [];

        // Site temel bilgileri
        $siteName = $seo['meta_title']
            ?? $gen['site_name']
            ?? $brand['site_name']
            ?? config('app.name');

        $siteDesc = $seo['meta_description'] ?? $gen['site_description'] ?? '';
        $siteKeys = $seo['meta_keywords']    ?? $gen['site_keywords']    ?? '';

        // Favicon
        $favRaw  = $brand['favicon'] ?? $gen['favicon'] ?? null;
        $favicon = is_array($favRaw)
            ? ($favRaw['url'] ?? '/favicon.ico')
            : ($favRaw ?? '/favicon.ico');

        // OG görsel
        $ogImage = asset('og-default.jpg');
        if (!empty($seo['og_image'])) {
            $ogImage = is_array($seo['og_image'])
                ? ($seo['og_image']['url'] ?? $ogImage)
                : $seo['og_image'];
        }

        // Renk varsayılanları
        $defaultColors = [
            'site_primary_color'        => '#0284c7',
            'site_secondary_color'      => '#6c757d',
            'site_accent_color'         => '#f59e0b',
            'button_color'              => '#2563eb',
            'text_color'                => '#111827',
            'link_color'                => '#007bff',
            'background_color'          => '#ffffff',
            'header_background_color'   => '#ffffff',
            'footer_background_color'   => '#f8f9fa',
        ];

        $c = array_merge($defaultColors, $cols);

        // Gizli SEO Linkleri
        $seoHiddenLinks = Cache::remember("seo_links_{$tenantId}_{$locale}", 3600, function () use ($apiBase, $tenantId, $locale) {
            try {
                $res = Http::withHeaders(['X-Tenant-ID' => $tenantId])
                    ->timeout(2)
                    ->get("{$apiBase}/services", ['locale' => $locale]);

                if ($res->successful()) {
                    return collect($res->json()['data'] ?? [])
                        ->filter(fn ($i) => isset($i['category_name']) && strtolower($i['category_name']) === 'seo')
                        ->values()
                        ->all();
                }
            } catch (\Exception $e) {
                // log istersen buraya ekleyebilirsin
            }

            return [];
        });
    @endphp

    {{-- 4. SERVER TARAFI DEFAULT SEO (INERTIA İLE UYUMLU) --}}
    <title inertia>{{ $siteName }}</title>

    @if ($siteDesc)
        <meta name="description" content="{{ $siteDesc }}" inertia>
    @endif

    @if ($siteKeys)
        <meta name="keywords" content="{{ $siteKeys }}" inertia>
    @endif

    <meta name="theme-color" content="{{ $c['site_primary_color'] }}" />
    <meta name="robots" content="index, follow">

    <link rel="icon" href="{{ $favicon }}">
    <link rel="apple-touch-icon" href="{{ $favicon }}">

    {{-- Open Graph --}}
    <meta property="og:site_name" content="{{ $siteName }}" inertia>
    <meta property="og:title" content="{{ $seo['og_title'] ?? $siteName }}" inertia>
    <meta property="og:description" content="{{ $seo['og_description'] ?? $siteDesc }}" inertia>
    <meta property="og:image" content="{{ $ogImage }}" inertia>
    <meta name="twitter:card" content="summary_large_image">

    {{-- 5. KRİTİK CSS & GÖRÜNÜRLÜK --}}
    <style>
        :root {
            --site-primary-color: {{ $c['site_primary_color'] }};
            --site-secondary-color: {{ $c['site_secondary_color'] }};
            --site-accent-color: {{ $c['site_accent_color'] }};
            --button-color: {{ $c['button_color'] }};
            --text-color: {{ $c['text_color'] }};
            --link-color: {{ $c['link_color'] }};
            --background-color: {{ $c['background_color'] }};
            --header-background-color: {{ $c['header_background_color'] }};
            --footer-background-color: {{ $c['footer_background_color'] }};
        }

        html {
            background-color: {{ $c['background_color'] }};
        }

        body {
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }
    </style>

    {{-- 6. GLOBAL JS DEĞİŞKENLER --}}
    <script>
        window.__SITE_COLORS__ = @json($c);

        (function () {
            try {
                const ls = localStorage.getItem('theme');
                const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (ls === 'dark' || (!ls && dark)) {
                    document.documentElement.classList.add('dark');
                }
            } catch {}
        })();
    </script>

    {{-- Fontlar --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    {{-- Ziggy + Inertia Head --}}
    @routes
    @inertiaHead
</head>

<body class="font-sans antialiased">
    {{-- 7. GİZLİ SEO LİNKLERİ --}}
    @if (!empty($seoHiddenLinks))
        <div aria-hidden="true"
             style="position:absolute; left:-9999px; top:auto; width:1px; height:1px; overflow:hidden;">
            @foreach ($seoHiddenLinks as $link)
                @php
                    $href = !empty($link['slug']) ? $link['slug'] : $link['id'];
                    $href = str_starts_with($href, '/') ? $href : '/' . $href;
                @endphp
                <a href="{{ url($href) }}">{{ $link['name'] ?? 'Service' }}</a>
            @endforeach
        </div>
    @endif

    {{-- 8. ANA UYGULAMA --}}
    @inertia

    {{-- 9. BODY GÖRÜNÜRLÜK SCRİPTİ --}}
    <script>
        (function () {
            function show() {
                document.body.style.opacity = '1';
            }

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
