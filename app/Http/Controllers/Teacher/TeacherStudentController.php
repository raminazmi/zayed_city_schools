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
                'students_count' => $class->students_count,
            ];
        });

        return Inertia::render('Teachers/Dashboard/Students/Index', [
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
        $students = Student::where('class_id', $classId)
            ->select('id', 'name', 'student_number', 'class_id', 'parent_whatsapp', 'class_description', 'section_number', 'path', 'created_at')
            ->latest()
            ->paginate(9999999999999);

        $classes = ClassRoom::where('id', $classId)->get();

        return Inertia::render('Teachers/Dashboard/Students/View', [
            'students' => $students,
            'classes' => $classes,
            'classId' => $classId,
        ]);
    }

    public function create(Request $request)
    {
        $teacherEmail = Auth::user()->email;
        $classes = ClassRoom::whereHas('teachers', function ($query) use ($teacherEmail) {
            $query->where('email', $teacherEmail);
        })
            ->select('id', 'name', 'path', 'section_number')
            ->get();

        return Inertia::render('Teachers/Dashboard/Students/Create', [
            'classes' => $classes,
            'classId' => $request->query('id'),
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
                'country_code.regex' => 'مقدمة الدولة يجب أن تبدأ بـ + متبوعة بـ 1-3 أرقام (مثل +965)',
                'class_id.required' => 'حقل الصف مطلوب',
                'class_id.exists' => 'الصف المحدد غير موجود',
            ]);

            // جلب الصف المختار
            $classroom = ClassRoom::findOrFail($validated['class_id']);

            // دمج country_code مع parent_whatsapp
            $phone = $this->formatPhoneNumber($validated['country_code'], $validated['parent_whatsapp']);

            // إنشاء الطالب مع القيم المستمدة من الصف
            Student::create([
                'name' => $validated['name'],
                'student_number' => $validated['student_number'],
                'class_id' => $validated['class_id'],
                'class_description' => $classroom->class_description,
                'section_number' => $classroom->section_number,
                'path' => $classroom->path,
                'parent_whatsapp' => $phone,
            ]);

            // جلب بيانات الفصول لإعادتها إلى صفحة Create
            $teacherEmail = Auth::user()->email;
            $classes = ClassRoom::whereHas('teachers', function ($query) use ($teacherEmail) {
                $query->where('email', $teacherEmail);
            })
                ->select('id', 'name', 'path', 'section_number')
                ->get();

            return Inertia::render('Teachers/Dashboard/Students/Create', [
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
        $teacherEmail = Auth::user()->email;
        $student = Student::select('id', 'name', 'student_number', 'class_id', 'parent_whatsapp', 'class_description', 'section_number', 'path')
            ->findOrFail($id);

        $classes = ClassRoom::whereHas('teachers', function ($query) use ($teacherEmail) {
            $query->where('email', $teacherEmail);
        })
            ->select('id', 'name', 'path', 'section_number')
            ->get();

        return Inertia::render('Teachers/Dashboard/Students/Edit', [
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
                'country_code.regex' => 'مقدمة الدولة يجب أن تبدأ بـ + متبوعة بـ 1-3 أرقام (مثل +965)',
                'class_id.required' => 'حقل الصف مطلوب',
                'class_id.exists' => 'الصف المحدد غير موجود',
            ]);

            $classroom = ClassRoom::findOrFail($validated['class_id']);
            $phone = $this->formatPhoneNumber($validated['country_code'], $validated['parent_whatsapp']);
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

    private function formatPhoneNumber($countryCode, $number)
    {
        // إزالة أي أحرف غير رقمية من الرقم
        $number = preg_replace('/[^0-9]/', '', $number);
        // إزالة أي أحرف غير رقمية أو + من المقدمة
        $countryCode = preg_replace('/[^0-9+]/', '', $countryCode);

        // إذا كان الرقم أو المقدمة فارغين، أعد null
        if (empty($number) || empty($countryCode)) {
            return null;
        }

        // دمج المقدمة مع الرقم
        return $countryCode . $number;
    }
}
