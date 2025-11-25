<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class StaticPageController extends Controller
{
    public function show(string $slug)
    {
        $slugLower = strtolower($slug);

        // -------------------------------------------------------
        // 1. STATİK SAYFALAR
        // -------------------------------------------------------
        $staticSlugs = [
            'uber-uns',
            'qualitatsmanagement',
            'mitarbeiter-schulungen',
            'haufig-gestellte-fragen-faq',
            'datenschutzhinweise',
            'stockfotos',
            'impressum',
            'cookie-policy',
            'kontakt',
        ];

        if (in_array($slugLower, $staticSlugs, true)) {
            return Inertia::render('StaticPage', [
                'slug' => $slugLower,
                'meta' => [
                    'title'       => 'O&I CLEAN group GmbH',
                    'description' => 'Professionelle Reinigungsdienstleistungen',
                    'canonical'   => url()->current(),
                ],
            ]);
        }

        // -------------------------------------------------------
        // 2. TÜM SERVİSLERİ ÇEK (CACHE İLE)
        // -------------------------------------------------------
        $services = Cache::remember('global_services_list', 3600, function () {
            $tenantId = config('services.omr.talent_id');
            $base = rtrim(config('services.omr.base'), '/');

            try {
                $resp = Http::withHeaders([
                    'X-Tenant-ID' => $tenantId,
                    'Accept'      => 'application/json',
                ])->timeout(5)->get($base . '/v1/services?per_page=500');

                return $resp->json()['data'] ?? [];
            } catch (\Exception $e) {
                return [];
            }
        });

        // API'den gelen slug'ların listesi
        $serviceSlugs       = array_column($services, 'slug');
        $serviceSlugsLower  = array_map('strtolower', $serviceSlugs);

        // -------------------------------------------------------
        // 2.1. ŞEHİR MAP'İ OLUŞTUR (örn: "gebaudereinigung-bad-vilbel" -> "bad-vilbel")
        //      /berlin gibi URL'lerde & service-city pattern'inde kullanacağız
        // -------------------------------------------------------
        $normalizedMap = []; // citySlug => originalSlug
        foreach ($services as $svc) {
            if (empty($svc['slug'])) {
                continue;
            }

            $original   = strtolower($svc['slug']);
            $normalized = $this->normalizeSlug($original); // "bad-vilbel"

            // normalizeSlug sadece prefix'i atıyor, şehir kısmını bırakıyor
            // "gebaudereinigung" gibi tek kelime ise aynı kalır, sorun yok
            $normalizedMap[$normalized] = $original;
        }

        // -------------------------------------------------------
        // 3. TAM SLUG EŞLEŞMESİ (Örn: gebaudereinigung-berlin)
        // -------------------------------------------------------
        if (in_array($slugLower, $serviceSlugsLower, true)) {
            $originalIndex = array_search($slugLower, $serviceSlugsLower, true);
            $originalSlug  = $serviceSlugs[$originalIndex] ?? $slugLower;

            // İlgili service kaydını bul
            $serviceData = $services[$originalIndex] ?? null;
            $categoryId  = isset($serviceData['category_id']) ? (int) $serviceData['category_id'] : null;

            // Eğer bu kayıt "lokasyon" ise (ör: category_id = 2 → Gebäudereinigung lokasyonu)
            if ($categoryId === 2) {
                return Inertia::render('Locations/Show', [
                    'slug'     => $originalSlug, // örn: "gebaudereinigung-berlin"
                    'citySlug' => strtolower($serviceData['city'] ?? $originalSlug),
                ]);
            }

            // Diğer tüm hizmetler normal Services/Show
            return Inertia::render('Services/Show', [
                'slug' => $originalSlug,
            ]);
        }

        // -------------------------------------------------------
        // 4. ANA KATEGORİLER
        // -------------------------------------------------------
        $mainServices = [
            'gebaudereinigung',
            'wohnungsrenovierung',
            'hotelreinigung',
            'services',
        ];

        if (in_array($slugLower, $mainServices, true)) {
            return Inertia::render('Services/Show', [
                'slug' => $slugLower,
            ]);
        }

        // -------------------------------------------------------
        // 5. HİZMET + ŞEHİR PATTERNİ
        //    Örn: "baucontainer-reinigung-berlin"
        //    API'de sadece "baucontainer-reinigung" olsa bile:
        //    - baseSlug: "baucontainer-reinigung" (service slug)
        //    - citySlug: "berlin" (valid city ise)
        //    → Services/Show'a baseSlug + citySlug ile gönder
        // -------------------------------------------------------
        if (str_contains($slugLower, '-')) {
            $parts    = explode('-', $slugLower);
            $citySlug = array_pop($parts);                // son parça: "berlin"
            $baseSlug = implode('-', $parts);             // geri kalan: "baucontainer-reinigung"

            // 1) baseSlug gerçekten bir service mi? (API'de var mı?)
            $baseIndex = array_search($baseSlug, $serviceSlugsLower, true);

            // 2) citySlug gerçekten bilinen bir şehir mi? (/berlin vs /xxyyzz)
            $isValidCity = array_key_exists($citySlug, $normalizedMap);

            if ($baseIndex !== false && $isValidCity) {
                $baseOriginalSlug = $serviceSlugs[$baseIndex]; // orijinal case'li slug

                return Inertia::render('Services/Show', [
                    // İçerik bu service'den gelir
                    'slug'     => $baseOriginalSlug,
                    // Ama URL'de citySlug'i korumak için client tarafta kullanabiliriz
                    'citySlug' => $citySlug,
                ]);
            }
        }

        // -------------------------------------------------------
        // 6. SADECE ŞEHİR İSMİ GELİRSE (/berlin)
        // -------------------------------------------------------
        if (array_key_exists($slugLower, $normalizedMap)) {
            return Inertia::render('Locations/Show', [
                'slug'     => $normalizedMap[$slugLower], // örn: "gebaudereinigung-berlin"
                'citySlug' => $slugLower,                 // "berlin"
            ]);
        }

        // -------------------------------------------------------
        // 7. HİÇBİRİNE UYMADIYSA -> 404
        // -------------------------------------------------------
        abort(404);
    }

    /**
     * "gebaudereinigung-bad-vilbel" -> "bad-vilbel"
     * "berlin" -> "berlin"
     */
    protected function normalizeSlug(string $slug)
    {
        if (str_contains($slug, '-')) {
            $parts = explode('-', $slug);
            array_shift($parts); // hizmet adını at (ilk kısmı)
            return implode('-', $parts);
        }

        return $slug;
    }
}
