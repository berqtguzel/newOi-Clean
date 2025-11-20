<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class StaticPageController extends Controller
{
    public function show(string $slug)
    {
        $allowedSlugs = [
            'uber-uns',
            'qualitatsmanagement',
            'mitarbeiter-schulungen',
            'haufig-gestellte-fragen-faq',
            'datenschutzhinweise',
            'stockfotos',
            'impressum',
        ];

        abort_unless(in_array($slug, $allowedSlugs, true), 404);

        // Meta başlığını istersen şimdilik generic tut
        $meta = [
            'title'       => 'O&I CLEAN group GmbH',
            'description' => 'Professionelle Reinigungsdienstleistungen',
            'canonical'   => url()->current(),
        ];

        return Inertia::render('StaticPage', [
            'slug' => $slug,
            'meta' => $meta,
        ]);
    }
}
