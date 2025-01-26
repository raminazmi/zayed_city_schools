<?php

namespace App\Http\Controllers\Admin;

use App\Models\Attendance;
use App\Models\ClassRoom;
use App\Models\Student;
use App\Models\Teacher;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\StudentsImport;

class StudentController extends Controller
{
    public function index()
    {
        $classes = ClassRoom::with(['teacher', 'students'])
            ->select('id', 'name', 'section', 'teacher_id', 'created_at')
            ->latest()
            ->paginate(9999999999999);

        $classesData = $classes->map(function ($class) {
            return [
                'id' => $class->id,
                'class_name' => $class->name,
                'teacher_name' => $class->teacher ? $class->teacher->name : '-',
                'section' => $class->section,
                'students_count' => $class->students->count(),
            ];
        });
        return Inertia::render('Students/Index', [
            'classes' => $classesData,
        ]);
    }

    public function view(Request $request, $classId)
    {
        $url = $request->fullUrl();
        $urlParts = explode('/', $url);
        $id = $urlParts[count($urlParts) - 2];
        $students = Student::where('class_id', $classId)
            ->select('id', 'name', 'student_number', 'class_id', 'parent_whatsapp', 'class_description', 'section_number', 'path', 'created_at')
            ->latest()
            ->paginate(9999999999999);

        $classes = ClassRoom::where('id', $classId)
            ->select('id', 'name')
            ->get();

        return Inertia::render('Students/View', [
            'students' => $students,
            'classes' => $classes,
            'classId' => $id,
        ]);
    }

    public function create(Request $request)
    {
        $url = $request->fullUrl();
        $parsedUrl = parse_url($url);
        parse_str($parsedUrl['query'], $queryParams);
        $id = isset($queryParams['id']) ? $queryParams['id'] : null;

        $classes = ClassRoom::select('id', 'name')->get();

        return Inertia::render('Students/Create', [
            'classes' => $classes,
            'classId' => $id,
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

            $student = Student::create($validated);
            return Inertia::location("/admin/dashboard/students/{$validated['class_id']}/view");
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    public function edit($id)
    {
        $student = Student::select('id', 'name', 'student_number', 'class_id', 'parent_whatsapp', 'class_description', 'section_number', 'path')
            ->findOrFail($id);

        $classes = ClassRoom::select('id', 'name')->get();
        return Inertia::render('Students/Edit', [
            'student' => $student,
            'classes' => $classes,
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
            return Inertia::location("/admin/dashboard/students/{$validated['class_id']}/view");
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $classId = $student->class_id;
        $student->delete();
        return Inertia::location("/admin/dashboard/students/{$classId}/view");
    }

    public function getAttendanceStats()
    {
        $presentCount = Attendance::where('status', 'present')->count();
        $absentCount = Attendance::where('status', 'absent')->count();
        $lateCount = Attendance::where('status', 'late')->count();

        $totalCount = $presentCount + $absentCount + $lateCount;

        $data = [
            'stats' => [
                'presentRate' => $totalCount > 0 ? round(($presentCount / $totalCount) * 100, 2) : 0,
                'absentRate' => $totalCount > 0 ? round(($absentCount / $totalCount) * 100, 2) : 0,
                'lateRate' => $totalCount > 0 ? round(($lateCount / $totalCount) * 100, 2) : 0,
            ],
            'chart' => []
        ];

        return response()->json($data);
    }

    public function getAttendanceStatistics()
    {
        $studentsCount = Student::count();
        $teachersCount = Teacher::count();
        $classesCount = ClassRoom::count();
        $totalStudentAttendance = Attendance::count();

        $data = [
            'students_count' => $studentsCount,
            'teachers_count' => $teachersCount,
            'classes_count' => $classesCount,
            'total_student_attendance' => $totalStudentAttendance,
        ];

        return response()->json($data);
    }

    public function report(Request $request)
    {
        $attendances = Attendance::with(['student', 'class'])
            ->when($request->date_from, function ($query) use ($request) {
                return $query->whereDate('date', '>=', $request->date_from);
            })
            ->when($request->date_to, function ($query) use ($request) {
                return $query->whereDate('date', '<=', $request->date_to);
            })
            ->get();

        return Inertia::render('Attendance/Report', [
            'attendances' => $attendances
        ]);
    }

    public function import(Request $request)
    {
        try {

            $file = $request->file('file');

            Excel::import(new StudentsImport, $file);

            return redirect()->route('admin.students.index')->with('success', 'تم استيراد البيانات بنجاح!');
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
