<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class StaticPageController extends Controller
{
    /**
     * Almanca karakterleri normalize et (ß -> ss, ü -> ue, ö -> oe, ä -> ae)
     */
    private function normalizeGermanChars(string $text): string
    {
        $replacements = [
            'ß' => 'ss',
            'ü' => 'ue',
            'ö' => 'oe',
            'ä' => 'ae',
            'Ü' => 'ue',
            'Ö' => 'oe',
            'Ä' => 'ae',
        ];
        
        return strtr($text, $replacements);
    }

    public function show(string $slug)
    {
        // 🔥 URL decode et (Laravel zaten decode ediyor ama emin olmak için)
        $decoded = urldecode($slug);
        
        // Almanca karakterleri normalize et
        $normalized = $this->normalizeGermanChars($decoded);
        
        // Boşlukları tireye çevir
        $normalized = str_replace(' ', '-', $normalized);
        $slugLower = strtolower(trim($normalized));

        // 🔹 FE ile aynı slug temizleme mantığı
        $cleanSlug = preg_replace('/^(gebaudereinigung|wohnungsrenovierung|hotelreinigung)-/i', '', $slugLower);
        $cleanSlug = preg_replace('/^in-/', '', $cleanSlug);

        \Log::info("🌍 StaticPageController → Incoming: $slug | Decoded: $decoded | Normalized: $cleanSlug");

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
        $tenantId = config('services.omr.tenant_id');
        $base     = rtrim(config('services.omr.base'), '/');

        $services = Cache::remember('global_services_list', 300, function () use ($tenantId, $base) {
            $resp = Http::withHeaders([
                'X-Tenant-ID' => $tenantId,
                'Accept'      => 'application/json',
            ])
            ->withoutVerifying() // 🔥 SSL doğrulaması kapat
            ->get("$base/v1/services?per_page=500");

            return $resp->json()['data'] ?? [];
        });

        foreach ($services as $svc) {
            $svcSlug = strtolower(trim($svc['slug'] ?? ''));
            $cityRaw = trim($svc['city'] ?? '');
            
            // 🔥 Şehir slug'ını normalize et (Almanca karakterler + boşlukları tireye çevir)
            $cityNormalized = $this->normalizeGermanChars($cityRaw);
            $citySlug = strtolower(str_replace(' ', '-', $cityNormalized));
            $citySlugWithSpaces = strtolower($cityNormalized); // Boşluklu versiyon
            $citySlugOriginal = strtolower(str_replace(' ', '-', $cityRaw)); // Orijinal (ß ile)

            // 🔥 Önce şehir eşleşsin (hem normalize edilmiş hem orijinal versiyonları kontrol et)
            if (
                ($cleanSlug === $citySlug || 
                 $cleanSlug === $citySlugWithSpaces || 
                 $cleanSlug === $citySlugOriginal) && 
                !empty($svcSlug)
            ) {
                \Log::info("🏙 CITY MATCH → {$citySlug} (matched with: {$cleanSlug})");
                return Inertia::render('Locations/Show', [
                    'slug' => $svcSlug,
                    'citySlug' => $citySlug, // Normalize edilmiş versiyonu gönder
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
                'Accept'      => 'application/json',
            ])
            ->withoutVerifying() // 🔥 burada da SSL doğrulaması kapat
            ->get("$base/v1/services/" . rawurlencode($slugLower));

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

        // 🔥 Son garanti → FE API'den çeksin
        return Inertia::render('Services/Show', [
            'slug' => $slugLower,
            'forceLoad' => true,
        ]);
    }
}
