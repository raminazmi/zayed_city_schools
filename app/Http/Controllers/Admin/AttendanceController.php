<?php

namespace App\Http\Controllers\Admin;

use App\Models\Attendance;
use App\Models\ClassRoom;
use App\Models\Student;
use App\Models\Teacher;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AttendanceExport;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Omaralalwi\Gpdf\Gpdf;
use Omaralalwi\Gpdf\GpdfConfig;

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
        $today = now()->toDateString();
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

        $classesData = $classes->map(function ($class) use ($today) {
            $hasAttendanceToday = Attendance::where('class_id', $class->id)
                ->where('date', $today)
                ->exists();

            return [
                'id' => $class->id,
                'class_name' => $class->name,
                'section' => $class->section,
                'created_at' => $class->created_at,
                'class_description' => $class->class_description,
                'section_number' => $class->section_number,
                'path' => $class->path,
                'students_count' => $class->students->count(),
                'teachers' => $class->teachers->map(function ($teacher) {
                    return ['id' => $teacher->id, 'name' => $teacher->name];
                })->toArray(),
                'teacher_name' => $class->teachers->pluck('name')->join(', ') ?: '-',
                'has_attendance_today' => $hasAttendanceToday,
            ];
        });

        return Inertia::render('Attendance/Index', [
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
                'notes' => $attendanceRecord ? $attendanceRecord->notes : '-',
            ];
        });

        if ($request->wantsJson()) {
            $attendances = $attendanceData->mapWithKeys(function ($item) {
                return [$item['student_id'] => $item['status']];
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

                    \Log::info('Processing student ID:', [
                        'id' => $studentId,
                        'status' => $status,
                        'lateTime' => $lateTime
                    ]);

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

    public function sendNotification(Request $request)
    {
        \Log::info('WhatsApp Notification Request:', $request->all());

        $validator = Validator::make($request->all(), [
            'phone' => ['required', 'string', 'regex:/^(\+?\d{1,4}|0)?(5|59)\d{7,8}$/'],
            'message' => 'required|string|max:1000',
        ], [
            'phone.regex' => 'يجب أن يبدأ رقم الهاتف برمز دولي (مثل +966 أو 0) متبوعاً بـ 5 أو 59'
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            if (!env('ULTRAMSG_TOKEN')) {
                throw new \Exception('UltraMSG token not configured');
            }

            $client = new \GuzzleHttp\Client([
                'timeout' => 10,
                'verify' => false
            ]);

            $response = $client->post('https://api.ultramsg.com/' . env('ULTRAMSG_INSTANCE_ID', 'instance114411') . '/messages/chat', [
                'form_params' => [
                    'token' => env('ULTRAMSG_TOKEN'),
                    'to' => $this->formatPhoneNumber($request->phone),
                    'body' => $request->message,
                ],
                'headers' => [
                    'Content-Type' => 'application/x-www-form-urlencoded',
                    'Accept' => 'application/json'
                ],
            ]);

            $result = json_decode($response->getBody(), true);
            \Log::info('UltraMSG API Response:', $result);

            if (!isset($result['sent']) || $result['sent'] !== 'true') {
                throw new \Exception($result['error'] ?? 'Unknown error from UltraMSG API');
            }

            return response()->json([
                'status' => true,
                'message' => 'تم إرسال التنبيه بنجاح'
            ]);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            \Log::error('HTTP Request Exception:', [
                'message' => $e->getMessage(),
                'response' => $e->hasResponse() ? $e->getResponse()->getBody()->getContents() : null
            ]);

            return response()->json([
                'status' => false,
                'message' => 'فشل الاتصال بخدمة الرسائل: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            \Log::error('General Exception:', ['message' => $e->getMessage()]);

            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ غير متوقع: ' . $e->getMessage()
            ], 500);
        }
    }

    private function formatPhoneNumber($phone)
    {
        // Remove any non-digit characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Check if the number starts with '00' or '+' and remove it
        if (strpos($phone, '00') === 0) {
            $phone = substr($phone, 2);
        } elseif (strpos($phone, '+') === 0) {
            $phone = substr($phone, 1);
        }

        // If the number starts with a valid country code, prepend '+'
        if (preg_match('/^(?:966|971|972|973|974|975|976|977|978|979|98|992|993|994|995|996|997|998|999|1|20|211|212|213|216|218|220|221|222|223|224|225|226|227|228|229|230|231|232|233|234|235|236|237|238|239|240|241|242|243|244|245|246|247|248|249|250|251|252|253|254|255|256|257|258|260|261|262|263|264|265|266|267|268|269|27|290|291|297|298|299|30|31|32|33|34|350|351|352|353|354|355|356|357|358|359|36|370|371|372|373|374|375|376|377|378|379|380|381|382|383|385|386|387|389|39|40|41|420|421|423|43|44|45|46|47|48|49|500|501|502|503|504|505|506|507|508|509|51|52|53|54|55|56|57|58|590|591|592|593|594|595|596|597|598|599|60|61|62|63|64|65|66|670|672|673|674|675|676|677|678|679|680|681|682|683|684|685|686|687|688|689|690|691|692|693|694|695|696|697|698|699|7|81|82|84|850|852|853|855|856|86|870|878|880|881|882|883|886|888|90|91|92|93|94|95|960|961|962|963|964|965|967|968|970|971|972|973|974|975|976|977|98|992|993|994|995|996|997|998|999)\d+$/', $phone)) {
            return '+' . $phone;
        }

        // For numbers starting with 5 or 59, or any other number without a country code, prepend '+971'
        return '+971' . $phone;
    }

    public function sendDocument(Request $request)
    {
        \Log::info('WhatsApp Document Request:', $request->all());

        $validator = Validator::make($request->all(), [
            'phone' => ['required', 'string', 'regex:/^(\+?\d{1,3}|0)?(5|59)\d{7,8}$/'],
            'document' => 'required|url',
            'filename' => 'required|string',
            'caption' => 'nullable|string|max:1000',
        ], [
            'phone.regex' => 'يجب أن يبدأ رقم الهاتف برمز دولي صالح أو 0 متبوعاً بـ 5 أو 59',
            'document.url' => 'يجب أن يكون رابط المستند صالحاً',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'status' => false,
                'message' => 'خطأ في التحقق من البيانات',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            if (!env('ULTRAMSG_TOKEN')) {
                throw new \Exception('UltraMSG token not configured');
            }

            $client = new \GuzzleHttp\Client(['verify' => false]);
            $headResponse = $client->head($request->document);
            $contentLength = $headResponse->getHeader('Content-Length')[0] ?? 0;
            $maxSize = 100 * 1024 * 1024;

            if ($contentLength > $maxSize) {
                throw new \Exception('حجم المستند يتجاوز الحد المسموح (100 ميغابايت)');
            }

            $response = $client->post('https://api.ultramsg.com/' . env('ULTRAMSG_INSTANCE_ID') . '/messages/document', [
                'form_params' => [
                    'token' => env('ULTRAMSG_TOKEN'),
                    'to' => $this->formatPhoneNumber($request->phone),
                    'document' => $request->document,
                    'filename' => $request->filename,
                    'caption' => $request->caption ?? '',
                ],
                'headers' => [
                    'Content-Type' => 'application/x-www-form-urlencoded',
                    'Accept' => 'application/json'
                ],
            ]);

            $result = json_decode($response->getBody(), true);
            \Log::info('UltraMSG Document API Response:', $result);

            if (!isset($result['sent']) || $result['sent'] !== 'true') {
                $errorMessage = is_array($result['error']) ? implode(', ', $result['error']) : $result['error'];
                throw new \Exception($errorMessage ?? 'Unknown error from UltraMSG API');
            }

            return response()->json([
                'status' => true,
                'message' => 'تم إرسال المستند بنجاح'
            ]);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $errorResponse = $e->hasResponse() ? json_decode($e->getResponse()->getBody()->getContents(), true) : null;
            $errorMessage = $errorResponse['error'] ?? $e->getMessage();

            \Log::error('HTTP Request Exception:', [
                'message' => $errorMessage,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'فشل في إرسال المستند: ' . (is_array($errorMessage) ? implode(', ', $errorMessage) : $errorMessage)
            ], 500);
        } catch (\Exception $e) {
            \Log::error('General Exception:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ غير متوقع: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generateAndSendBehavioralReport(Request $request, $studentId)
    {
        try {
            // جلب بيانات الطالب
            $student = Student::findOrFail($studentId);
            if (!$student->parent_whatsapp) {
                throw new \Exception('لا يوجد رقم هاتف مسجل لولي الأمر');
            }

            $classroom = $student->class;

            if (!$classroom) {
                throw new \Exception('الطالب غير مرتبط بفصل دراسي');
            }

            $attendanceRecords = Attendance::where('student_id', $studentId)
                ->whereBetween('date', [$request->start_date ?? now()->startOfMonth(), $request->end_date ?? now()])
                ->get();

            // توليد محتوى HTML للتقرير
            $html = view('reports.behavioral', [
                'student' => $student,
                'classroom' => $classroom,
                'attendanceRecords' => $attendanceRecords,
                'academicYear' => '2024/2025',
                'date' => now()->format('Y-m-d'),
            ])->render();

            // إعدادات Gpdf
            $defaultConfig = config('gpdf');
            if (!$defaultConfig) {
                throw new \Exception('إعدادات Gpdf غير متوفرة');
            }

            $config = new GpdfConfig($defaultConfig);
            $gpdf = new Gpdf($config);
            $pdfContent = $gpdf->generate($html);

            // التأكد من وجود المجلد
            $directory = 'reports';
            if (!Storage::disk('public')->exists($directory)) {
                Storage::disk('public')->makeDirectory($directory);
            }

            // حفظ الملف مؤقتًا
            $fileName = 'behavioral_report_' . $studentId . '_' . now()->format('YmdHis') . '.pdf';
            $filePath = $directory . '/' . $fileName;
            Storage::disk('public')->put($filePath, $pdfContent);

            // التحقق من وجود الملف
            if (!Storage::disk('public')->exists($filePath)) {
                throw new \Exception('فشل في إنشاء الملف المؤقت');
            }

            // الحصول على حجم الملف مباشرة
            $contentLength = Storage::disk('public')->size($filePath);
            $maxSize = 100 * 1024 * 1024; // 100 MB

            if ($contentLength > $maxSize) {
                throw new \Exception('حجم المستند يتجاوز الحد المسموح (100 ميغابايت)');
            }

            // إرسال المستند عبر WhatsApp
            if (!env('ULTRAMSG_TOKEN')) {
                throw new \Exception('UltraMSG token not configured');
            }

            $client = new \GuzzleHttp\Client(['verify' => false]);
            // إضافة token كمعامل GET في URL
            $url = 'https://api.ultramsg.com/' . env('ULTRAMSG_INSTANCE_ID') . '/messages/document?token=' . urlencode(env('ULTRAMSG_TOKEN'));

            $response = $client->post($url, [
                'multipart' => [
                    [
                        'name' => 'to',
                        'contents' => $this->formatPhoneNumber($student->parent_whatsapp),
                    ],
                    [
                        'name' => 'document',
                        'contents' => $pdfContent,
                        'filename' => $fileName,
                    ],
                    [
                        'name' => 'filename',
                        'contents' => $fileName,
                    ],
                    [
                        'name' => 'caption',
                        'contents' => 'تقرير سلوكي للطالب: ' . $student->name,
                    ],
                ],
            ]);

            $result = json_decode($response->getBody(), true);
            \Log::info('UltraMSG Document API Response:', $result);

            if (!isset($result['sent']) || $result['sent'] !== 'true') {
                $errorMessage = isset($result['error']) ? $this->formatErrorMessage($result['error']) : 'Unknown error from UltraMSG API';
                throw new \Exception($errorMessage);
            }

            // حذف الملف بعد الإرسال
            Storage::disk('public')->delete($filePath);

            return response()->json([
                'status' => true,
                'message' => 'تم إنشاء التقرير وإرساله بنجاح عبر WhatsApp'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error generating and sending behavioral report: ' . $e->getMessage(), [
                'studentId' => $studentId,
                'trace' => $e->getTraceAsString()
            ]);

            // محاولة حذف الملف إذا تم إنشاؤه
            if (isset($filePath) && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            return response()->json([
                'status' => false,
                'message' => 'فشل في إنشاء التقرير وإرساله: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * دالة مساعدة لتحويل رسائل الخطأ من UltraMSG إلى سلسلة نصية
     */
    private function formatErrorMessage($error)
    {
        if (is_string($error)) {
            return $error;
        }

        if (is_array($error)) {
            $messages = [];
            foreach ($error as $errorItem) {
                if (is_string($errorItem)) {
                    $messages[] = $errorItem;
                } elseif (is_array($errorItem)) {
                    $messages[] = implode(', ', array_values($errorItem));
                }
            }
            return implode('; ', $messages);
        }

        return 'Unknown error';
    }
}
