<?php

namespace App\Http\Controllers\Teacher;

use App\Models\Student;
use App\Models\ClassRoom;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class TeacherStudentController extends Controller
{
    public function index()
    {
        $teacherEmail = Auth::user()->email;
        $classes = ClassRoom::with('teachers:id,name')
            ->whereHas('teachers', function ($query) use ($teacherEmail) {
                $query->where('email', $teacherEmail);
            })
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
                'class_name' => $class->name,
                'teacher_name' => $class->teachers->pluck('name')->join(', ') ?: '-',
                'section' => $class->section,
                'students_count' => $class->students->count(),
            ];
        });

        return Inertia::render('Teachers/Dashboard/Students/Index', [
            'classes' => $classesData,
        ]);
    }

    public function view(Request $request, $classId)
    {
        $students = Student::where('class_id', $classId)
            ->latest()
            ->paginate(9999999999999);

        $classes = ClassRoom::where('id', $classId)
            ->select('id', 'name')
            ->get();

        return Inertia::render('Teachers/Dashboard/Students/View', [
            'students' => $students,
            'classes' => $classes,
            'classId' => $classId,
        ]);
    }

    public function create(Request $request)
    {
        $teacherEmail = Auth::user()->email;

        $classes = ClassRoom::with(['teachers', 'students'])
            ->whereHas('teachers', function ($query) use ($teacherEmail) {
                $query->where('email', $teacherEmail);
            })
            ->select('id', 'name')
            ->paginate(9999999999999);

        return Inertia::render('Teachers/Dashboard/Students/Create', [
            'classes' => $classes->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                ];
            }),
            'classId' => $request->query('id'),
        ]);
    }


    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'student_number' => ['required', 'string', 'size:6', 'unique:students,student_number'],
                'class_id' => ['required', 'exists:classes,id'],
                'parent_whatsapp' => ['required', 'string', 'max:15'],
                'class_description' => ['required', 'integer'],
                'section_number' => ['nullable', 'string'],
                'path' => ['nullable', 'string'],
            ], [
                'name.required' => 'حقل الاسم مطلوب',
                'name.max' => 'يجب ألا يتجاوز الاسم 255 حرفًا',
                'student_number.required' => 'حقل رقم الطالب مطلوب',
                'student_number.size' => 'رقم الطالب يجب أن يتكون من 6 أرقام',
                'student_number.unique' => 'رقم الطالب موجود مسبقًا',
                'parent_whatsapp.max' => 'يجب ألا يزيد حقل WhatsApp الرئيسي عن 15 حرفًا.',
                'parent_whatsapp.required' => 'حقل رقم واتساب ولي الأمر مطلوب',
                'class_id.required' => 'حقل الصف مطلوب',
                'class_id.exists' => 'الصف المحدد غير موجود',
                'class_description.required' => 'حقل وصف الصف مطلوب',
                'class_description.integer' => 'حقل وصف الصف يجب أن يكون رقماً',
            ]);

            Student::create($validated);
            return Inertia::location("/teacher/dashboard/students/{$validated['class_id']}/view");
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    public function edit($id)
    {
        $teacherEmail = Auth::user()->email;


        $student = Student::select('id', 'name', 'student_number', 'class_id', 'parent_whatsapp', 'class_description', 'section_number', 'path')
            ->findOrFail($id);

        $classes = ClassRoom::with(['teachers', 'students'])
            ->whereHas('teachers', function ($query) use ($teacherEmail) {
                $query->where('email', $teacherEmail);
            })
            ->select('id', 'name')
            ->paginate(9999999999999);

        return Inertia::render('Teachers/Dashboard/Students/Edit', [
            'student' => $student,
            'classes' => $classes->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                ];
            }),
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'student_number' => ['required', 'string', 'size:6', 'unique:students,student_number,' . $id],
                'class_id' => ['required', 'exists:classes,id'],
                'parent_whatsapp' => ['required', 'string', 'max:15'],
                'class_description' => ['required', 'integer'],
                'section_number' => ['nullable', 'string'],
                'path' => ['nullable', 'string'],
            ], [
                'name.required' => 'حقل الاسم مطلوب',
                'name.max' => 'يجب ألا يتجاوز الاسم 255 حرفًا',
                'student_number.required' => 'حقل رقم الطالب مطلوب',
                'student_number.size' => 'رقم الطالب يجب أن يتكون من 6 أرقام',
                'student_number.unique' => 'رقم الطالب موجود مسبقًا',
                'parent_whatsapp.max' => 'يجب ألا يزيد حقل WhatsApp الرئيسي عن 15 حرفًا.',
                'parent_whatsapp.required' => 'حقل رقم واتساب ولي الأمر مطلوب',
                'class_id.required' => 'حقل الصف مطلوب',
                'class_id.exists' => 'الصف المحدد غير موجود',
                'class_description.required' => 'حقل وصف الصف مطلوب',
                'class_description.integer' => 'حقل وصف الصف يجب أن يكون رقماً',
            ]);

            $student = Student::findOrFail($id);
            $student->update($validated);
            session()->flash('success', 'تم تحديث الطالب بنجاح');
            return Inertia::location("/teacher/dashboard/students/{$validated['class_id']}/view");
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $classId = $student->class_id;
        $student->delete();
        return Inertia::location("/teacher/dashboard/students/{$classId}/view");
    }
}
