<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\LocationsController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\StaticPageController;

Route::get('/', [HomeController::class, 'index'])->name('home');

// Services list
Route::get('/services', [ServicesController::class, 'index'])->name('services.index');

// Locations list
Route::get('/standorte', [LocationsController::class, 'index'])->name('locations.index');

// Contact
Route::get('/kontakt', [ContactController::class, 'index'])->name('kontakt.index');
Route::post('/kontakt', [ContactController::class, 'submit'])->name('kontakt.submit');

// Language switching
Route::get('/lang/{locale}', function ($locale) {
    $available = ['de', 'en', 'tr'];
    abort_if(!in_array($locale, $available), 404);
    session(['locale' => $locale]);
    return back();
})->name('lang.switch');

// ⚠️ API'den de bulunamayan tüm sayfalar için 404 sayfası
Route::get('/404', function () {
    return Inertia\Inertia::render('Errors/NotFound')
        ->toResponse(request())
        ->setStatusCode(404);
})->name('notfound');

// 🟢 SLUG BAŞTA GELMELİ → StaticPageController çalışır
Route::get('/{slug}', [StaticPageController::class, 'show'])
    ->where('slug', '[a-z0-9-]+')
    ->name('static.show');

// 🔥 SON SİPER! → Her şeyden sonra gelen fallback → 404
Route::fallback(function () {
    return redirect()->route('notfound');
});
