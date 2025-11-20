<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tightenco\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        // kullanılacak locale
        $currentLocale = app()->getLocale();

        // projede desteklediğin diller
        $availableLocales = [
            ['code' => 'de', 'label' => 'DE'],
            ['code' => 'en', 'label' => 'EN'],
            ['code' => 'tr', 'label' => 'TR'],
        ];

        return array_merge(parent::share($request), [

            'auth' => [
                'user' => $request->user(),
            ],

            'ziggy' => fn () => array_merge((new Ziggy)->toArray(), [
                'location' => $request->url(),
            ]),

            'global' => [
                'websites' => fn () => rescue(fn () => omr_websites(), []),
                'talentId' => fn () => (string) config('services.omr.talent_id', ''),
                'appName'  => config('app.name', 'O&I CLEAN group GmbH'),
            ],

            'flash' => [
                'success' => fn () => session('success'),
                'error'   => fn () => session('error'),
            ],

            // 🔥 FRONTEND’E GÖNDERİLEN DİL BİLGİLERİ
            'locale'    => $currentLocale,
            'languages' => $availableLocales,
        ]);
    }
}
