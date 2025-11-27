<?php

namespace App\Providers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $tenantId = env('VITE_REMOTE_TENANT_ID', '');
        $locale = app()->getLocale();
        $apiBase = env('VITE_REMOTE_API_BASE', 'https://omerdogan.de/api');

        if (!str_ends_with($apiBase, '/v1')) {
            $apiBase .= '/v1';
        }

        // Settings fetch
        $settings = [];
        foreach (['general', 'seo', 'branding', 'colors'] as $ep) {
            try {
                $res = Http::withHeaders(['X-Tenant-ID' => $tenantId])
                    ->timeout(3)
                    ->get("$apiBase/settings/$ep", ['locale' => $locale]);

                $settings[$ep] = $res->successful()
                    ? ($res->json()['data'] ?? [])
                    : [];
            } catch (\Throwable $e) {
                $settings[$ep] = [];
            }
        }

        $general   = $settings['general'] ?? [];
        $seo       = $settings['seo'] ?? [];
        $branding  = $settings['branding'] ?? [];
        $colors    = $settings['colors'] ?? [];

        // Normalize Colors -- RGB → HEX
        $defaults = [
            'site_primary_color' => '#0d6efd',
            'site_secondary_color' => '#6c757d',
            'site_accent_color' => '#f59e0b',
            'button_color' => '#0d6efd',
            'text_color' => '#111827',
            'h1_color' => '#111827',
            'h2_color' => '#111827',
            'h3_color' => '#111827',
            'link_color' => '#0d6efd',
            'background_color' => '#ffffff',
            'header_background_color' => '#ffffff',
            'footer_background_color' => '#f8f9fa',
        ];

        foreach ($defaults as $key => $fallback) {
            $val = $colors[$key] ?? $fallback;
            if (preg_match('/rgb\((\d+),\s*(\d+),\s*(\d+)\)/', $val, $m)) {
                $val = sprintf("#%02x%02x%02x", $m[1], $m[2], $m[3]);
            }
            $colors[$key] = $val;
        }


        // Meta Info
        $siteName = $seo['meta_title'] ?? $general['site_name'] ?? config('app.name');
        $siteDesc = $seo['meta_description'] ?? $general['site_description'] ?? 'Professionelle Reinigungsdienste';
        $favicon  = $branding['favicon']['url'] ?? '/favicon.ico';


        // 🚀 SEO Category Services Fetch
        try {
            $services = Http::withHeaders(['X-Tenant-ID' => $tenantId])
                ->timeout(3)
                ->get("$apiBase/services", ['limit' => 200, 'locale' => $locale])
                ->json()['data'] ?? [];
        } catch (\Throwable $e) {
            $services = [];
        }

        $seoLinks = collect($services)
            ->filter(fn($s) => strtolower($s['category_name'] ?? '') === 'seo')
            ->map(fn($s) => [
                'href' => '/' . ltrim($s['slug'] ?? '', '/'),
                'name' => strip_tags(
                    collect($s['translations'] ?? [])
                        ->firstWhere('language_code', $locale)['name']
                    ?? $s['name']
                    ?? $s['slug']
                ),
            ])
            ->values()
            ->toArray();


        // 🔥 SSR Blade
        View::share([
            'siteName' => $siteName,
            'siteDesc' => $siteDesc,
            'favicon' => $favicon,
            'colors' => $colors,
            'c' => $colors,
            'seoLinks' => $seoLinks,
        ]);

        // 🔥 Inertia CSR
        Inertia::share([
            'layoutData' => [
                'tenantId' => $tenantId,
                'locale' => $locale,
                'settings' => $settings,
                'siteName' => $siteName,
                'favicon' => $favicon,
                'colors' => $colors,
                'seoLinks' => $seoLinks,
            ]
        ]);
    }
}
