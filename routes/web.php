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
Route::get('/services/{slug}', [ServicesController::class, 'show'])->name('services.show');

Route::get('/dienstleistungen', fn () => redirect()->route('services.index'), 301);

Route::get('/standorte/{slug}', [LocationsController::class, 'show'])->name('locations.show');
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

// EN SONA: static sayfalar
Route::get('/{slug}', [StaticPageController::class, 'show'])
    ->where('slug', '^(?!services$)(?!standorte)(?!kontakt$)(?!dienstleistungen$)[-a-z0-9]+$')
    ->name('static.show');
