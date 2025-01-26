<?php

namespace App\Imports;

use App\Models\ClassRoom;
use App\Models\Teacher;
use Maatwebsite\Excel\Concerns\ToModel;

class ClassesImport implements ToModel
{
    private $rowIndex = 0;

    public function model(array $row)
    {
        $this->rowIndex++;

        // تجاهل الصف الأول (العناوين)
        if ($this->rowIndex == 1) {
            return null;
        }

        // التأكد من أن الصف يحتوي على بيانات كافية
        if (count($row) < 3) {
            return null;
        }

        // البحث عن المدرس
        $teacher = Teacher::where('name', $row[1])->first();
        if (!$teacher) {
            throw new \Exception("المدرس غير موجود: " . $row[1]);
        }

        // البحث عن الصف في قاعدة البيانات
        $classRoom = ClassRoom::where('name', $row[0])
            ->where('section', $row[2])
            ->first();

        // إذا كان الصف موجودًا بالفعل، يتم تجاهله
        if ($classRoom) {
            return null;
        }

        // إذا لم يكن الصف موجودًا، يتم إنشاؤه
        return new ClassRoom([
            'name' => $row[0],
            'section' => $row[2],
            'teacher_id' => $teacher->id,
        ]);
    }
}
