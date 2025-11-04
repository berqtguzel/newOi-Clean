<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class LocationsController extends Controller
{
    public function show(Request $request, string $slug)
    {

        $locations = [
            'fulda' => [
                'city' => 'Fulda',
                'title' => 'Gebäudereinigung in Fulda',
                'hero' => [
                    'image' => '/images/aalen.jpg',
                    'alt'   => 'Reinigungsservice Fulda',
                ],
                'coordinates' => ['lat' => 50.5558, 'lng' => 9.6808],
                'intro' => 'Professionelle Reinigungslösungen in Fulda und Umgebung – zuverlässig, flexibel und qualitätsgesichert.',
                'sections' => [
                    [
                        'heading' => 'Unsere Leistungen vor Ort',
                        'body'    => "Unterhaltsreinigung, Glasreinigung, Grundreinigung\nHausmeister- & Sonderdienste auf Anfrage",
                        'items'   => ['Büroreinigung', 'Fenster/Glas', 'Bodenpflege', 'Teppichpflege'],
                        'image'   => '/images/aalen.jpg',
                    ],
                ],
            ],

            'amberg' => [
                'city' => 'Amberg',
                'title' => 'Gebäudereinigung in Amberg',
                'hero' => [
                    'image' => '/images/aalen.jpg',
                    'alt'   => 'Reinigungsservice Amberg',
                ],
                'coordinates' => ['lat' => 49.4478, 'lng' => 11.8516],
                'intro' => 'Lokale Teams, kurze Wege, planbare Qualität in Amberg.',
                'sections' => [
                    [
                        'heading' => 'Warum wir?',
                        'body'    => "Erfahrene Teams, klare Prozesse, nachvollziehbare Qualitätssicherung.",
                        'image'   => '/images/aalen.jpg',
                    ],
                ],
            ],

            'aschaffenburg' => [
                'city' => 'Aschaffenburg',
                'title' => 'Gebäudereinigung in Aschaffenburg',
                'hero' => [
                    'image' => '/images/aalen.jpg',
                    'alt'   => 'Reinigungsservice Aschaffenburg',
                ],
                'coordinates' => ['lat' => 49.9769, 'lng' => 9.1495],
                'intro' => 'Sauberkeit, auf die Sie sich verlassen können – regional in Aschaffenburg.',
                'sections' => [],
            ],
        ];

        if (!isset($locations[$slug])) {
            abort(404);
        }

        $page = $locations[$slug];


        $structured = [
            '@context' => 'https://schema.org',
            '@type'    => 'LocalBusiness',
            'name'     => $page['title'] ?? $page['city'],
            'image'    => $page['hero']['image'] ?? null,
            'address'  => [
                '@type' => 'PostalAddress',
                'addressLocality' => $page['city'],
                'addressCountry'  => 'DE',
            ],
            'areaServed' => $page['city'],
            'geo' => [
                '@type'    => 'GeoCoordinates',
                'latitude' => $page['coordinates']['lat'] ?? null,
                'longitude'=> $page['coordinates']['lng'] ?? null,
            ],
            'url' => url()->current(),
        ];

        return Inertia::render('Locations/Show', [
            'slug'           => $slug,
            'page'           => $page,
            'structuredData' => $structured,
            'currentRoute'   => 'locations.show',
        ]);
    }
}
