<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

if (! function_exists('getSiteColors')) {
    function getSiteColors(): array
    {
        try {
            $tenantId = config('services.omr.talent_id');

            $response = Http::withHeaders([
                'X-Tenant-ID' => $tenantId,
            ])->get('https://omerdogan.de/api/v1/settings/colors');

            if ($response->successful() && $response['success']) {
                return $response['data'];
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to fetch site colors: ' . $e->getMessage());
        }

        return [
            'site_primary_color' => '#007bff',
            'site_secondary_color' => '#6c757d',
            'button_color' => '#007bff',
            'text_color' => '#333333',
        ];
    }
}
