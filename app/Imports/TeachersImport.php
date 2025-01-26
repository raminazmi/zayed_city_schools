<?php

namespace App\Imports;

use App\Models\Teacher;
use App\Models\User;
use Maatwebsite\Excel\Concerns\ToModel;
use Illuminate\Support\Facades\Hash;

class TeachersImport implements ToModel
{
    private $rowIndex = 0;

    public function model(array $row)
    {
        $this->rowIndex++;

        if ($this->rowIndex == 1) {
            return null;
        }

        if (count($row) < 3) {
            return null;
        }

        $teacher = Teacher::create([
            'name' => $row[0],
            'email' => $row[1],
            'phone' => $row[2],
        ]);

        User::create([
            'name' => $row[0],
            'email' => $row[1],
            'password' => Hash::make('123456'),
            'role' => 'teacher',
            'is_first_login' => true,
        ]);

        return $teacher;
    }
}
