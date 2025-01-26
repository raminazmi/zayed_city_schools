<?php

namespace App\Http\Controllers\Admin;

use App\Models\ClassRoom;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ClassesImport;

class ClassRoomController extends Controller
{

    public function index()
    {
        $classes = ClassRoom::with('teacher:id,name')
            ->select('id', 'name', 'section', 'teacher_id', 'created_at')
            ->latest()
            ->paginate(10);

        return Inertia::render('Classes/Index', [
            'classes' => $classes,
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
                'section' => ['required', 'string', 'max:255'],
                'teacher_id' => ['required', 'exists:teachers,id'],
            ], [
                'name.required' => 'حقل الاسم مطلوب',
                'name.max' => 'يجب ألا يتجاوز الاسم 255 حرفًا',
                'section.required' => 'حقل القسم مطلوب',
                'section.max' => 'يجب ألا يتجاوز القسم 255 حرفًا',
                'teacher_id.required' => 'حقل المدرس مطلوب',
                'teacher_id.exists' => 'المدرس المحدد غير موجود',
            ]);

            ClassRoom::create($validated);

            return redirect()->route('admin.classes.index')->with('success', 'تم إنشاء الصف بنجاح.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }
    }

    public function edit($id)
    {
        $classRoom = ClassRoom::select('id', 'name', 'section', 'teacher_id')
            ->findOrFail($id);

        $teachers = Teacher::select('id', 'name')->get();

        return Inertia::render('Classes/Edit', [
            'classRoom' => $classRoom,
            'teachers' => $teachers,
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'section' => ['required', 'string', 'max:255'],
                'teacher_id' => ['required', 'exists:teachers,id'],
            ], [
                'name.required' => 'حقل الاسم مطلوب',
                'name.max' => 'يجب ألا يتجاوز الاسم 255 حرفًا',
                'section.required' => 'حقل القسم مطلوب',
                'section.max' => 'يجب ألا يتجاوز القسم 255 حرفًا',
                'teacher_id.required' => 'حقل المدرس مطلوب',
                'teacher_id.exists' => 'المدرس المحدد غير موجود',
            ]);

            $classRoom = ClassRoom::findOrFail($id);
            $classRoom->update($validated);

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
        $classes = ClassRoom::select('id', 'name', 'section', 'teacher_id')->get();
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
}
