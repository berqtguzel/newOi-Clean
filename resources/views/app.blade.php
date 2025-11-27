<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"
      data-locale="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- React / Vite --}}
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    @php
        $data = $page['props']['layoutData'] ?? [];
        $colors = $data['colors'] ?? [];
        $siteName = $data['siteName'] ?? config('app.name');
        $siteDesc = $data['siteDesc'] ?? 'Professionelle Reinigungsdienste';
        $favicon = $data['favicon'] ?? '/favicon.ico';

        $currentUrl = url()->current();
        $languages = $data['settings']['general']['languages'] ?? [
            ['code' => 'de', 'label' => 'Deutsch'],
            ['code' => 'en', 'label' => 'English'],
            ['code' => 'tr', 'label' => 'Türkçe'],
        ];

        $slug = $page['props']['slug'] ?? request()->path();
    @endphp

    {{-- SEO --}}
    <title inertia>{{ $siteName }}</title>
    <meta name="description" content="{{ $siteDesc }}">

    {{-- Canonical URL --}}
    <link rel="canonical" href="{{ $currentUrl }}" />

    {{-- Multi-language hreflang --}}
    @foreach($languages as $lang)
        <link rel="alternate"
              href="{{ url($slug) }}?lang={{ $lang['code'] }}"
              hreflang="{{ $lang['code'] }}">
    @endforeach
    <link rel="alternate" hreflang="x-default" href="{{ $currentUrl }}" />

    {{-- Theme Color --}}
    <meta name="theme-color" content="{{ $colors['site_primary_color'] ?? '#0284c7' }}">

    {{-- OpenGraph --}}
    <meta property="og:title" content="{{ $siteName }}">
    <meta property="og:description" content="{{ $siteDesc }}">
    <meta property="og:image" content="{{ $data['ogImage'] ?? asset('og-default.jpg') }}">
    <meta property="og:url" content="{{ $currentUrl }}">

    {{-- Favicon --}}
    <link rel="icon" href="{{ $favicon }}">

    {{-- Dinamik Renkler --}}
    <style>
        :root {
            --site-primary-color: {{ $colors['site_primary_color'] ?? '#2563eb' }};
            --site-secondary-color: {{ $colors['site_secondary_color'] ?? '#6c757d' }};
            --site-accent-color: {{ $colors['site_accent_color'] ?? '#f59e0b' }};
            --button-color: {{ $colors['button_color'] ?? '#2563eb' }};
            --text-color: {{ $colors['text_color'] ?? '#111827' }};
            --link-color: {{ $colors['link_color'] ?? '#2563eb' }};
            --background-color: {{ $colors['background_color'] ?? '#ffffff' }};
            --header-background-color: {{ $colors['header_background_color'] ?? '#ffffff' }};
            --footer-background-color: {{ $colors['footer_background_color'] ?? '#f8f9fa' }};
        }
        html { background-color: var(--background-color); }
    </style>

    {{-- Global Settings to Window --}}
    <script>
        window.__SITE_COLORS__ = @json($colors);
        window.__TENANT_ID__ = "{{ $data['tenantId'] ?? '' }}";
    </script>

    @routes
    @inertiaHead
</head>

<body class="font-sans antialiased">

@if(!empty($seoLinks))
    <div aria-hidden="true"
         style="position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0,0,0,0)!important">
        @foreach($seoLinks as $link)
            <a href="{{ url($link['href']) }}">{{ $link['name'] }}</a>
        @endforeach
    </div>
@endif

    {{-- Inertia Root --}}
    @inertia
</body>
</html>
