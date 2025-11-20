<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

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


        return Inertia::render('Services/Show', [
            'slug'         => $slug,
            'currentRoute' => 'services',
        ]);
    }
}
