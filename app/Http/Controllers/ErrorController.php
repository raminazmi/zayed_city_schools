<?php

namespace App\Http\Controllers;

use Inertia\Inertia;


class ErrorController extends Controller
{
    public function unauthorized()
    {
        return Inertia::render('Unauthorized', [], 403);
    }
}
