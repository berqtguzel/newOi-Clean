<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ServicesController extends Controller
{
    public function index(Request $request)
    {

        $services = [
            [
                'slug' => 'wohnungsrenovierung',
                'title' => 'Wohnungsrenovierung',
                'excerpt' => 'Innenraum-Renovierung & schlüsselfertige Lösungen.',
                'image' => '/images/services/renovation.jpg',
                'icon'  => 'home',
            ],
            [
                'slug' => 'wohnungsreinigung',
                'title' => 'Wohnungsreinigung',
                'excerpt' => 'Gründliche, zuverlässige Reinigung.',
                'image' => '/images/services/cleaning.jpg',
                'icon'  => 'broom',
            ],
            [
                'slug' => 'warmedammung',
                'title' => 'Wärmedämmung',
                'excerpt' => 'Energieeffiziente Dämmungslösungen.',
                'image' => '/images/services/insulation.jpg',
                'icon'  => 'temp',
            ],
            [
                'slug' => 'verputzarbeiten',
                'title' => 'Verputz – Verputzarbeiten',
                'excerpt' => 'Hochwertige Oberflächen & Spachtelarbeiten.',
                'image' => '/images/services/plaster.jpg',
                'icon'  => 'roller',
            ],
            [
                'slug' => 'turen-und-fensterbau',
                'title' => 'Türen und Fensterbau',
                'excerpt' => 'Maßgefertigte Lösungen für Komfort & Effizienz.',
                'image' => '/images/services/windows.jpg',
                'icon'  => 'window',
            ],
            [
                'slug' => 'trockenbau',
                'title' => 'Trockenbau',
                'excerpt' => 'Flexible Raumgestaltung & moderne Innenarchitektur.',
                'image' => '/images/services/drywall.jpg',
                'icon'  => 'tools',
            ],
            [
                'slug' => 'teppichreinigung',
                'title' => 'Teppichreinigung',
                'excerpt' => 'Frische & hygienisch saubere Teppiche.',
                'image' => '/images/services/carpet-clean.jpg',
                'icon'  => 'brush',
            ],
            [
                'slug' => 'teppich-verlegen',
                'title' => 'Teppich Verlegen',
                'excerpt' => 'Perfektes Finish, lange Haltbarkeit.',
                'image' => '/images/services/carpet-lay.jpg',
                'icon'  => 'couch',
            ],
            [
                'slug' => 'tapezieren',
                'title' => 'Tapezieren – Tapezierarbeiten',
                'excerpt' => 'Kreative Wandgestaltung vom Profi.',
                'image' => '/images/services/wallpaper.jpg',
                'icon'  => 'roller',
            ],
        ];

        return Inertia::render('Services/Index', [
            'services'     => $services,
            'currentRoute' => 'services',
        ]);
    }

    public function show(string $slug)
    {

        $aliases = [
            'innenraum-renovierung-trockenbau' => 'trockenbau',

            'wohnungsrenovierung' => 'trockenbau',
        ];
        if (isset($aliases[$slug])) {
            $slug = $aliases[$slug];
        }


        $catalog = [
            'trockenbau' => [
                'title'    => 'Trockenbau',
                'subtitle' => 'Innovative Trockenbaulösungen für flexible Raumgestaltung.',
                'hero'     => ['image' => '/images/services/drywall.jpg', 'alt' => 'Trockenbau'],
                'sections' => [
                    ['heading' => 'Leistungen', 'body' => "Wände & Decken, Spachteln, Schallschutz, Brandschutz."],
                    ['heading' => 'Vorteile', 'body' => "Schnell, sauber, flexibel – ideal für Umbauten im Bestand."],
                ],
            ],
            'wohnungsreinigung' => [
                'title'    => 'Wohnungsreinigung',
                'subtitle' => 'Gründlich, zuverlässig, hygienisch.',
                'hero'     => ['image' => '/images/services/cleaning.jpg', 'alt' => 'Wohnungsreinigung'],
                'sections' => [
                    ['heading' => 'Unterhaltsreinigung', 'body' => "Bad, Küche, Wohnräume – individuell planbar."],
                ],
            ],
            'warmedammung' => [
                'title'    => 'Wärmedämmung',
                'subtitle' => 'Energieeffiziente Lösungen.',
                'hero'     => ['image' => '/images/services/insulation.jpg', 'alt' => 'Wärmedämmung'],
                'sections' => [
                    ['heading' => 'Materialien', 'body' => "Mineralwolle, EPS/XPS, Holzfaser – nach Bedarf."],
                ],
            ],
            'verputzarbeiten' => [
                'title'    => 'Verputz – Verputzarbeiten',
                'subtitle' => 'Perfekte Wandoberflächen.',
                'hero'     => ['image' => '/images/services/plaster.jpg', 'alt' => 'Verputzarbeiten'],
                'sections' => [
                    ['heading' => 'Innen & Außen', 'body' => "Gips, Kalk, Zement – strukturiert oder glatt."],
                ],
            ],
            'turen-und-fensterbau' => [
                'title'    => 'Türen und Fensterbau',
                'subtitle' => 'Maßgefertigt – Komfort & Effizienz.',
                'hero'     => ['image' => '/images/services/windows.jpg', 'alt' => 'Fensterbau'],
                'sections' => [
                    ['heading' => 'Leistungen', 'body' => "Montage, Austausch, Abdichtung & Justierung."],
                ],
            ],
            'teppichreinigung' => [
                'title'    => 'Teppichreinigung',
                'subtitle' => 'Schonend & gründlich.',
                'hero'     => ['image' => '/images/services/carpet-clean.jpg', 'alt' => 'Teppichreinigung'],
                'sections' => [
                    ['heading' => 'Methoden', 'body' => "Shampoonieren, Sprühextraktion, Fleckentfernung."],
                ],
            ],
            'teppich-verlegen' => [
                'title'    => 'Teppich Verlegen',
                'subtitle' => 'Perfektes Finish.',
                'hero'     => ['image' => '/images/services/carpet-lay.jpg', 'alt' => 'Teppich Verlegen'],
                'sections' => [
                    ['heading' => 'Ausführung', 'body' => "Untergrundvorbereitung, Sockelleisten, Dehnleisten."],
                ],
            ],
            'tapezieren' => [
                'title'    => 'Tapezieren – Tapezierarbeiten',
                'subtitle' => 'Kreative Wandgestaltung.',
                'hero'     => ['image' => '/images/services/wallpaper.jpg', 'alt' => 'Tapezieren'],
                'sections' => [
                    ['heading' => 'Materialien', 'body' => "Vlies, Vinyl, Textil – sauber & exakt verklebt."],
                ],
            ],
        ];

        abort_unless(isset($catalog[$slug]), 404);

        return Inertia::render('Services/Show', [
            'slug'         => $slug,
            'page'         => $catalog[$slug],
            'currentRoute' => 'services',
        ]);
    }
}
