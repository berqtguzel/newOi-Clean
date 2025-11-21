<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    {{--
       ==========================================================================
       1. API'DEN VERİLERİ ÇEKME (SUNUCU TARAFI - PHP)
       ==========================================================================
       .env dosyasındaki VITE_REMOTE_ bilgileriyle API'ye istek atar.
    --}}
    @php
        use Illuminate\Support\Facades\Http;
        use Illuminate\Support\Facades\Cache;

        // 1. .env Değerlerini Al
        $apiBase = env('VITE_REMOTE_API_BASE', 'https://omerdogan.de/api');
        // API URL'sinin sonuna /v1 ekleyelim (eğer yoksa)
        if (!str_ends_with($apiBase, '/v1')) {
            $apiBase .= '/v1';
        }

        $tenantId = env('VITE_REMOTE_TALENT_ID', 'oi_cleande_690e161c3a1dd');
        $locale = app()->getLocale();

        // 2. Verileri Çek ve Cachele (1 Saat)
$settings = Cache::remember("app_blade_settings_{$tenantId}_{$locale}", 1, function () use ($apiBase, $tenantId, $locale) {


            $data = [];
            $endpoints = ['general', 'seo', 'branding', 'colors'];

            foreach ($endpoints as $ep) {
                try {
                    $response = Http::withHeaders([
                        'X-Tenant-ID' => $tenantId
                    ])->timeout(5)->get("{$apiBase}/settings/{$ep}", [
                        'locale' => $locale
                    ]);

                    if ($response->successful()) {
                        $json = $response->json();
                        // API bazen data.data, bazen direkt data dönüyor, kontrol et
                        $data[$ep] = $json['data'] ?? $json;
                    }
                } catch (\Exception $e) {
                    $data[$ep] = [];
                }
            }
            return $data;
        });

        // 3. Değişkenleri Ata
        $gen   = $settings['general'] ?? [];
        $seo   = $settings['seo'] ?? [];
        $brand = $settings['branding'] ?? [];
        $cols  = $settings['colors'] ?? [];

        // Site İsmi
        $siteName = $seo['meta_title'] ?? $gen['site_name'] ?? $brand['site_name'] ?? config('app.name');

        // Açıklama
        $siteDesc = $seo['meta_description'] ?? $gen['site_description'] ?? 'Professionelle Gebäudereinigung.';

        // Anahtar Kelimeler
        $siteKeys = $seo['meta_keywords'] ?? $gen['site_keywords'] ?? '';

        // Favicon (Obje veya String kontrolü)
        $favRaw = $brand['favicon'] ?? $gen['favicon'] ?? null;
        $favicon = is_array($favRaw) ? ($favRaw['url'] ?? asset('favicon.ico')) : ($favRaw ?? asset('favicon.ico'));

        // Open Graph Resim
        $ogImage = asset('og-default.jpg');
        if (!empty($seo['og_image'])) {
            $ogImage = is_array($seo['og_image']) ? ($seo['og_image']['url'] ?? $ogImage) : $seo['og_image'];
        }

        // 4. Renkleri Hazırla (Varsayılanlar + API'den Gelenler)
        $defaultColors = [
            'site_primary_color' => '#0284c7',
            'site_secondary_color' => '#6c757d',
            'site_accent_color' => '#f59e0b',
            'button_color' => '#2563eb',
            'text_color' => '#111827',
            'link_color' => '#007bff',
            'background_color' => '#ffffff',
            'header_background_color' => '#ffffff',
            'footer_background_color' => '#f8f9fa',
        ];

        // API'den renk gelmişse üzerine yaz
        $c = array_merge($defaultColors, $cols);
    @endphp

    {{--
       ==========================================================================
       2. META ETİKETLERİ (HTML HEAD - SEO)
       ==========================================================================
    --}}
    <title inertia>{{ $siteName }}</title>
    <meta name="description" content="{{ $siteDesc }}">
    <meta name="keywords" content="{{ $siteKeys }}">
    <meta name="author" content="{{ $siteName }}">
    <meta name="robots" content="index, follow, max-image-preview:large">

    {{-- Tema Rengi (Mobilde Tarayıcı Çubuğu Rengi) --}}
    <meta name="theme-color" content="{{ $c['site_primary_color'] }}" />

    {{-- Favicon --}}
    <link rel="icon" href="{{ $favicon }}" type="image/x-icon">
    <link rel="shortcut icon" href="{{ $favicon }}" type="image/x-icon">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ $favicon }}">

    {{-- Open Graph (Facebook/LinkedIn/WhatsApp) --}}
    <meta property="og:site_name" content="{{ $siteName }}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ $seo['og_title'] ?? $siteName }}">
    <meta property="og:description" content="{{ $seo['og_description'] ?? $siteDesc }}">
    <meta property="og:url" content="{{ config('app.url') }}">
    <meta property="og:image" content="{{ $ogImage }}">

    {{-- Twitter Card --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $seo['og_title'] ?? $siteName }}">
    <meta name="twitter:description" content="{{ $seo['og_description'] ?? $siteDesc }}">
    <meta name="twitter:image" content="{{ $ogImage }}">

    {{-- JSON-LD Schema --}}
    <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "{{ $siteName }}",
          "url": "{{ config('app.url') }}",
          "logo": "{{ $favicon }}",
          "description": "{{ $siteDesc }}",
          "contactPoint": [{
            "@type": "ContactPoint",
            "telephone": "+49 40 0000000",
            "contactType": "customer service",
            "areaServed": "DE",
            "availableLanguage": "German"
          }]
        }
    </script>

    {{--
       ==========================================================================
       3. JS & CSS AYARLARI (ÖNEMLİ: SAKIN SİLME)
       ==========================================================================
    --}}

    {{-- JS tarafına renkleri aktar (app.jsx burada okuyacak) --}}
    <script>
        window.__SITE_COLORS__ = @json($c);
    </script>

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    {{-- CSS Değişkenleri (Sayfa ilk açıldığında renklerin doğru olması için şart) --}}
    <style>
        :root {
            --brand-base: {{ $c['site_primary_color'] }};
            --secondary-base: {{ $c['site_secondary_color'] }};
            --accent-base: {{ $c['site_accent_color'] }};
            --button-base: {{ $c['button_color'] }};
            --text-base: {{ $c['text_color'] }};
            --link-base: {{ $c['link_color'] }};
            --bg-base: {{ $c['background_color'] }};
            --header-bg-base: {{ $c['header_background_color'] }};
            --footer-bg-base: {{ $c['footer_background_color'] }};

            /* Tailwind Mapping */
            --site-primary-color: var(--brand-base);
            --site-secondary-color: var(--secondary-base);
            --site-accent-color: var(--accent-base);
            --button-color: var(--button-base);
            --text-color: var(--text-base);
            --link-color: var(--link-base);

            --surface: var(--bg-base);
            --header-surface: var(--header-bg-base);
            --footer-surface: var(--footer-bg-base);

            /* Sabitler */
            --dropdown-bg: #ffffff;
            --dropdown-border: #e2e8f0;
            --ghost-bg: rgba(0,0,0,.04);
            --glass: rgba(255,255,255,.78);
        }

        :root.dark {
            --surface: #0f172a;
            --header-surface: #0f172a;
            --footer-surface: #0f172a;
            --dropdown-bg: #0b0c10;
            --dropdown-border: #1e293b;
            --glass: rgba(15,23,42,.8);
            --ghost-bg: rgba(255,255,255,.06);

            --text-color: color-mix(in srgb, #ffffff 86%, var(--text-base) 14%);
            --site-primary-color: color-mix(in srgb, var(--brand-base) 78%, #ffffff 22%);
            --site-secondary-color: color-mix(in srgb, var(--secondary-base) 78%, #ffffff 22%);
            --site-accent-color: color-mix(in srgb, var(--accent-base) 78%, #ffffff 22%);
            --button-color: color-mix(in srgb, var(--button-base) 78%, #ffffff 22%);
            --link-color: color-mix(in srgb, var(--link-base) 78%, #ffffff 22%);
        }

        html, body { height: 100%; }
        body { margin: 0; color: var(--text-color); background: var(--surface); }
        a { color: var(--link-color); }
        .btn-primary { background: var(--button-color); border-color: var(--button-color); color:#fff; }
        .btn-primary:hover { opacity:.9; }
        .topbar {
            background: linear-gradient(90deg, color-mix(in srgb, var(--site-primary-color) 92%, #000 8%), var(--site-primary-color));
            color:#fff;
        }
    </style>

    {{-- Dark Mode Script (FOUC Önleme) --}}
    <script>
        (function () {
            try {
                const ls = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = ls ? (ls === 'dark') : prefersDark;
                if (isDark) document.documentElement.classList.add('dark');
            } catch {}
        })();
    </script>

    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    {{-- GİZLİ SEO LİNKLERİ (Botlar için) --}}
    @php($seoHiddenLinks = config('seo.hidden_links', []))
    @if (!empty($seoHiddenLinks))
        <div aria-hidden="true" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">
            @foreach ($seoHiddenLinks as $link)
                @if (!empty($link['href']) && !empty($link['label']))
                    <a href="{{ $link['href'] }}" style="position:absolute;left:-9999px;">{{ $link['label'] }}</a>
                @endif
            @endforeach
        </div>
    @endif

    @inertia
</body>
</html>
