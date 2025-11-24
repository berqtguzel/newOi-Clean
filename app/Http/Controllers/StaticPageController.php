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
        $serviceSlugs = array_column($services, 'slug');
        $serviceSlugsLower = array_map('strtolower', $serviceSlugs);

        // -------------------------------------------------------
        // 🔥 YENİ: GEÇERLİ ŞEHİRLERİ TOPLA (Doğrulama İçin)
        // -------------------------------------------------------
        // API'deki tüm "gebaudereinigung-berlin" gibi verilerden "berlin"i çıkarıp listeye atıyoruz.
        $validCities = [];
        foreach ($serviceSlugsLower as $s) {
            if (str_contains($s, '-')) {
                // "gebaudereinigung-berlin" -> "berlin"
                $cityPart = $this->normalizeSlug($s);
                $validCities[$cityPart] = true; // Key olarak ekle (Hızlı arama için)
            }
        }

        // -------------------------------------------------------
        // 3. TAM SLUG EŞLEŞMESİ (Örn: gebaudereinigung-berlin)
        // -------------------------------------------------------
        // Eğer URL birebir API'de varsa direkt aç.
        if (in_array($slugLower, $serviceSlugsLower, true)) {
            $originalIndex = array_search($slugLower, $serviceSlugsLower, true);
            $originalSlug  = $serviceSlugs[$originalIndex] ?? $slugLower;

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
        // 5. HİZMET + EK + ŞEHİR PATTERNİ (Kritik Kontrol)
        // -------------------------------------------------------
        $servicePrefixes = [
            'gebaudereinigung',
            'wohnungsrenovierung',
            'hotelreinigung',
        ];

        foreach ($servicePrefixes as $prefix) {
            // Eğer URL "gebaudereinigung-" ile başlıyorsa...
            if (str_starts_with($slugLower, $prefix . '-') && $slugLower !== $prefix) {

                // URL'den şehir kısmını ayıkla: "gebaudereinigung-sadas" -> "sadas"
                $potentialCity = substr($slugLower, strlen($prefix) + 1);

                // 🔥 KONTROL: Bu şehir API'de var mı?
                if (isset($validCities[$potentialCity])) {
                    // VARSA sayfayı aç
                    return Inertia::render('Services/Show', [
                        'slug'     => $slugLower,
                        'baseSlug' => $prefix,
                    ]);
                }

                // YOKSA (Örn: sadas) hiçbir şey yapma, aşağıya devam et (404'e düşecek)
            }
        }

        // -------------------------------------------------------
        // 6. SADECE ŞEHİR İSMİ GELİRSE (/berlin)
        // -------------------------------------------------------
        // Sadece şehir ismi yazılırsa Locations sayfasına yönlendir.

        $normalizedMap = [];
        foreach ($services as $svc) {
            if (empty($svc['slug'])) continue;

            $original   = strtolower($svc['slug']);
            $normalized = $this->normalizeSlug($original); // "bad-vilbel"

            $normalizedMap[$normalized] = $original;
        }

        if (array_key_exists($slugLower, $normalizedMap)) {
            return Inertia::render('Locations/Show', [
                'slug'     => $normalizedMap[$slugLower],
                'citySlug' => $slugLower,
            ]);
        }

        // -------------------------------------------------------
        // 7. HİÇBİRİNE UYMADIYSA -> 404
        // -------------------------------------------------------
        abort(404);
    }

    /**
     * "gebaudereinigung-bad-vilbel" -> "bad-vilbel"
     */
    protected function normalizeSlug(string $slug)
    {
        if (str_contains($slug, '-')) {
            $parts = explode('-', $slug);
            array_shift($parts); // hizmet adını at
            return implode('-', $parts);
        }

        return $slug;
    }
}
