<?php

namespace App\Http\Controllers\Teacher;

use Inertia\Inertia;
use App\Models\ClassRoom;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TeacherDashboardController extends Controller
{
    public function index()
    {
        $teacher = auth()->user();

        $classes = ClassRoom::whereHas('teacher', function ($query) use ($teacher) {
            $query->where('email', $teacher->email);
        })
            ->withCount('students')
            ->get();

        return Inertia::render('Teachers/Dashboard/Dashboard', [
            'classes' => $classes,
        ]);
    }


    public function changePassword()
    {
        return Inertia::render('Teachers/ChangePassword');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::where('email', auth()->user()->email)->first();

        if ($user) {
            $user->password = Hash::make($request->password);
            $user->is_first_login = false;
            $user->save();

            return redirect()->route('teacher.dashboard');
        }

        return back()->withErrors(['email' => 'User not found']);
    }
}
