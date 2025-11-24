<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ServicesController extends Controller
{
    public function index(Request $request)
    {


        return Inertia::render('Services/Index', [
            'currentRoute' => 'services',
        ]);
    }

    public function show(string $slug)
    {

        // Validate the slug exists in the dashboard API before rendering
        try {
            $tenantId = config('services.omr.talent_id');
            $base = rtrim(config('services.omr.base') ?? 'https://omerdogan.de/api', '/');
            $resp = Http::withHeaders([
                'X-Tenant-ID' => $tenantId,
                'Accept' => 'application/json',
            ])->get($base . '/v1/services/' . urlencode(strtolower($slug)));

            if (!($resp->successful() && (data_get($resp->json(), 'data') || data_get($resp->json(), 'success') === true))) {
                abort(404);
            }
        } catch (\Throwable $e) {
            Log::warning('Service validation failed: ' . $e->getMessage());
            abort(404);
        }

        return Inertia::render('Services/Show', [
            'slug'         => $slug,
            'currentRoute' => 'services',
        ]);
    }
}
