<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\ClassRoom;
use App\Models\Student;
use App\Models\Teacher;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AttendanceExport;

class AttendanceController extends Controller
{
    const STATUS_PRESENT = 'present';
    const STATUS_ABSENT = 'absent';
    const STATUS_LATE = 'late';

    protected $attendance;
    protected $classRoom;
    protected $student;
    protected $teacher;

    public function __construct(Attendance $attendance, ClassRoom $classRoom, Student $student, Teacher $teacher)
    {
        $this->attendance = $attendance;
        $this->classRoom = $classRoom;
        $this->student = $student;
        $this->teacher = $teacher;
    }

    public function index()
    {
        $attendances = Attendance::with(['student', 'class'])
            ->latest()
            ->paginate(9999999999999);

        $classes = ClassRoom::with(['teacher', 'students'])
            ->select('id', 'name', 'section', 'teacher_id', 'created_at')
            ->latest()
            ->paginate(9999999999999);

        $classesData = $classes->map(function ($class) {
            return [
                'id' => $class->id,
                'class_name' => $class->name,
                'teacher_name' => $class->teacher ? $class->teacher->name : 'N/A',
                'section' => $class->section,
                'students_count' => $class->students->count(),
            ];
        });

        return Inertia::render('Attendance/Index', [
            'attendances' => $attendances,
            'classes' => $classesData,
        ]);
    }

    public function viewAttendance($id, Request $request)
    {
        $classroom = ClassRoom::find($id);
        if (!$classroom) {
            return redirect()->back()->with('error', 'Classroom not found');
        }

        $date = $request->query('date');
        if (!$date) {
            return redirect()->back()->with('error', 'Date is required');
        }

        $students = $classroom->students;
        $attendanceRecords = Attendance::with(['student' => function ($query) {
            $query->select('id', 'name', 'parent_whatsapp');
        }])
            ->where('class_id', $classroom->id)
            ->where('date', $date)
            ->get()
            ->keyBy('student_id');

        $attendanceData = $students->map(function ($student) use ($attendanceRecords, $date) {
            $attendanceRecord = $attendanceRecords->get($student->id);

            return [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'parent_whatsapp' => $student->parent_whatsapp,
                'status' => $attendanceRecord ? $attendanceRecord->status : 'not_taken',
                'notes' => $attendanceRecord && $attendanceRecord->status === 'late' ? $attendanceRecord->notes : null,
            ];
        });

        if ($request->wantsJson()) {
            $attendances = $attendanceData->mapWithKeys(function ($item) {
                return [
                    $item['student_id'] => $item['status'] === 'late'
                        ? ['status' => $item['status'], 'lateTime' => $item['notes']]
                        : $item['status']
                ];
            });

            return response()->json(['attendance' => $attendances]);
        }

        return Inertia::render('Attendance/View', [
            'classroom' => $classroom,
            'attendance' => $attendanceData,
            'date' => $date,
        ]);
    }

    public function create()
    {
        $students = $this->student->select('id', 'name')->get();
        $classes = $this->classRoom->select('id', 'name', 'section')->get();

        return Inertia::render('Attendance/Create', [
            'students' => $students,
            'classes' => $classes
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $this->validateAttendance($request);

            $this->attendance->create($validated);

            return Inertia::location(route('admin.attendance.index'));
        } catch (ValidationException $e) {
            return $this->handleValidationException($e);
        }
    }

    public function edit($id)
    {
        $attendance = $this->attendance->with(['student', 'class'])->findOrFail($id);
        $students = $this->student->select('id', 'name')->get();
        $classes = $this->classRoom->select('id', 'name', 'section')->get();

        return Inertia::render('Attendance/Edit', [
            'attendance' => $attendance,
            'students' => $students,
            'classes' => $classes
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $this->validateAttendance($request);
            $attendance = $this->attendance->findOrFail($id);
            $attendance->update($validated);

            return Inertia::location(route('admin.attendance.index'));
        } catch (ValidationException $e) {
            return $this->handleValidationException($e);
        }
    }

    public function destroy($id)
    {
        $attendance = $this->attendance->findOrFail($id);
        $attendance->delete();

        return Inertia::location(route('admin.attendance.index'));
    }

    public function getAttendanceStats(Request $request)
    {
        $period = $request->input('period', 'daily');
        $attendanceData = $this->getAttendanceData($period);

        return response()->json($this->formatAttendanceStats($attendanceData, $period));
    }

    public function getAttendanceStatistics()
    {
        return response()->json([
            'students_count' => $this->student->count(),
            'teachers_count' => $this->teacher->count(),
            'classes_count' => $this->classRoom->count(),
            'total_student_attendance' => $this->attendance->count(),
        ]);
    }

    public function report(Request $request)
    {
        $attendances = $this->attendance->with(['student', 'class'])
            ->when($request->date_from, fn($query) => $query->whereDate('date', '>=', $request->date_from))
            ->when($request->date_to, fn($query) => $query->whereDate('date', '<=', $request->date_to))
            ->get();

        return Inertia::render('Attendance/Report', [
            'attendances' => $attendances
        ]);
    }

    private function validateAttendance(Request $request)
    {
        return $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'class_id' => ['required', 'exists:classes,id'],
            'date' => ['required', 'date'],
            'status' => ['required', 'in:' . self::STATUS_PRESENT . ',' . self::STATUS_ABSENT . ',' . self::STATUS_LATE],
            'notes' => ['nullable', 'string', 'max:255']
        ], [
            'student_id.required' => 'حقل الطالب مطلوب',
            'student_id.exists' => 'الطالب المحدد غير موجود',
            'class_id.required' => 'حقل الصف مطلوب',
            'class_id.exists' => 'الصف المحدد غير موجود',
            'date.required' => 'حقل التاريخ مطلوب',
            'date.date' => 'يجب أن يكون التاريخ صالحًا',
            'status.required' => 'حقل الحالة مطلوب',
            'status.in' => 'حالة الحضور غير صالحة',
            'notes.max' => 'يجب ألا تتجاوز الملاحظات 255 حرفًا'
        ]);
    }

    private function handleValidationException(ValidationException $e)
    {
        return back()->withErrors($e->errors());
    }

    private function getAttendanceData($period)
    {
        $attendanceQuery = $this->attendance->query();

        if ($period == 'daily') {
            return $attendanceQuery->selectRaw('date, status, count(*) as count')
                ->whereDate('date', now()->toDateString())
                ->groupBy('date', 'status')
                ->orderBy('date')
                ->get();
        } elseif ($period == 'weekly') {
            return $attendanceQuery->selectRaw('WEEK(date) as week, status, count(*) as count')
                ->whereBetween('date', [
                    now()->startOfWeek()->toDateString(),
                    now()->endOfWeek()->toDateString()
                ])
                ->groupByRaw('WEEK(date), status')
                ->orderBy('week')
                ->get();
        } elseif ($period == 'monthly') {
            return $attendanceQuery->selectRaw('MONTH(date) as month, status, count(*) as count')
                ->whereMonth('date', now()->month)
                ->groupByRaw('MONTH(date), status')
                ->orderBy('month')
                ->get();
        } elseif ($period == 'yearly') {
            return $attendanceQuery->selectRaw('YEAR(date) as year, status, count(*) as count')
                ->whereYear('date', now()->year)
                ->groupByRaw('YEAR(date), status')
                ->orderBy('year')
                ->get();
        }

        return collect();
    }

    private function formatAttendanceStats($attendanceData, $period)
    {
        $labels = [];
        $presentData = [];
        $absentData = [];
        $lateData = [];

        foreach ($attendanceData as $attendance) {
            if ($period == 'daily') {
                $labels[] = $attendance->date;
            } elseif ($period == 'weekly') {
                $labels[] = 'Week ' . $attendance->week;
            } elseif ($period == 'monthly') {
                $labels[] = 'Month ' . $attendance->month;
            } elseif ($period == 'yearly') {
                $labels[] = 'Year ' . $attendance->year;
            }

            switch ($attendance->status) {
                case self::STATUS_PRESENT:
                    $presentData[] = $attendance->count;
                    break;
                case self::STATUS_ABSENT:
                    $absentData[] = $attendance->count;
                    break;
                case self::STATUS_LATE:
                    $lateData[] = $attendance->count;
                    break;
            }
        }

        $totalCount = array_sum($presentData) + array_sum($absentData) + array_sum($lateData);
        return [
            'stats' => [
                'presentRate' => $totalCount > 0 ? round((array_sum($presentData) / $totalCount) * 100, 2) : 0,
                'absentRate' => $totalCount > 0 ? round((array_sum($absentData) / $totalCount) * 100, 2) : 0,
                'lateRate' => $totalCount > 0 ? round((array_sum($lateData) / $totalCount) * 100, 2) : 0,
            ],
            'chart' => [
                'labels' => $labels,
                'present' => $presentData,
                'absent' => $absentData,
                'late' => $lateData,
            ]
        ];
    }

    public function export($id, Request $request)
    {
        $classroom = ClassRoom::with(['students.attendances'])->findOrFail($id);

        $date = $request->input('date') ?: now()->toDateString();

        if (!$date) {
            return response()->json(['message' => 'Date is required'], 400);
        }

        $attendances = Student::select(
            'students.name as Student',
            'classes.name as Class',
            DB::raw("'$date' as Date"),
            DB::raw('COALESCE(attendances.status, "N/A") as Status')
        )
            ->join('classes', 'students.class_id', '=', 'classes.id')
            ->leftJoin('attendances', function ($join) use ($date) {
                $join->on('students.id', '=', 'attendances.student_id')
                    ->where('attendances.date', '=', $date);
            })
            ->where('students.class_id', $classroom->id)
            ->get();

        return Excel::download(new AttendanceExport($attendances), 'attendance_report.xlsx');
    }

    public function exportALL(Request $request)
    {
        $class_id = $request->input('class_id');
        if (!$class_id) {
            return response()->json(['message' => 'Class ID is required'], 400);
        }
        $classroom = ClassRoom::findOrFail($class_id);

        $attendances = Student::select(
            'students.name as Student',
            'classes.name as Class',
            'attendances.date as Date',
            DB::raw('COALESCE(attendances.status, "N/A") as Status'),
            'attendances.notes as Notes'
        )
            ->join('classes', 'students.class_id', '=', 'classes.id')
            ->leftJoin('attendances', 'students.id', '=', 'attendances.student_id')
            ->where('students.class_id', $classroom->id)
            ->orderBy('attendances.date', 'asc')
            ->get();

        return Excel::download(new AttendanceExport($attendances), 'attendance_report.xlsx');
    }

    public function checkAttendance($id, Request $request)
    {
        $classroom = ClassRoom::with(['students.attendances'])->findOrFail($id);
        $date = $request->input('date') ?: now()->toDateString();

        $hasNullAttendance = $classroom->students->some(function ($student) use ($date) {
            $attendance = $student->attendances->firstWhere('date', $date);
            return !$attendance || $attendance->status === null || $attendance->status === 'N/A';
        });

        return response()->json(['hasNullAttendance' => $hasNullAttendance]);
    }

    public function attendance($id, Request $request)
    {
        $url = $request->fullUrl();
        $urlParts = explode('/', $url);
        $id = $urlParts[count($urlParts) - 2];
        $classroom = ClassRoom::with('students')->findOrFail($id);
        $date = $request->query('date');
        return Inertia::render('Attendance/Attendance', [
            'classroom' => $classroom,
            'students' => $classroom->students,
            'classId' => $id,
            'date' => $date,
        ]);
    }

    public function saveAttendance(Request $request, $id)
    {
        try {
            $classroom = ClassRoom::findOrFail($id);
            $attendanceData = $request->input('attendance');
            $date = $request->input('date') ?: now()->toDateString();

            if (!$attendanceData || !$date) {
                throw new \Exception('Missing required data');
            }

            $validStatuses = ['present', 'absent', 'late'];

            DB::transaction(function () use ($attendanceData, $classroom, $date, $validStatuses) {
                foreach ($attendanceData as $studentId => $data) {
                    $student = Student::where('id', $studentId)
                        ->where('class_id', $classroom->id)
                        ->firstOrFail();

                    $status = is_array($data) ? $data['status'] : $data;
                    $lateTime = is_array($data) && isset($data['lateTime']) ? $data['lateTime'] : null;

                    if (!in_array($status, $validStatuses)) {
                        throw new \Exception('Invalid status value for student ID: ' . $studentId);
                    }

                    Attendance::updateOrCreate(
                        [
                            'class_id' => $classroom->id,
                            'student_id' => $studentId,
                            'date' => $date
                        ],
                        [
                            'status' => $status,
                            'notes' => $status === 'late' ? $lateTime : null
                        ]
                    );
                }
            });

            return response()->json(['message' => 'Attendance saved successfully!']);
        } catch (\Exception $e) {
            \Log::error('Error saving attendance: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to save attendance: ' . $e->getMessage()], 500);
        }
    }
}
