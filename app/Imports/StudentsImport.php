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

                $classRoom->teachers()->attach($teachers->pluck('id')->toArray());
                Log::info("الصف {$this->rowIndex}: تم إنشاء صف دراسي جديد: {$classRoom->name} مع القسم {$classRoom->section} وتم تعيين المعلمين: " . $teachers->pluck('id')->implode(', '));
            }

            // معالجة رقم الهاتف
            $phone = $this->formatPhoneNumber((string)($row[4] ?? ''));

            $student = new Student([
                'student_number' => $studentNumber,
                'name' => $studentName,
                'class_id' => $classRoom->id,
                'class_description' => $sectionData['class_description'],
                'path' => $sectionData['path'],
                'section_number' => $sectionData['section_number'],
                'parent_whatsapp' => $phone,
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

    private function formatPhoneNumber($number)
    {
        // إزالة أي أحرف غير رقمية باستثناء +
        $number = preg_replace('/[^0-9+]/', '', $number);

        // إذا كان الرقم فارغًا، أعد null
        if (empty($number)) {
            return null;
        }

        // التحقق مما إذا كان الرقم يبدأ بمقدمة دولية
        if (preg_match('/^\+/', $number)) {
            return $number; // اترك الرقم كما هو إذا كان يحتوي على مقدمة
        } else {
            // إذا كان الرقم يبدأ بـ 0، قم بإزالته
            if (preg_match('/^0/', $number)) {
                $number = substr($number, 1);
            }
            // أضف المقدمة الافتراضية للإمارات
            return '+971' . $number;
        }
    }
}
