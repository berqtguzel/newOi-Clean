<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

if (! function_exists('getSiteColors')) {
    function getSiteColors(): array
    {

        $defaults = [
            'site_primary_color'       => '#007bff',
            'site_secondary_color'     => '#6c757d',
            'site_accent_color'        => '#22d3ee',
            'button_color'             => '#007bff',
            'text_color'               => '#333333',
            'h1_color'                 => '#111111',
            'h2_color'                 => '#333333',
            'h3_color'                 => '#555555',
            'link_color'               => '#2563eb',
            'background_color'         => '#ffffff',
            'header_background_color'  => '#ffffff',
            'footer_background_color'  => '#f8f9fa',
        ];

        try {
            $tenantId = config('services.omr.talent_id');

            $response = Http::withHeaders([
                'X-Tenant-ID' => $tenantId,
            ])->get('https://omerdogan.de/api/v1/settings/colors');

            // Başarılı ise API verileri ile defaults'u birleştir
            if ($response->successful() && data_get($response->json(), 'success') === true) {
                $data = (array) data_get($response->json(), 'data', []);
                return array_merge($defaults, $data);
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to fetch site colors: ' . $e->getMessage());
        }

        // Hata veya başarısızlıkta tüm alanları içeren varsayılanlar
        return $defaults;
    }
}
