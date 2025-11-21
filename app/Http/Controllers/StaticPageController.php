<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class StaticPageController extends Controller
{
    public function show(string $slug)
    {
        // 1) Statik sayfalar
        $staticSlugs = [
            'uber-uns',
            'qualitatsmanagement',
            'mitarbeiter-schulungen',
            'haufig-gestellte-fragen-faq',
            'datenschutzhinweise',
            'stockfotos',
            'impressum',
        ];

        if (in_array($slug, $staticSlugs, true)) {
            return Inertia::render('StaticPage', [
                'slug' => $slug,
                'meta' => [
                    'title'       => 'O&I CLEAN group GmbH',
                    'description' => 'Professionelle Reinigungsdienstleistungen',
                    'canonical'   => url()->current(),
                ],
            ]);
        }

        // 2) LOKASYON SLUG mu? (Locations/Show.jsx)
        if ($this->isLocationSlug($slug)) {
            return Inertia::render('Locations/Show', [
                'slug' => $slug,
                'page' => [],        // istersen burada ekstra props gönderebilirsin
            ]);
        }
return Inertia::render('Services/Show', [
    'slug' => $slug,
    'page' => [],
]);
    }

    protected function isLocationSlug(string $slug): bool
    {

        $locationPrefixes = [
            'gebaudereinigung-',
            'gebaudereinigung-in-',
            'building-cleaning-',
        ];

        foreach ($locationPrefixes as $prefix) {

            if (str_starts_with($slug, $prefix)) {
                return true;
            }


        }

        return false;
    }
}
