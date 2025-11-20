<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

if (! function_exists('trackConversion')) {


    function trackConversion(string $type, float $value, string $url, array $data = []): void
    {
        try {
            $tenantId = config('services.omr.talent_id');

            Http::withHeaders([
                'X-Tenant-ID' => $tenantId,
            ])->post('https://omerdogan.de/api/v1/analytics/track-conversion', [
                'tenant_id' => $tenantId,
                'type' => $type,
                'value' => $value,
                'url' => $url,
                'timestamp' => now()->toISOString(),
                'data' => $data,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Conversion tracking failed: ' . $e->getMessage());
        }
    }
}
