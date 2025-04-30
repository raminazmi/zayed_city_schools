<?php

namespace App\Http\Controllers\Admin;

use App\Models\Attendance;
use App\Models\ClassRoom;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\TeachersImport;

class TeacherController extends Controller
{

    public function index()
    {
        $teacher = auth()->user()->teacher;
        $teachers = Teacher::with(['user', 'classes'])
            ->paginate(9999999999999);
        $auth = Auth::user();

        return Inertia::render('Teachers/Index', [
            'teachers' => $teachers,
            'auth' => $auth,
        ]);
    }
    public function create()
    {
        return Inertia::render('Teachers/Create');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:teachers', 'unique:users'],
                'role' => ['nullable', 'string', 'max:255'],
                'grades' => ['nullable', 'string', 'max:255'],
            ], [
                'name.required' => 'حقل الاسم مطلوب',
                'name.max' => 'يجب ألا يتجاوز الاسم 255 حرفًا',
                'email.required' => 'حقل البريد الإلكتروني مطلوب',
                'email.email' => 'يجب أن يكون البريد الإلكتروني صالحًا',
                'email.unique' => 'البريد الإلكتروني مستخدم بالفعل',
                'role.max' => 'يجب ألا يتجاوز الدور 255 حرفًا',
                'grades.max' => 'يجب ألا تتجاوز الصفوف 255 حرفًا',
            ]);

            $teacher = Teacher::create($validated);

            User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make('123456'),
                'role' => 'teacher',
                'is_first_login' => true,
            ]);

            return Inertia::render('Teachers/Create');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    public function edit($id)
    {
        $teacher = Teacher::select('id', 'name', 'email', 'role', 'grades')
            ->findOrFail($id);

        return Inertia::render('Teachers/Edit', [
            'teacher' => $teacher,
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:teachers,email,' . $id],
                'role' => ['nullable', 'string', 'max:255'],
                'grades' => ['nullable', 'string', 'max:255'],
            ], [
                'name.required' => 'حقل الاسم مطلوب',
                'name.max' => 'يجب ألا يتجاوز الاسم 255 حرفًا',
                'email.required' => 'حقل البريد الإلكتروني مطلوب',
                'email.email' => 'يجب أن يكون البريد الإلكتروني صالحًا',
                'email.unique' => 'البريد الإلكتروني مستخدم بالفعل',
                'role.max' => 'يجب ألا يتجاوز الدور 255 حرفًا',
                'grades.max' => 'يجب ألا تتجاوز الصفوف 255 حرفًا',
            ]);

            $teacher = Teacher::findOrFail($id);
            $email = $teacher->email;
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->update([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                ]);
            } else {
                return back()->withErrors(['email' => 'المستخدم المرتبط بهذا البريد الإلكتروني غير موجود.']);
            }
            $teacher->update($validated);

            return Inertia::location(route('admin.teachers.index'));
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    public function destroy($id)
    {
        $teacher = Teacher::findOrFail($id);
        $user = User::where('email', $teacher->email)->first();
        if ($user) {
            $user->delete();
        }
        $teacher->delete();

        return redirect()->route('admin.teachers.index')->with('success', 'تم حذف الموظف والمستخدم المرتبط به بنجاح.');
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
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        Excel::import(new TeachersImport, $request->file('file'));

        return redirect()->route('admin.teachers.index')->with('success', 'تم استيراد البيانات بنجاح.');
    }
}
