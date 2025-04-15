<?php

namespace App\Imports;

use App\Models\Student;
use App\Models\ClassRoom;
use App\Models\Grade;
use App\Models\Teacher;
use Maatwebsite\Excel\Concerns\ToModel;
use Illuminate\Support\Facades\Log;
use App\Traits\AssignTeachersTrait;

class StudentsImport implements ToModel
{
    use AssignTeachersTrait;

    private $rowIndex = 0;

    public function model(array $row)
    {
        $this->rowIndex++;

        if ($this->rowIndex == 1) {
            return null;
        }

        try {
            if (count($row) < 5) {
                return null;
            }

            $studentNumber = trim($row[0] ?? '');
            if (empty($studentNumber)) {
                return null;
            }

            if (Student::where('student_number', $studentNumber)->exists()) {
                return null;
            }

            if (strlen($studentNumber) > 15) {
                return null;
            }

            $sectionData = $this->parseSection(trim($row[3] ?? ''));
            if (!$sectionData['valid']) {
                return null;
            }

            $className = trim($row[2] ?? '');
            if (empty($className)) {
                return null;
            }

            $studentName = trim($row[1] ?? '');
            if (empty($studentName)) {
                return null;
            }

            $grade = Grade::firstOrCreate(
                ['name' => $className, 'cycle' => 'الحلقة الثانية'],
                ['name' => $className, 'cycle' => 'الحلقة الثانية']
            );

            $fullSection = "{$sectionData['class_description']}[{$sectionData['path']}]/{$sectionData['section_number']}";
            $classRoom = ClassRoom::where('name', $className)
                ->where('section', $fullSection)
                ->first();

            if (!$classRoom) {
                // Get at least 2 teachers to assign to the new class
                $teachers = Teacher::select('id')->take(2)->get();
                if ($teachers->count() < 1) {
                    Log::warning("الصف {$this->rowIndex}: لا يوجد معلمون متاحون لإنشاء صف دراسي جديد.");
                    return null;
                }

                $classRoom = ClassRoom::create([
                    'name' => $className,
                    'section' => $fullSection,
                    'grade_id' => $grade->id,
                    'class_description' => $sectionData['class_description'],
                    'section_number' => $sectionData['section_number'],
                    'path' => $sectionData['path'],
                ]);

                // Attach the teachers to the new class
                $classRoom->teachers()->attach($teachers->pluck('id')->toArray());

                // Removed automatic reassignment
                // $this->assignTeachersToClasses();

                Log::info("الصف {$this->rowIndex}: تم إنشاء صف دراسي جديد: {$classRoom->name} مع القسم {$classRoom->section} وتم تعيين المعلمين: " . $teachers->pluck('id')->implode(', '));
            }

            $student = new Student([
                'student_number' => $studentNumber,
                'name' => $studentName,
                'class_id' => $classRoom->id,
                'class_description' => $sectionData['class_description'],
                'path' => $sectionData['path'],
                'section_number' => $sectionData['section_number'],
                'parent_whatsapp' => (string)($row[4] ?? null),
            ]);

            return $student;
        } catch (\Exception $e) {
            Log::error("الصف {$this->rowIndex}: حدث خطأ أثناء استيراد الطالب: " . $e->getMessage());
            return null;
        }
    }

    private function parseSection($section)
    {
        if (empty($section) || !preg_match('/^(\d+)\[([^]]+)\]\/(\d+)$/', $section, $matches)) {
            return ['valid' => false];
        }

        return [
            'valid' => true,
            'class_description' => (int)trim($matches[1]),
            'path' => trim($matches[2]),
            'section_number' => (int)trim($matches[3])
        ];
    }
}
