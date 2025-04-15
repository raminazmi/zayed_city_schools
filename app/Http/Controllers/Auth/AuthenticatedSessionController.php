<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = Auth::user();

        if ($user->role !== $request->input('role')) {
            Auth::logout();
            return back()->withErrors([
                'role' => 'الدور المحدد لا يتطابق مع حسابك.',
            ]);
        }

        if ($user->isAdmin()) {
            return redirect()->intended('/admin/dashboard/home');
        }

        if ($user->isTeacher()) {
            return redirect()->intended('/teacher/dashboard/home');
        }

        return to_route('root');
    }



    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('root');
    }
}
