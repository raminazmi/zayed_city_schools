<?php

namespace App\Imports;

use App\Models\Student;
use App\Models\ClassRoom;
use App\Models\Teacher;
use Maatwebsite\Excel\Concerns\ToModel;
use Illuminate\Support\Facades\Validator;

class StudentsImport implements ToModel
{
    private $rowIndex = 0;

    public function model(array $row)
    {
        $this->rowIndex++;

        // تجاهل الصف الأول (العناوين)
        if ($this->rowIndex == 1) {
            return null;
        }

        echo "▄▄▄ معالجة الصف رقم: {$this->rowIndex} ▄▄▄\n";
        echo "البيانات: " . json_encode($row) . "\n";

        try {
            // التحقق من وجود الطالب
            if (Student::where('student_number', $row[0])->exists()) {
                echo "[!] تحذير: رقم الطالب {$row[0]} موجود مسبقًا\n";
                return null;
            }

            // التحقق من صحة البيانات
            $validator = Validator::make([
                'student_number' => $row[0],
                'name' => $row[1],
                'class_name' => $row[2],
                'section' => $row[3],
                'parent_whatsapp' => (string)($row[4] ?? null),
            ], [
                'student_number' => 'required|digits:6|unique:students,student_number',
                'name' => 'required|string|max:255',
                'class_name' => 'required|string|max:255',
                'section' => 'required|regex:/^\d+\[.+\]\/\d+$/',
                'parent_whatsapp' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                $errors = implode(' | ', $validator->errors()->all());
                echo "[X] خطأ في التحقق: {$errors}\n";
                throw new \Exception($errors);
            }

            // تحليل الشعبة
            $sectionData = $this->parseSection($row[3]);
            if (!$sectionData['valid']) {
                throw new \Exception("تنسيق الشعبة غير صالح");
            }

            // إنشاء/استرجاع الصف الدراسي
            $classRoom = ClassRoom::firstOrCreate(
                ['name' => $row[2], 'section' => $sectionData['path']],
                ['teacher_id' => Teacher::first()->id ?? 1]
            );

            echo "[✓] تم معالجة الصف الدراسي: {$classRoom->name}\n";

            // إنشاء الطالب
            return new Student([
                'student_number' => $row[0],
                'name' => $row[1],
                'class_id' => $classRoom->id,
                'class_description' => $sectionData['class_description'],
                'path' => $sectionData['path'],
                'section_number' => $sectionData['section_number'],
                'parent_whatsapp' => (string)($row[4] ?? null),
            ]);
        } catch (\Exception $e) {
            echo "[X] فشل في الصف {$this->rowIndex}: " . $e->getMessage() . "\n\n";
            return null;
        }
    }

    private function parseSection($section)
    {
        if (!preg_match('/^(\d+)\[(.+)\]\/(\d+)$/', $section, $matches)) {
            echo "[X] تنسيق الشعبة غير صحيح: {$section}\n";
            return ['valid' => false];
        }

        return [
            'valid' => true,
            'class_description' => trim($matches[1]),
            'path' => trim($matches[2]),
            'section_number' => trim($matches[3])
        ];
    }
}
