<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TrackAnalytics
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        if ($request->isMethod('get') && ! $request->ajax()) {
            try {
                $tenantId = config('services.omr.talent_id');

                Http::withHeaders([
                    'X-Tenant-ID' => $tenantId,
                ])->post('https://omerdogan.de/api/v1/analytics/track', [
                    'tenant_id' => $tenantId,
                    'url' => $request->path(),
                    'title' => config('app.name'),
                    'referrer' => $request->headers->get('referer'),
                    'userAgent' => $request->userAgent(),
                    'timestamp' => now()->toISOString(),
                ]);
            } catch (\Throwable $e) {
                Log::warning('Analytics tracking failed: '.$e->getMessage());
            }
        }

        return $response;
    }
}
