<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Client\RequestException;

class OmrClient
{
    protected string $base;
    protected int $timeout;
    protected string $talentId;

    public function __construct()
    {
        $this->base     = rtrim(config('services.omr.base'), '/');
        $this->timeout  = (int) config('services.omr.timeout', 10);
        $this->talentId = (string) config('services.omr.talent_id', '');
    }

    protected function http()
    {
        return Http::timeout($this->timeout)
            ->acceptJson()
            ->retry(2, 300);
    }


    public function websites(array $query = []): array
    {
        $query = array_filter([
            'talent_id' => $this->talentId,
        ] + $query);

        $cacheKey = 'omr.websites.' . md5(json_encode($query));

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($query) {
            $res = $this->http()->get("{$this->base}/global/websites", $query);
            if ($res->failed()) {
                $res->throw();
            }
            return $res->json() ?? [];
        });
    }
}
