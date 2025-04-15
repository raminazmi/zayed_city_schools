<?php

namespace App\Traits;

use App\Models\ClassRoom;
use App\Models\Teacher;

trait AssignTeachersTrait
{
    public function assignTeachersToClasses()
    {
        // Get all teachers
        $teachers = Teacher::select('id')->get();
        if ($teachers->count() < 2) {
            return;
        }

        // Get all classes that are not soft-deleted
        $classes = ClassRoom::whereNull('deleted_at')->orderBy('id')->get();
        $totalClasses = $classes->count();

        // Group classes into sets of 4
        $classesPerGroup = 4;
        $teacherIds = $teachers->pluck('id')->toArray();

        for ($i = 0; $i < $totalClasses; $i += $classesPerGroup) {
            // Get the current group of classes (up to 4)
            $groupClasses = $classes->slice($i, $classesPerGroup);

            // Select 2 random teachers for this group
            $selectedTeacherIds = array_slice($teacherIds, ($i / $classesPerGroup) % count($teacherIds), 2);
            if (count($selectedTeacherIds) < 2) {
                $selectedTeacherIds = array_merge($selectedTeacherIds, array_slice($teacherIds, 0, 2 - count($selectedTeacherIds)));
            }

            // Assign the 2 teachers to each class in the group
            foreach ($groupClasses as $class) {
                $class->teachers()->sync($selectedTeacherIds);
            }
        }
    }
}
