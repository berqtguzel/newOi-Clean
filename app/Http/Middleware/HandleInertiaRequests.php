<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tightenco\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        // 🔥 Laravel'in aktif locale'i (session / config / middleware ne ayarlıyorsa)
        $currentLocale = app()->getLocale();

        // Frontend'de dil switcher için kullanılacak diller
        // Header.jsx içinde:
        //   l.code || l.language_code || l.locale
        //   l.name || l.label
        $availableLocales = [
            [
                'code' => 'de',
                'name' => 'Deutsch',
                'label' => 'DE',
            ],
            [
                'code' => 'en',
                'name' => 'English',
                'label' => 'EN',
            ],
            [
                'code' => 'tr',
                'name' => 'Türkçe',
                'label' => 'TR',
            ],
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

            // 🌍 FRONTEND’E GÖNDERİLEN DİL BİLGİLERİ
            'locale'    => $currentLocale,       // örn: "de", "tr", "en"
            'languages' => $availableLocales,    // Header language switcher için
        ]);
    }
}
