<?php

namespace App\Console\Commands;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class SyncTeachersWithUsers extends Command
{
    protected $signature = 'teachers:sync';
    protected $description = 'Sync teachers with user accounts';

    public function handle()
    {
        $teachers = Teacher::all();
        $defaultPassword = '123456';

        foreach ($teachers as $teacher) {
            User::firstOrCreate(
                ['email' => $teacher->email],
                [
                    'name' => $teacher->name,
                    'password' => Hash::make($defaultPassword),
                    'role' => 'teacher',
                    'is_first_login' => true,
                ]
            );
        }

        $this->info('Teachers synchronized successfully!');
    }
}
