<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class LocaleFromCookie
{
    public function handle(Request $request, Closure $next)
    {
        // 1) Cookie'den oku
        $cookieLocale = $request->cookie('locale');

        // 2) URL'den ?lang= ile gelmişse onu kullan
        $queryLocale  = $request->query('lang');

        $locale = $queryLocale ?: $cookieLocale;

        // Desteklenen diller
        $available = ['de', 'en', 'tr'];

        if (!in_array($locale, $available)) {
            $locale = config('app.locale', 'de');
        }

        App::setLocale($locale);

        // Inertia'ya paylaş (props.locale)
        inertia()->share('locale', $locale);

        return $next($request);
    }
}
