<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\LocationsController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\StaticPageController;

/*
|----------------------------------------------------------------------
| ÖNCE spesifik rotalar
|----------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index'])->name('home');

/* Services */
Route::get('/services', [ServicesController::class, 'index'])->name('services.index');
Route::get('/services/{slug}', [ServicesController::class, 'show'])->name('services.show');

/* Almanca alias istersen 301 ile yönlendir (opsiyonel) */
Route::get('/dienstleistungen', fn () => redirect()->route('services.index'), 301);

/* Locations */
Route::get('/standorte/{slug}', [LocationsController::class, 'show'])->name('locations.show');
Route::get('/location', [LocationsController::class, 'index'])->name('locations.index'); // gerekiyorsa

/* Contact */
Route::get('/contact', function () {
    return Inertia::render('Contact/index', [
        'currentRoute' => 'contact',
    ]);
})->name('contact.index');

Route::post('/contact', [ContactController::class, 'submit'])->name('contact.submit');

/*
|----------------------------------------------------------------------
| EN SON: statik sayfa yakalayıcı
|   – services / standorte / contact gibi path’leri hariç tut
|----------------------------------------------------------------------
*/
Route::get('/{slug}', [StaticPageController::class, 'show'])
    ->where('slug', '^(?!services$)(?!standorte)(?!contact$)(?!dienstleistungen$)[-a-z0-9]+$')
    ->name('static.show');
