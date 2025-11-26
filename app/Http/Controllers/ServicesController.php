<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ServicesController extends Controller
{
    public function index()
    {
        return Inertia::render('Services/Index');
    }

    public function show($slug)
    {
        $slugLower = strtolower($slug);

        $tenantId = config('services.omr.talent_id');
        $base     = rtrim(config('services.omr.base'), '/');

        // 🔥 1️⃣ Tüm servisleri cache ile al (ID eşleştirmek için)
        $services = Cache::remember('all_services', 600, function () use ($tenantId, $base) {
            $res = Http::withHeaders([
                'X-Tenant-ID' => $tenantId,
                'Accept'      => 'application/json',
            ])->get("$base/v1/services?per_page=500");

            return $res->json()['data'] ?? [];
        });

        // 🔎 Slug eşleştir → ID bul
        $match = collect($services)->first(function ($svc) use ($slugLower) {
            return strtolower($svc['slug']) === $slugLower;
        });

        if (!$match) {
            return abort(404);
        }

        $id = $match['id'];

        // 🔥 2️⃣ API’den ID ile detay verisini al
        $resp = Http::withHeaders([
            'X-Tenant-ID' => $tenantId,
            'Accept'      => 'application/json',
        ])->get("$base/v1/services/$id");

        if (!$resp->ok()) {
            return abort(404);
        }

        $service = $resp->json();

        // 🎯 3️⃣ Vue componentine veriyi gönder
        return Inertia::render('Services/Show', [
            'slug'    => $service['slug'],
            'service' => $service,
        ]);
    }
}
