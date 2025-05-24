<?php

namespace App\Http\Controllers\Teacher;

use App\Models\Student;
use App\Models\ClassRoom;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\AcademicReport;
use App\Models\BehavioralReport;
use Illuminate\Support\Facades\Auth;
use Omaralalwi\Gpdf\Gpdf;
use Omaralalwi\Gpdf\GpdfConfig;
use App\Models\StudentGrade;
use Cloudinary\Cloudinary;
use App\Models\Teacher;

class TeacherReportController extends Controller
{
    protected $teacher;
    public function __construct(Teacher $teacher)
    {
        $this->teacher = $teacher;
    }

    public function classes(Request $request)
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
                'section' => $class->section,
                'class_description' => $class->class_description,
                'section_number' => $class->section_number,
                'path' => $class->path,
                'students_count' => $class->students->count(),
                'teacher_name' => $class->teachers->pluck('name')->join(', ') ?: '-',
            ];
        });

        return Inertia::render('Teachers/Dashboard/Reports/ClassesList', [
            'classes' => $classesData,
        ]);
    }

    public function students($id, Request $request)
    {
        $classroom = ClassRoom::with('students')->findOrFail($id);

        $students = $classroom->students->map(function ($student) {
            return [
                'id' => $student->id,
                'name' => $student->name,
                'student_number' => $student->student_number,
            ];
        });

        return Inertia::render('Teachers/Dashboard/Reports/StudentsList', [
            'classroom' => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'section_number' => $classroom->section_number,
                'path' => $classroom->path,
            ],
            'students' => $students,
            'query' => $request->input('query', '')
        ]);
    }

    public function reports(Request $request)
    {
        $teacherEmail = Auth::user()->email;
        $teacher = $this->teacher->where('email', $teacherEmail)->first();

        $studentId = $request->query('student_id');
        $student = Student::whereIn('class_id', $teacher->classes->pluck('id'))
            ->find($studentId);

        if (!$student) {
            return redirect()->route('teacher.reports.index')->withErrors(['student_id' => 'الطالب غير موجود أو ليس في فصلك']);
        }

        $classroom = $student->class;

        return Inertia::render('Teachers/Dashboard/Reports/ReportsPage', [
            'student' => $student,
            'classroom' => $classroom,
            'student_id' => $studentId,
        ]);
    }

    public function show($id)
    {
        $teacherEmail = Auth::user()->email;
        $teacher = $this->teacher->where('email', $teacherEmail)->first();
        $student = Student::whereIn('class_id', $teacher->classes->pluck('id'))
            ->select('id', 'name', 'student_number', 'class_id', 'parent_whatsapp', 'class_description', 'section_number', 'path')
            ->findOrFail($id);
        return response()->json(['student' => $student]);
    }

    public function sendReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'student_id' => 'required|exists:students,id',
                'report_type' => 'required|in:behavioral,academic',
                'subjects' => 'array|required_if:report_type,academic',
                'subjects.*.mark' => 'nullable|integer|min:0|max:100',
                'subjects.*.notes' => 'nullable|string',
                'academic_year' => 'required_if:report_type,academic|required_if:report_type,behavioral|string',
                'term' => 'required_if:report_type,academic|required_if:report_type,behavioral|string',
                'reporting_period' => 'required_if:report_type,academic|string|nullable',
                'week' => 'required_if:report_type,behavioral|string|nullable',
                'behavioralAspects' => 'required_if:report_type,behavioral|array|nullable',
                'behavioralAspects.*.action' => 'nullable|string',
                'behavioralAspects.*.aspect' => 'nullable|string',
                'socialWorkerNotes' => 'nullable|string',
                'socialWorker' => 'nullable|string',
            ], [
                'subjects.*.mark.max' => 'يجب ألا تتجاوز علامة المادة ١٠٠.',
                'subjects.*.mark.min' => 'يجب ألا تقل علامة المادة عن ٠.',
                'subjects.*.mark.integer' => 'يجب أن تكون علامة المادة رقماً صحيحاً.',
                'subjects.required_if' => 'حقل المواد مطلوب للتقرير الأكاديمي.',
                'academic_year.required_if' => 'حقل السنة الأكاديمية مطلوب.',
                'term.required_if' => 'حقل الفصل الدراسي مطلوب.',
                'reporting_period.required_if' => 'حقل الفترة التقريرية مطلوب للتقرير الأكاديمي.',
                'week.required_if' => 'حقل الأسبوع مطلوب للتقرير السلوكي.',
                'behavioralAspects.required_if' => 'حقل الجوانب السلوكية مطلوب للتقرير السلوكي.',
            ]);

            $teacherEmail = Auth::user()->email;
            $teacher = $this->teacher->where('email', $teacherEmail)->first();
            $student = Student::whereIn('class_id', $teacher->classes->pluck('id'))
                ->findOrFail($validated['student_id']);
            $classroom = $student->class;
            if (!$classroom) {
                return response()->json(['error' => 'الفصل غير موجود'], 500);
            }

            if ($validated['report_type'] === 'behavioral') {
                $data = [
                    'student' => $student,
                    'classroom' => $classroom,
                    'academic_year' => $validated['academic_year'],
                    'term' => $validated['term'],
                    'week' => $validated['week'],
                    'behavioralAspects' => $validated['behavioralAspects'],
                    'socialWorkerNotes' => $validated['socialWorkerNotes'],
                    'socialWorker' => $validated['socialWorker'],
                ];
                $view = 'reports.send_behavioral';
                $filename = 'behavioral_report_' . $student->student_number . '.pdf';
                $caption = 'التقرير السلوكي للطالب: ' . $student->name . "\n" .
                    'العام الدراسي: ' . $validated['academic_year'] . "\n" .
                    'الفصل: ' . $validated['term'] . "\n" .
                    'الأسبوع: ' . $validated['week'];

                BehavioralReport::create([
                    'student_id' => $student->id,
                    'report_type' => 'behavioral',
                    'academic_year' => $validated['academic_year'],
                    'term' => $validated['term'],
                    'week' => $validated['week'],
                    'behavioral_aspects' => $validated['behavioralAspects'],
                    'social_worker_notes' => $validated['socialWorkerNotes'],
                    'social_worker' => $validated['socialWorker'],
                    'report_file_url' => '',
                    'date_sent' => now(),
                ]);
            } else {
                $subjectsList = [
                    'التربية الإسلامية',
                    'اللغة العربية',
                    'الدراسات الاجتماعية والتربية الأخلاقية',
                    'اللغة الإنجليزية English Language',
                    'الرياضيات Mathematics',
                    'العلوم Science',
                    'الفيزياء Physics',
                    'الكيمياء Chemistry',
                    'الأحياء Biology',
                    'العلوم الصحية Health Science',
                    'الحوسبة و التصميم الإبداعي و الابتكار Computing Creative Design and Innovation',
                    'التربية البدنية Physical Education',
                    'الفنون Arts'
                ];
                $subjects = array_map(function ($name, $index) use ($validated) {
                    return [
                        'name' => $name,
                        'mark' => $validated['subjects'][$index]['mark'] ?? null,
                        'notes' => $validated['subjects'][$index]['notes'] ?? '',
                    ];
                }, $subjectsList, array_keys($subjectsList));

                foreach ($subjects as $subject) {
                    if (($subject['mark'] !== null && $subject['mark'] !== '') || ($subject['notes'] !== null && $subject['notes'] !== '')) {
                        StudentGrade::updateOrCreate(
                            ['student_id' => $student->id, 'subject_name' => $subject['name']],
                            [
                                'mark' => $subject['mark'] !== '' ? $subject['mark'] : null,
                                'notes' => $subject['notes'] ?? '',
                                'date_added' => now(),
                            ]
                        );
                    }
                }

                $data = [
                    'student' => $student,
                    'classroom' => $classroom,
                    'subjects' => $subjects,
                    'academic_year' => $validated['academic_year'],
                    'term' => $validated['term'],
                    'reporting_period' => $validated['reporting_period'],
                ];
                $view = 'reports.send_academic';
                $filename = 'academic_report_' . $student->student_number . '.pdf';
                $caption = 'التقرير الأكاديمي للطالب: ' . $student->name . "\n" .
                    'العام الدراسي: ' . $validated['academic_year'] . "\n" .
                    'الفصل الدراسي: ' . $validated['term'] . "\n" .
                    'الفترة الاختبارية: ' . $validated['reporting_period'];

                AcademicReport::create([
                    'student_id' => $student->id,
                    'report_type' => 'academic',
                    'academic_year' => $validated['academic_year'],
                    'term' => $validated['term'],
                    'reporting_period' => $validated['reporting_period'],
                    'report_file_url' => '',
                    'date_sent' => now(),
                ]);
            }

            $html = view($view, $data)->render();

            $defaultConfig = config('gpdf');
            $defaultConfig['options'] = array_merge($defaultConfig['options'] ?? [], [
                'encoding' => 'UTF-8',
                'default-font' => 'Almarai',
                'isHtml5ParserEnabled' => true,
                'isFontSubsettingEnabled' => true,
                'direction' => 'rtl',
                'enable-local-file-access' => true,
                'margin-top' => 5,
                'margin-right' => 5,
                'margin-bottom' => 5,
                'margin-left' => 5,
                'orientation' => 'Portrait',
                'page-size' => 'A4',
                'image-quality' => 100,
                'disable-smart-shrinking' => true,
            ]);
            $config = new GpdfConfig($defaultConfig);
            $gpdf = new Gpdf($config);

            $pdfContent = $gpdf->generate($html);

            $tempFilePath = tempnam(sys_get_temp_dir(), 'report') . '.pdf';
            file_put_contents($tempFilePath, $pdfContent);

            $cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME', 'ds2ierzej'),
                    'api_key' => env('CLOUDINARY_API_KEY', '259915283596188'),
                    'api_secret' => env('CLOUDINARY_API_SECRET', '8CXiVYKi2nMTGv-WediKyhetjfc'),
                ],
                'secure' => true,
            ]);
            $uploadResult = $cloudinary->uploadApi()->upload($tempFilePath, [
                'folder' => 'reports',
                'public_id' => $filename,
                'resource_type' => 'raw',
                'access_mode' => 'public',
            ]);
            $publicUrl = $uploadResult['secure_url'];
            unlink($tempFilePath);

            if ($validated['report_type'] === 'behavioral') {
                BehavioralReport::where('student_id', $student->id)
                    ->where('date_sent', now())
                    ->update(['report_file_url' => $publicUrl]);
            } else {
                AcademicReport::where('student_id', $student->id)
                    ->where('date_sent', now())
                    ->update(['report_file_url' => $publicUrl]);
            }

            $phone = $this->formatPhone($student->parent_whatsapp);
            $url = 'https://api.ultramsg.com/' . env('ULTRAMSG_INSTANCE_ID') . '/messages/document';

            $client = new \GuzzleHttp\Client(['verify' => false]);
            $response = $client->post($url, [
                'form_params' => [
                    'token' => env('ULTRAMSG_TOKEN'),
                    'to' => $phone,
                    'document' => $publicUrl,
                    'filename' => $filename,
                    'caption' => $caption,
                ],
            ]);

            $result = json_decode($response->getBody(), true);
            return response()->json(['message' => 'تم إرسال التقرير بنجاح', 'url' => $publicUrl]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'حدث خطأ أثناء إرسال التقرير: ' . $e->getMessage()], 500);
        }
    }

    private function formatPhone($phone)
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (strpos($phone, '00') === 0) {
            $phone = substr($phone, 2);
        } elseif (strpos($phone, '+') === 0) {
            $phone = substr($phone, 1);
        }
        if (preg_match('/^(5|59)/', $phone)) {
            return '970' . $phone;
        }
        return $phone;
    }
}
