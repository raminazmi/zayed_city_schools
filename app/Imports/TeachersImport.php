<?php

namespace App\Imports;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;

class TeachersImport implements ToModel
{
    private $rowIndex = 0;

    public function model(array $row)
    {
        $this->rowIndex++;
        if ($this->rowIndex == 1) {
            return null;
        }

        if (empty($row[0]) || empty($row[3])) {
            return null;
        }

        $name = trim($row[0]);
        $email = trim($row[3]);
        $role = trim($row[1]);
        $grades = trim($row[2]);

        if (Teacher::where('email', $email)->exists()) {
            return null;
        }

        $teacher = new Teacher([
            'name' => $name,
            'email' => $email,
            'phone' => null,
            'role' => $role,
            'grades' => $grades,
        ]);

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make('123456'),
            'role' => 'teacher',
            'is_first_login' => true,
        ]);
        return $teacher;
    }
}
