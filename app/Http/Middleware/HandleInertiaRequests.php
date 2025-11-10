<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tightenco\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * İlk yüklenen Blade view.
     */
    protected $rootView = 'app';

    /**
     * Vite asset versiyonu.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Tüm Inertia sayfalarına paylaşılan default props.
     *
     * Not:
     * - 'global.websites' cache'li helper'dan gelir (omr_websites()).
     * - Hata durumunda boş dizi döner (rescue).
     * - 'global.talentId' .env -> config('services.omr.talent_id') üzerinden gelir.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],

            // Ziggy (route() için)
            'ziggy' => fn () => array_merge((new Ziggy)->toArray(), [
                'location' => $request->url(),
            ]),

            // Tüm sayfalarda erişilen global veriler
            'global' => [
                // API: https://omerdogan.de/api/global/websites
                // -> app/Services/OmrClient + omr_websites() helper’ını kullanır
                'websites' => fn () => rescue(fn () => omr_websites(), []),

                // .env: OMR_TALENT_ID
                'talentId' => fn () => (string) config('services.omr.talent_id', ''),

                // (opsiyonel) uygulama adı/title kullanımı için
                'appName'  => config('app.name', 'O&I CLEAN group GmbH'),
            ],

            // (opsiyonel) flash mesajlar
            'flash' => [
                'success' => fn () => session('success'),
                'error'   => fn () => session('error'),
            ],
        ]);
    }
}
