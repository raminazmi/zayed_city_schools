<?php

namespace App\Http\Controllers\Admin;

use App\Models\ClassRoom;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ClassesImport;
use App\Models\Grade;
use App\Traits\AssignTeachersTrait;

class ClassRoomController extends Controller
{
    use AssignTeachersTrait;

    public function index()
    {
        $classes = ClassRoom::with('teachers:id,name')
            ->withCount('students')
            ->whereNull('deleted_at')
            ->select(
                'id',
                'name',
                'section',
                'created_at',
                'class_description',
                'section_number',
                'path'
            )
            ->orderByRaw('CAST(class_description AS UNSIGNED) ASC')
            ->orderByRaw("CASE WHEN path = 'Adv-3rdLanguage' THEN 0 ELSE 1 END")
            ->orderBy('section_number', 'asc')
            ->paginate(9999999999999);

        $classesData = $classes->map(function ($class) {
            return [
                'id' => $class->id,
                'name' => $class->name,
                'section' => $class->section,
                'created_at' => $class->created_at,
                'class_description' => $class->class_description,
                'section_number' => $class->section_number,
                'path' => $class->path,
                'students_count' => $class->students->count(),
                'teachers' => $class->teachers->map(function ($teacher) {
                    return ['id' => $teacher->id, 'name' => $teacher->name];
                })->toArray(),
                'teacher_names' => $class->teachers->pluck('name')->join(', ') ?: '-',
            ];
        });

        return Inertia::render('Classes/Index', [
            'classes' => [
                'data' => $classesData,
                'current_page' => $classes->currentPage(),
                'last_page' => $classes->lastPage(),
                'per_page' => $classes->perPage(),
                'total' => $classes->total(),
                'links' => $classes->links(),
            ],
        ]);
    }

    public function create()
    {
        $teachers = Teacher::select('id', 'name')->get();

        return Inertia::render('Classes/Create', [
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'section' => ['required', 'string', 'max:255', 'regex:/^\d+\[.*\]\/\d+$/'],
                'teacher_ids' => ['required', 'array', 'min:1'],
                'teacher_ids.*' => ['exists:teachers,id'],
            ], [
                'name.required' => 'حقل الاسم مطلوب',
                'name.max' => 'يجب ألا يتجاوز الاسم 255 حرفًا',
                'section.required' => 'حقل القسم مطلوب',
                'section.max' => 'يجب ألا يتجاوز القسم 255 حرفًا',
                'section.regex' => 'تنسيق القسم غير صالح، يجب أن يكون على الشكل: 05[Adv-3rdLanguage]/1',
                'teacher_ids.required' => 'يجب اختيار معلم واحد على الأقل',
                'teacher_ids.*.exists' => 'المعلم المحدد غير موجود',
            ]);

            $sectionData = $this->parseSection($validated['section']);
            if (!$sectionData['valid']) {
                return back()->withErrors(['section' => 'تنسيق القسم غير صالح'])->withInput();
            }

            $grade = Grade::firstOrCreate(
                ['name' => $validated['name'], 'cycle' => 'الحلقة الثانية'],
                ['name' => $validated['name'], 'cycle' => 'الحلقة الثانية']
            );

            $validated['grade_id'] = $grade->id;
            $validated['class_description'] = $sectionData['class_description'];
            $validated['section_number'] = $sectionData['section_number'];
            $validated['path'] = $sectionData['path'];

            $classRoom = ClassRoom::create([
                'name' => $validated['name'],
                'section' => $validated['section'],
                'grade_id' => $validated['grade_id'],
                'class_description' => $validated['class_description'],
                'section_number' => $validated['section_number'],
                'path' => $validated['path'],
            ]);
            $classRoom->teachers()->sync($validated['teacher_ids']);

            return redirect()->route('admin.classes.index')->with('success', 'تم إنشاء الصف بنجاح.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }
    }

    private function parseSection($section)
    {
        if (empty($section) || !preg_match('/^(\d+)\[([^]]+)\]\/(\d+)$/', $section, $matches)) {
            return ['valid' => false];
        }

        return [
            'valid' => true,
            'class_description' => trim($matches[1]),
            'path' => trim($matches[2]),
            'section_number' => trim($matches[3]),
        ];
    }

    public function edit($id)
    {
        $classRoom = ClassRoom::with('teachers:id,name')
            ->select(
                'id',
                'name',
                'section',
                'class_description',
                'section_number',
                'path'
            )
            ->findOrFail($id);

        $teachers = Teacher::select('id', 'name')->get();

        return Inertia::render('Classes/Edit', [
            'classRoom' => [
                'id' => $classRoom->id,
                'name' => $classRoom->name,
                'section' => $classRoom->section,
                'class_description' => $classRoom->class_description,
                'section_number' => $classRoom->section_number,
                'path' => $classRoom->path,
                'teacher_ids' => $classRoom->teachers->pluck('id')->toArray(),
            ],
            'teachers' => $teachers,
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'section' => ['required', 'string', 'max:255', 'regex:/^\d+\[.*\]\/\d+$/'],
                'teacher_ids' => ['required', 'array', 'min:1'],
                'teacher_ids.*' => ['exists:teachers,id'],
            ], [
                'name.required' => 'حقل الاسم مطلوب',
                'name.max' => 'يجب ألا يتجاوز الاسم 255 حرفًا',
                'section.required' => 'حقل القسم مطلوب',
                'section.max' => 'يجب ألا يتجاوز القسم 255 حرفًا',
                'section.regex' => 'تنسيق القسم غير صالح، يجب أن يكون على الشكل: 05[Adv-3rdLanguage]/1',
                'teacher_ids.required' => 'يجب اختيار معلم واحد على الأقل',
                'teacher_ids.*.exists' => 'المعلم المحدد غير موجود',
            ]);

            $sectionData = $this->parseSection($validated['section']);
            if (!$sectionData['valid']) {
                return back()->withErrors(['section' => 'تنسيق القسم غير صالح'])->withInput();
            }

            $grade = Grade::firstOrCreate(
                ['name' => $validated['name'], 'cycle' => 'الحلقة الثانية'],
                ['name' => $validated['name'], 'cycle' => 'الحلقة الثانية']
            );

            $validated['grade_id'] = $grade->id;
            $validated['class_description'] = $sectionData['class_description'];
            $validated['section_number'] = $sectionData['section_number'];
            $validated['path'] = $sectionData['path'];

            $classRoom = ClassRoom::findOrFail($id);
            $classRoom->update([
                'name' => $validated['name'],
                'section' => $validated['section'],
                'grade_id' => $validated['grade_id'],
                'class_description' => $validated['class_description'],
                'section_number' => $validated['section_number'],
                'path' => $validated['path'],
            ]);
            $classRoom->teachers()->sync($validated['teacher_ids']);
            return redirect()->route('admin.classes.index')->with('success', 'تم تحديث الصف بنجاح.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }
    }

    public function destroy($id)
    {
        try {
            $classRoom = ClassRoom::findOrFail($id);
            $classRoom->forceDelete();
            return redirect()->route('admin.classes.index')->with('success', 'تم حذف الصف بنجاح.');
        } catch (\Exception $e) {
            return redirect()->route('admin.classes.index')->with('error', 'حدث خطأ أثناء حذف الصف.');
        }
    }

    public function getClasses()
    {
        $classes = ClassRoom::select('id', 'name', 'section')->get();
        return response()->json($classes, 200);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        Excel::import(new ClassesImport, $request->file('file'));

        return redirect()->route('admin.classes.index')->with('success', 'تم استيراد البيانات بنجاح.');
    }

    public function reassignTeachers()
    {
        $this->assignTeachersToClasses();
        return redirect()->route('admin.classes.index')->with('success', 'تم إعادة تعيين المعلمين بنجاح.');
    }
}
