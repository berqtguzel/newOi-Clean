<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class StaticPageController extends Controller
{
    public function show(string $slug)
    {
        $slugLower = strtolower($slug);

        // Static pages (content from local i18n/static JSON)
        $staticSlugs = [
            'uber-uns',
            'qualitatsmanagement',
            'mitarbeiter-schulungen',
            'haufig-gestellte-fragen-faq',
            'datenschutzhinweise',
            'stockfotos',
            'impressum',
            'cookie-policy'
        ];

        if (in_array($slugLower, $staticSlugs, true)) {
            return Inertia::render('StaticPage', [
                'slug' => $slugLower,
                'meta' => [
                    'title'       => 'O&I CLEAN group GmbH',
                    'description' => 'Professionelle Reinigungsdienstleistungen',
                    'canonical'   => url()->current(),
                ],
            ]);
        }

        //-------------------------------------
        // DASHBOARD'DAN TÜM SERVISLERI ÇEK
        //-------------------------------------
        $tenantId = config('services.omr.talent_id');
        $base = rtrim(config('services.omr.base'), '/');

        $resp = Http::withHeaders([
            'X-Tenant-ID' => $tenantId,
            'Accept' => 'application/json',
        ])->get($base . '/v1/services?per_page=500');

        $services = $resp->json()['data'] ?? [];

        //-------------------------------------
        // SLUG EŞLEME (gebaudereinigung-aalen → aalen)
        //-------------------------------------
        $normalizedMap = [];
        foreach ($services as $svc) {
            $original = strtolower($svc['slug']);
            $normalized = $this->normalizeSlug($original);
            $normalizedMap[$normalized] = $original;
        }

        //-------------------------------------
        // BU SLUG NEREDEN GELIYOR?
        //-------------------------------------

        // 1) ANA SERVISLER (Services/Show.jsx)
        $mainServices = [
            'gebaudereinigung',
            'wohnungsrenovierung',
            'hotelreinigung'
        ];

        if (in_array($slugLower, $mainServices)) {
            return Inertia::render('Services/Show', [
                'slug' => $slugLower
            ]);
        }

        // 2) ŞEHİR SLUG’U MU? (Locations/Show.jsx)
        if (array_key_exists($slugLower, $normalizedMap)) {
            return Inertia::render('Locations/Show', [
                'slug' => $normalizedMap[$slugLower]   // gerçek slug
            ]);
        }

        // 3) Hiçbir şeye uymuyorsa → 404
        abort(404);
    }

    protected function normalizeSlug(string $slug)
    {
        if (str_contains($slug, '-')) {
            $parts = explode('-', $slug);
            array_shift($parts);
            return implode('-', $parts);
        }

        return $slug;
    }
}
