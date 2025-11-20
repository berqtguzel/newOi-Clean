<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="theme-color" content="#0f172a" />

    {{-- Inertia başlık alanı --}}
    <title inertia>{{ config('app.name', 'O&I CLEAN group GmbH') }}</title>

    {{-- Panelden gelen renkler --}}
    @php($c = (array) getSiteColors())

    {{-- JS tarafında da kullanmak için --}}
    <script>
        window.__SITE_COLORS__ = @json($c);
    </script>

    {{-- LIGHT & DARK tokenları --}}
    <style>
        :root{
            --brand-base: {{ $c['site_primary_color'] ?? '#0284c7' }};
            --secondary-base: {{ $c['site_secondary_color'] ?? '#6c757d' }};
            --accent-base: {{ $c['site_accent_color'] ?? '#f59e0b' }};
            --button-base: {{ $c['button_color'] ?? ($c['site_primary_color'] ?? '#2563eb') }};
            --text-base: {{ $c['text_color'] ?? '#111827' }};
            --link-base: {{ $c['link_color'] ?? '#007bff' }};
            --bg-base: {{ $c['background_color'] ?? '#ffffff' }};
            --header-bg-base: {{ $c['header_background_color'] ?? '#ffffff' }};
            --footer-bg-base: {{ $c['footer_background_color'] ?? '#f8f9fa' }};

            --site-primary-color: var(--brand-base);
            --site-secondary-color: var(--secondary-base);
            --site-accent-color: var(--accent-base);
            --button-color: var(--button-base);
            --text-color: var(--text-base);
            --link-color: var(--link-base);

            --surface: var(--bg-base);
            --header-surface: var(--header-bg-base);
            --footer-surface: var(--footer-bg-base);

            --dropdown-bg: #ffffff;
            --dropdown-border: #e2e8f0;
            --ghost-bg: rgba(0,0,0,.04);
            --glass: rgba(255,255,255,.78);
        }

        :root.dark{
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
        body {
            margin: 0;
            color: var(--text-color);
            background: var(--surface);
        }

        a { color: var(--link-color); }

        .btn-primary{
            background: var(--button-color);
            border-color: var(--button-color);
            color:#fff;
        }
        .btn-primary:hover{ opacity:.9; }

        .topbar{
            background: linear-gradient(
                90deg,
                color-mix(in srgb, var(--site-primary-color) 92%, #000 8%),
                var(--site-primary-color)
            );
            color:#fff;
        }
    </style>

    {{-- Global (fallback) Meta / OG --}}
    <meta name="description"
          content="O&I CLEAN group GmbH – professionelle Reinigungsdienste in ganz Deutschland. Kontaktieren Sie uns für ein unverbindliches Angebot.">

    <link rel="icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
    <link rel="manifest" href="{{ asset('site.webmanifest') }}">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <meta property="og:site_name" content="{{ config('app.name', 'O&I CLEAN group GmbH') }}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ config('app.name', 'O&I CLEAN group GmbH') }}">
    <meta property="og:description"
          content="Professionelle Gebäudereinigung, Unterhaltsreinigung und mehr. Jetzt kostenloses Angebot anfordern.">
    <meta property="og:url" content="{{ config('app.url') }}">
    <meta property="og:image" content="{{ asset('og-default.jpg') }}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ config('app.name', 'O&I CLEAN group GmbH') }}">
    <meta name="twitter:description"
          content="O&I CLEAN group GmbH – professionelle Reinigung deutschlandweit.">
    <meta name="twitter:image" content="{{ asset('og-default.jpg') }}">

    {{-- JSON-LD Organization Schema --}}
    <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "{{ config('app.name', 'O&I CLEAN group GmbH') }}",
          "url": "{{ config('app.url') }}",
          "logo": "{{ asset('logo.png') }}",
          "contactPoint": [{
            "@type": "ContactPoint",
            "telephone": "+49 40 0000000",
            "contactType": "customer service",
            "areaServed": "DE",
            "availableLanguage": "German"
          }]
        }
    </script>

    {{-- İlk boyamada dark sınıfını ekle (FOUC önleme) --}}
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

    {{-- Ziggy --}}
    @routes

    {{-- Vite / React --}}
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    {{-- Inertia sayfa bazlı <Head> --}}
    @inertiaHead
</head>

<body class="font-sans antialiased">

    {{-- GİZLİ SEO LİNKLERİ – sadece kaynakta gözüksün, ekranda görünmesin --}}
    @php($seoHiddenLinks = config('seo.hidden_links', []))

    @if (!empty($seoHiddenLinks))
        <div aria-hidden="true"
             style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">
            @foreach ($seoHiddenLinks as $link)
                @if (!empty($link['href']) && !empty($link['label']))
                    <a href="{{ $link['href'] }}" style="position:absolute;left:-9999px;">
                        {{ $link['label'] }}
                    </a>
                @endif
            @endforeach
        </div>
    @endif

    {{-- Inertia root --}}
    @inertia
</body>
</html>
