<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::latest()->paginate(9999999999999);


        $users->getCollection()->transform(function ($user) {
            return [
                'name' => $user->name,
                'email' => $user->email,
                'password' => $user->password,
            ];
        });

        return Inertia::render('Users/Index', ['users' => $users]);
    }


    public function create()
    {
        return Inertia::render('Users/Create');
    }

    public function createExisting()
    {

        return Inertia::render('Users/CreateExisting');
    }

    public function createNew()
    {
        return Inertia::render('Users/CreateNew');
    }

    public function store(Request $request)
    {

        return redirect()->route('Users.index')->with('success', 'User created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('Users/Edit');
    }

    public function update(Request $request, $id)
    {

        return redirect()->route('Users.index')->with('success', 'User updated successfully.');
    }
    public function destroy($id)
    {
        $order = Category::findOrFail($id);
        $order->delete();
        return redirect()->route('Users.index')->with('success', 'User deleted successfully.');
    }
}
