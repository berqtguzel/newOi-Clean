<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="theme-color" content="#0f172a" />

  <Head>
    <title inertia>{{ config('app.name', 'O&I CLEAN group GmbH') }}</title>

  <Head>
    <meta name="description" content="O&I CLEAN group GmbH – professionelle Reinigungsdienste in ganz Deutschland. Kontaktieren Sie uns für ein unverbindliches Angebot.">


    <link rel="icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
    <link rel="manifest" href="{{ asset('site.webmanifest') }}">


    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />


    <meta property="og:site_name" content="{{ config('app.name', 'O&I CLEAN group GmbH') }}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ config('app.name', 'O&I CLEAN group GmbH') }}">
    <meta property="og:description" content="Professionelle Gebäudereinigung, Unterhaltsreinigung und mehr. Jetzt kostenloses Angebot anfordern.">
    <meta property="og:url" content="{{ config('app.url') }}">
    <meta property="og:image" content="{{ asset('og-default.jpg') }}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ config('app.name', 'O&I CLEAN group GmbH') }}">
    <meta name="twitter:description" content="O&I CLEAN group GmbH – professionelle Reinigung deutschlandweit.">
    <meta name="twitter:image" content="{{ asset('og-default.jpg') }}">


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
 <html>
<script>
(function () {
  try {
    const ls = localStorage.getItem('theme');
    const supportsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = ls ? (ls === 'dark') : supportsDark;
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
</script>

    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
  </head>

  <body class="font-sans antialiased bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    @inertia
  </body>
</html>
