<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-locale="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    {{-- React Vite --}}
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    @php
        use Illuminate\Support\Str;

        $props = $page['props'] ?? [];
        $layout = $props['layoutData'] ?? [];

        $settings = $layout['settings'] ?? [];
        $general = $settings['general'] ?? [];
        $seo = $settings['seo'] ?? [];

        $siteName = $layout['siteName'] ?? config('app.name', 'Website');

        // 🔥 React Head’den gelen meta override
        $meta = $props['meta'] ?? [];

        $slug = $props['slug'] ?? request()->path();
        $currentUrl = url()->current();

        // === SEO Title ===
        $finalTitle =
            $meta['title']
            ?? $seo['meta_title']
            ?? $siteName;

        $finalTitle = Str::limit(strip_tags($finalTitle), 60);

        // === Description ===
        $finalDesc =
            $meta['description']
            ?? $seo['meta_description']
            ?? $general['site_description']
            ?? '';

        $finalDesc = Str::limit(strip_tags($finalDesc), 160);

        // === Keywords ===
        $finalKeywords =
            $meta['keywords']
            ?? $seo['meta_keywords']
            ?? '';

        // === OG IMAGE ===
        $finalOgImage =
            $meta['ogImage']
            ?? $seo['og_image']
            ?? $layout['ogImage']
            ?? asset('og-default.jpg');

        // Languages
        $languages = $general['languages'] ?? [
            ['code' => 'de'],
            ['code' => 'en'],
            ['code' => 'tr'],
        ];

        // Colors + Favicon
        $colors = $layout['colors'] ?? [];
        $favicon = $layout['favicon'] ?? '/favicon.ico';
    @endphp
<title inertia>{{ $finalTitle }}</title>
    <meta name="description" content="{{ $finalDesc }}" inertia>
    @if($finalKeywords)
<meta name="keywords" content="{{ $finalKeywords }}" inertia>
    @endif
<link rel="canonical" href="{{ $currentUrl }}" inertia/>
    <meta property="og:type" content="website" inertia>
    <meta property="og:site_name" content="{{ $siteName }}" inertia>
    <meta property="og:title" content="{{ $finalTitle }}" inertia>
    <meta property="og:description" content="{{ $finalDesc }}" inertia>
    <meta property="og:url" content="{{ $currentUrl }}" inertia>
    <meta property="og:image" content="{{ $finalOgImage }}" inertia>
    <meta name="twitter:card" content="summary_large_image" inertia>
    <meta name="twitter:title" content="{{ $finalTitle }}" inertia>
    <meta name="twitter:description" content="{{ $finalDesc }}" inertia>
    <meta name="twitter:image" content="{{ $finalOgImage }}" inertia>
    @foreach($languages as $lang)
    <link rel="alternate" hreflang="{{ $lang['code'] }}" href="{{ url($slug) }}?lang={{ $lang['code'] }}" />
    @endforeach
    <link rel="alternate" hreflang="x-default" href="{{ $currentUrl }}" />
    <meta name="theme-color"content="{{ $colors['site_primary_color'] ?? '#2563eb' }}">
    <style>
        :root {
            --site-primary-color: {{ $colors['site_primary_color'] ?? '#2563eb' }};
            --site-secondary-color: {{ $colors['site_secondary_color'] ?? '#6c757d' }};
            --site-accent-color: {{ $colors['site_accent_color'] ?? '#f59e0b' }};
            --button-color: {{ $colors['button_color'] ?? '#2563eb' }};
            --text-color: {{ $colors['text_color'] ?? '#111827' }};
            --h1_color : {{ $colors['h1_color'] ?? '#111827' }};
            --h2_color : {{ $colors['h2_color'] ?? '#111827' }};
            --h3_color : {{ $colors['h3_color'] ?? '#111827' }};
            --link-color: {{ $colors['link_color'] ?? '#2563eb' }};
            --background-color: {{ $colors['background_color'] ?? '#ffffff' }};
            --header-background-color: {{ $colors['header_background_color'] ?? '#ffffff' }};
            --footer-background-color: {{ $colors['footer_background_color'] ?? '#f8f9fa' }};
        }
        html {
            background-color: var(--background-color);
        }
    </style>
    <script>
        window.__SITE_COLORS__ = @json($colors);
        window.__TENANT_ID__ = "{{ $layout['tenantId'] ?? '' }}";
    </script>

    @routes
    @inertiaHead
</head>
<body class="font-sans antialiased">
@if(!empty($seoLinks))
    <div aria-hidden="true" style="position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0,0,0,0)!important">
        @foreach($seoLinks as $link)
            <a href="{{ url($link['href']) }}">{{ $link['name'] }}</a>
        @endforeach
    </div>
@endif
@inertia
</body>
</html>
