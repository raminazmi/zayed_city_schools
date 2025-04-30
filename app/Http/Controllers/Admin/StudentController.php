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
        $classes = ClassRoom::with('teachers:id,name')
            ->withCount('students')
            ->select('id', 'name', 'section', 'class_description', 'section_number', 'path')
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

        return Inertia::render('Students/Index', [
            'classes' => $classesData,
            'pagination' => [
                'current_page' => $classes->currentPage(),
                'last_page' => $classes->lastPage(),
                'per_page' => $classes->perPage(),
                'total' => $classes->total(),
                'links' => $classes->links(),
            ],
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

        $classes = ClassRoom::select('id', 'name', 'path', 'section_number')->get();

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
                'student_number' => ['required', 'string', 'max:15', 'unique:students,student_number'],
                'class_id' => ['required', 'exists:classes,id'],
                'parent_whatsapp' => ['required', 'string', 'max:15', 'regex:/^[0-9]{6,}$/'],
                'country_code' => ['required', 'string', 'regex:/^\+[0-9]{1,3}$/'],
            ], [
                'name.required' => 'حقل الاسم مطلوب',
                'name.max' => 'يجب ألا يتجاوز الاسم 255 حرفًا',
                'student_number.required' => 'حقل رقم الطالب مطلوب',
                'student_number.max' => 'رقم الطالب يجب ألا يتجاوز 15 أحرف',
                'student_number.unique' => 'رقم الطالب موجود مسبقًا',
                'parent_whatsapp.required' => 'حقل رقم واتساب ولي الأمر مطلوب',
                'parent_whatsapp.max' => 'يجب ألا يزيد حقل WhatsApp الرئيسي عن 15 حرفًا',
                'parent_whatsapp.regex' => 'رقم واتساب ولي الأمر يجب أن يحتوي على أرقام فقط (6 أرقام على الأقل)',
                'country_code.required' => 'حقل مقدمة الدولة مطلوب',
                'country_code.regex' => 'مقدمة الدولة يجب أن تبدأ بـ + متبوعة بـ 1-3 أرقام (مثل +971)',
                'class_id.required' => 'حقل الصف مطلوب',
                'class_id.exists' => 'الصف المحدد غير موجود',
            ]);

            // جلب الصف المختار
            $classroom = ClassRoom::findOrFail($validated['class_id']);

            // تنسيق رقم الهاتف
            $phone = $this->formatPhoneNumber($validated['country_code'], $validated['parent_whatsapp']);

            // إنشاء الطالب مع القيم المستمدة من الصف
            $student = Student::create([
                'name' => $validated['name'],
                'student_number' => $validated['student_number'],
                'class_id' => $validated['class_id'],
                'class_description' => $classroom->class_description,
                'section_number' => $classroom->section_number,
                'path' => $classroom->path,
                'parent_whatsapp' => $phone,
            ]);

            // جلب بيانات الفصول لإعادتها إلى صفحة Create
            $classes = ClassRoom::select('id', 'name', 'path', 'section_number')->get();

            return Inertia::render('Students/Create', [
                'classes' => $classes,
                'classId' => $validated['class_id'],
                'success' => 'تم إضافة الطالب بنجاح!',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }
    }

    public function edit($id)
    {
        $student = Student::select('id', 'name', 'student_number', 'class_id', 'parent_whatsapp', 'class_description', 'section_number', 'path')
            ->findOrFail($id);

        $classes = ClassRoom::select('id', 'name', 'path', 'section_number')->get();
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
                'student_number' => ['required', 'string', 'max:15', 'unique:students,student_number,' . $id],
                'class_id' => ['required', 'exists:classes,id'],
                'parent_whatsapp' => ['required', 'string', 'max:15', 'regex:/^[0-9]{6,}$/'],
                'country_code' => ['required', 'string', 'regex:/^\+[0-9]{1,3}$/'],
            ], [
                'name.required' => 'حقل الاسم مطلوب',
                'name.max' => 'يجب ألا يتجاوز الاسم 255 حرفًا',
                'student_number.required' => 'حقل رقم الطالب مطلوب',
                'student_number.max' => 'رقم الطالب يجب ألا يتجاوز 15 أحرف',
                'student_number.unique' => 'رقم الطالب موجود مسبقًا',
                'parent_whatsapp.required' => 'حقل رقم واتساب ولي الأمر مطلوب',
                'parent_whatsapp.max' => 'يجب ألا يزيد حقل WhatsApp الرئيسي عن 15 حرفًا',
                'parent_whatsapp.regex' => 'رقم واتساب ولي الأمر يجب أن يحتوي على أرقام فقط (6 أرقام على الأقل)',
                'country_code.required' => 'حقل مقدمة الدولة مطلوب',
                'country_code.regex' => 'مقدمة الدولة يجب أن تبدأ بـ + متبوعة بـ 1-3 أرقام (مثل +971)',
                'class_id.required' => 'حقل الصف مطلوب',
                'class_id.exists' => 'الصف المحدد غير موجود',
            ]);

            // جلب الصف المختار
            $classroom = ClassRoom::findOrFail($validated['class_id']);

            // دمج country_code مع parent_whatsapp
            $phone = $this->formatPhoneNumber($validated['country_code'], $validated['parent_whatsapp']);

            // تحديث الطالب مع القيم المستمدة من الصف
            $student = Student::findOrFail($id);
            $student->update([
                'name' => $validated['name'],
                'student_number' => $validated['student_number'],
                'class_id' => $validated['class_id'],
                'class_description' => $classroom->class_description,
                'section_number' => $classroom->section_number,
                'path' => $classroom->path,
                'parent_whatsapp' => $phone,
            ]);

            return Inertia::location("/admin/dashboard/students/{$validated['class_id']}/view");
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    private function formatPhoneNumber($countryCode, $number)
    {
        $number = preg_replace('/[^0-9]/', '', $number);
        $countryCode = preg_replace('/[^0-9+]/', '', $countryCode);
        if (empty($number) || empty($countryCode)) {
            return null;
        }
        return $countryCode . $number;
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
            $teacherCount = Teacher::count();
            if ($teacherCount < 1) {
                return redirect()->route('admin.students.index')->with('error', 'يرجى استيراد المعلمين أولاً قبل استيراد الطلاب.');
            }

            $file = $request->file('file');
            Excel::import(new StudentsImport, $file);
            return redirect()->route('admin.students.index')->with('success', 'تم استيراد البيانات بنجاح!');
        } catch (\Exception $e) {
            return redirect()->route('admin.students.index')->with('error', 'فشل في استيراد البيانات: ' . $e->getMessage());
        }
    }
}
