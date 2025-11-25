<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\LocationsController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\StaticPageController;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/services', [ServicesController::class, 'index'])->name('services.index');

// Service detail pages (use German path)
Route::get('/dienstleistungen/{slug}', [ServicesController::class, 'show'])->name('services.show');

// Support root-level service slugs like `/wohnungsrenovierung-bad-hersfeld`
// Must be defined BEFORE the generic static page catch-all route.
Route::get('/{slug}', [ServicesController::class, 'show'])
    ->where('slug', '^(?:gebaudereinigung|wohnungsrenovierung|hotelreinigung)(?:[-a-z0-9]+)?$')
    ->name('services.show.root');

Route::get('/dienstleistungen', fn () => redirect()->route('services.index'), 301);

Route::get('/standorte', [LocationsController::class, 'index'])->name('locations.index');

Route::get('/kontakt', function () {
    return Inertia::render('kontakt/index', [
        'currentRoute' => 'kontakt',
    ]);
})->name('kontakt.index');

Route::post('/kontakt', [ContactController::class, 'submit'])->name('kontakt.submit');

// 🔥 DİL DEĞİŞTİRME – SADECE GET
Route::get('/lang/{locale}', function ($locale) {
    $available = ['de', 'en', 'tr'];

    if (! in_array($locale, $available, true)) {
        abort(404);
    }

    session(['locale' => $locale]);

    return back(); // aynı sayfaya geri
})->name('lang.switch');

Route::get('/{slug}', [StaticPageController::class, 'show'])
    ->where('slug', '^(?!services$)(?!standorte$)(?!kontakt$)(?!dienstleistungen$)[-a-z0-9]+$')
    ->name('static.show');
