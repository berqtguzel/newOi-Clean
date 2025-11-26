<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class StaticPageController extends Controller
{
    public function show(string $slug)
    {
        $slugLower = strtolower(trim($slug));

        // 🔹 FE ile aynı slug temizleme mantığı
        $cleanSlug = preg_replace('/^(gebaudereinigung|wohnungsrenovierung|hotelreinigung)-/i', '', $slugLower);
        $cleanSlug = preg_replace('/^in-/', '', $cleanSlug);

        \Log::info("🌍 StaticPageController → Incoming: $slugLower | Normalized: $cleanSlug");

        // 1️⃣ Sabit sayfa kontrolü
        $staticSlugs = [
            'uber-uns','qualitatsmanagement','mitarbeiter-schulungen',
            'haufig-gestellte-fragen-faq','datenschutzhinweise',
            'stockfotos','impressum','cookie-policy','kontakt',
        ];

        if (in_array($cleanSlug, $staticSlugs, true)) {
            return Inertia::render('StaticPage', ['slug' => $cleanSlug]);
        }

        // 2️⃣ API'den servisleri çek
        $tenantId = config('services.omr.talent_id');
        $base     = rtrim(config('services.omr.base'), '/');

        $services = Cache::remember('global_services_list', 300, function () use ($tenantId, $base) {
            $resp = Http::withHeaders([
                'X-Tenant-ID' => $tenantId,
                'Accept'      => 'application/json',
            ])->get("$base/v1/services?per_page=500");

            return $resp->json()['data'] ?? [];
        });

     foreach ($services as $svc) {
    $svcSlug = strtolower(trim($svc['slug'] ?? ''));
    $citySlug = strtolower(trim($svc['city'] ?? ''));

    // 🔥 Önce şehir eşleşsin
    if ($cleanSlug === $citySlug && !empty($svcSlug)) {
        \Log::info("🏙 CITY MATCH → {$citySlug}");
        return Inertia::render('Locations/Show', [
            'slug' => $svcSlug,
            'citySlug' => $cleanSlug,
        ]);
    }

    // ✔ Sonra hizmet slug eşleşmesi
    if ($cleanSlug === $svcSlug) {
        \Log::info("🧼 SERVICE MATCH → {$svcSlug}");
        return Inertia::render('Services/Show', [
            'slug' => $svcSlug,
        ]);
    }
}

        // 3️⃣ API'ye direkt slug dene
        try {
            $resp = Http::withHeaders([
                'X-Tenant-ID' => $tenantId,
                'Accept' => 'application/json',
            ])->get("$base/v1/services/" . rawurlencode($slugLower));

            if ($resp->successful()) {
                $service = $resp->json();
                if (!empty($service['slug'])) {
                    return Inertia::render('Services/Show', [
                        'slug' => $service['slug'],
                    ]);
                }
            }
        } catch (\Throwable $e) {
            \Log::error("API direct check failed: " . $e->getMessage());
        }

        // 🔥 YENİ: Son güvenlik → hangi slug gelirse gelsin Service Show'a yönlendir!
        return Inertia::render('Services/Show', [
            'slug' => $slugLower,
            'forceLoad' => true, // FE tekrar API'den çeker
        ]);
    }
}
