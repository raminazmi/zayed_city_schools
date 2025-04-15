<?php

namespace App\Imports;

use App\Models\ClassRoom;
use App\Models\Grade;
use App\Models\Teacher;
use Maatwebsite\Excel\Concerns\ToModel;

class ClassesImport implements ToModel
{
    private $rowIndex = 0;

    public function model(array $row)
    {
        $this->rowIndex++;
        if ($this->rowIndex == 1) {
            return null;
        }

        try {
            if (count($row) < 2) {
                return null;
            }

            $className = trim($row[0] ?? '');
            $section = trim($row[1] ?? '');

            if (empty($className) || empty($section)) {
                return null;
            }

            $grade = Grade::firstOrCreate(
                ['name' => $className, 'cycle' => 'الحلقة الثانية'],
                ['name' => $className, 'cycle' => 'الحلقة الثانية']
            );

            if (ClassRoom::where('name', $className)->where('section', $section)->exists()) {
                return null;
            }

            $teachers = Teacher::take(2)->get();
            if ($teachers->count() < 1) {
                return null;
            }
            $teacher = $teachers[$this->rowIndex % 2];

            $classRoom = ClassRoom::create([
                'name' => $className,
                'section' => $section,
                'grade_id' => $grade->id,
                'teacher_id' => $teacher->id,
            ]);

            return $classRoom;
        } catch (\Exception $e) {
            return null;
        }
    }
}
