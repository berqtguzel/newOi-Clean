<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class LocationsController extends Controller
{
    public function show(Request $request, string $slug)
    {
        // Backend API çağrısı YOK.
        // Sadece slug'ı React'e gönderiyoruz, geri kalan her şeyi frontend halledecek.

        return Inertia::render('Locations/Show', [
            'slug'           => $slug,
            'page'           => [],          // şimdilik boş, React dolduracak
            'structuredData' => null,        // istersen sonra frontend'de de üretebilirsin
            'currentRoute'   => 'locations.show',
        ]);
    }
}
