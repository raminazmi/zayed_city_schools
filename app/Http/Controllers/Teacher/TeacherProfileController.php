<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Support\Facades\Auth;

class TeacherProfileController extends Controller
{

    public function edit()
    {
        return Inertia::render('Teachers/Dashboard/Profile/Edit', [
            'profileUpdateUrl' => route('teacher.profile.update'),
            'passwordUpdateUrl' => route('teacher.profile.password.update'),
        ]);
    }


    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = Auth::user();
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($user->isTeacher()) {
            $teacher = Teacher::where('email', $user->email)->first();

            if ($teacher) {
                $teacher->update([
                    'name' => $user->name,
                    'email' => $user->email,
                ]);
            }
        }

        return Redirect::route('teacher.profile.edit');
    }
}
