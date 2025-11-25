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
        // Slug'ı parse et: eğer tire içeriyorsa, sadece ilk kısmı al (base service slug)
        // Örnek: baucontainer-reinigung-berlin -> baucontainer
        // Örnek: gebaudereinigung-berlin -> gebaudereinigung
        // Örnek: baufeinreinigung-berlin -> baufeinreinigung
        
        $processedSlug = $slug;
        
        // Eğer slug tire içeriyorsa, sadece ilk kısmı al
        if (str_contains($slug, '-')) {
            $parts = explode('-', $slug);
            // İlk kısmı al (base service slug)
            $processedSlug = $parts[0];
        }
        
        // Her durumda sayfayı render et - frontend'de API çağrısı yapılacak
        // Eğer service bulunamazsa frontend'de hata gösterilecek
        return Inertia::render('Services/Show', [
            'slug'         => $processedSlug, // Base service slug'ını kullan
            'originalSlug' => $slug, // Orijinal slug'ı da gönder (frontend'de kullanılabilir)
            'currentRoute' => 'services',
        ]);
    }
}
