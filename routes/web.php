<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

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

// Özel hata sayfaları
Route::get('/404', function () {
    return Inertia::render('Errors/NotFound', ['status' => 404])
        ->toResponse(request())
        ->setStatusCode(404);
})->name('404');

Route::get('/500', function () {
    return Inertia::render('Errors/NotFound', ['status' => 500])
        ->toResponse(request())
        ->setStatusCode(500);
})->name('500');

// ✨ Dynamic page + API verify
Route::get('/{slug}', function ($slug) {
    $tenant = request()->header('X-Tenant-ID') ??
        config('app.default_tenant') ??
        "oi_cleande_690e161c3a1dd";

    $url = "https://omerdogan.de/api/v1/pages/$slug";

    Http::macro('oi', function () {
    return app()->environment('local')
        ? Http::withoutVerifying()
        : Http::withOptions(['verify' => true]);
});
$res = Http::oi()->get($url, [
    'tenant' => $tenant,
    'lang' => app()->getLocale(),
]);

    if ($res->status() !== 200 || empty($res->json('data'))) {
        return redirect()->route('404');
    }

    return Inertia::render('StaticPage', [
        'slug' => $slug,
        'page' => $res->json('data'),
    ]);
})->where('slug', '[A-Za-z0-9\-]+');

// Fallback - son savunma hattı
Route::fallback(function () {
    return redirect()->route('404');
});
