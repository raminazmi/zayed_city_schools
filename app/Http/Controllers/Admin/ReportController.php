<?php

namespace App\Http\Controllers\Admin;

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
use App\Models\BehavioralAspect;

class ReportController extends Controller
{
    public function reports(Request $request)
    {
        if (Auth::user()->isAdmin()) {
            $students = Student::select('id', 'name')->get();
        } else {
            $teacher = Auth::user()->teacher;
            $students = Student::whereIn('class_id', $teacher->classes->pluck('id'))
                ->select('id', 'name')
                ->get();
        }

        $studentId = $request->query('student_id');
        $classroom = null;

        if ($studentId) {
            $student = Student::with('class')->find($studentId);
            if ($student) {
                $classroom = $student->class;
            }
        }

        return Inertia::render('Reports/Index', [
            'students' => $students,
            'student_id' => $studentId,
            'classroom' => $classroom,
        ]);
    }

    public function showAcademicReport($studentId = null)
    {
        $studentId = $studentId ?? request()->query('student_id');

        if (!$studentId) {
            return redirect()->route('admin.reports.index')->withErrors(['student_id' => 'يرجى توفير معرف الطالب']);
        }

        $student = Student::with('class')->find($studentId);

        if (!$student) {
            return redirect()->route('admin.reports.index')->withErrors(['student_id' => 'الطالب غير موجود']);
        }

        $classroom = $student->class;
        if (!$classroom) {
            return redirect()->route('admin.reports.index')->withErrors(['classroom' => 'الفصل غير موجود']);
        }

        // استرجاع المسودة إذا كانت موجودة
        $draft = AcademicReport::where('student_id', $studentId)->where('is_draft', true)->first();
        $draftData = [];
        if ($draft) {
            $subjects = StudentGrade::where('academic_report_id', $draft->id)->get()->map(function ($grade) {
                return [
                    'name' => $grade->subject_name,
                    'mark' => $grade->mark ?? 'NA',
                    'notes' => $grade->notes ?? '',
                ];
            })->toArray();

            $draftData = [
                'student_id' => $draft->student_id,
                'report_type' => $draft->report_type,
                'academic_year' => $draft->academic_year,
                'term' => $draft->term,
                'reporting_period' => $draft->reporting_period,
                'subjects' => $subjects,
                'is_draft' => $draft->is_draft,
            ];
        }

        // القيم الافتراضية
        $defaultData = [
            'academic_year' => '2024/2025',
            'term' => 'الفصل الأول',
            'reporting_period' => 'الفترة الأولى',
            'subjects' => array_map(function ($name) {
                return ['name' => $name, 'mark' => '', 'notes' => ''];
            }, [
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
            ]),
        ];

        $initialData = array_merge($defaultData, $draftData);

        return Inertia::render('Reports/AcademicReportTemplate', [
            'auth' => ['user' => auth()->user()],
            'student' => $student,
            'classroom' => $classroom,
            'initialData' => $initialData,
        ]);
    }

    public function generateReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'student_id' => 'required|exists:students,id',
                'report_type' => 'required|in:behavioral,academic',
                'academic_year' => 'required_if:report_type,behavioral|string|nullable',
                'term' => 'required_if:report_type,behavioral|string|nullable',
                'week' => 'required_if:report_type,behavioral|string|nullable',
                'behavioralAspects' => 'required_if:report_type,behavioral|array|nullable',
                'behavioralAspects.*.action' => 'nullable|string',
                'behavioralAspects.*.aspect' => 'nullable|string',
                'socialWorkerNotes' => 'nullable|string',
                'socialWorker' => 'nullable|string',
            ]);

            $student = Student::findOrFail($validated['student_id']);
            $classroom = $student->class;
            if (!$classroom) {
                return response()->json(['error' => 'الفصل غير موجود'], 500);
            }

            if ($validated['report_type'] === 'behavioral') {
                $reportHtml = view('reports.behavioral', [
                    'student' => $student,
                    'classroom' => $classroom,
                    'academic_year' => $validated['academic_year'] ?? '2024/2025',
                    'term' => $validated['term'] ?? 'الفصل الأول',
                    'week' => $validated['week'] ?? 'الأسبوع الأول',
                    'behavioralAspects' => $validated['behavioralAspects'] ?? [],
                    'socialWorkerNotes' => $validated['socialWorkerNotes'] ?? '',
                    'socialWorker' => $validated['socialWorker'] ?? '',
                ])->render();
            } else {
                $reportHtml = '';
            }

            return response()->json(['reportHtml' => $reportHtml]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'فشل التحقق من البيانات: ' . json_encode($e->errors())], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'حدث خطأ أثناء توليد التقرير: ' . $e->getMessage()], 500);
        }
    }

    public function saveDraft(Request $request)
    {
        try {
            $validated = $request->validate([
                'student_id' => 'required|exists:students,id',
                'report_type' => 'required|in:behavioral,academic',
                'academic_year' => 'required|string',
                'term' => 'required|string',
                'week' => 'nullable|string',
                'reporting_period' => 'nullable|string',
                'subjects' => 'nullable|array',
                'subjects.*.name' => 'nullable|string',
                'subjects.*.mark' => 'nullable|string',
                'subjects.*.notes' => 'nullable|string',
                'behavioralAspects' => 'nullable|array',
                'behavioralAspects.*.action' => 'nullable|string',
                'behavioralAspects.*.aspect' => 'nullable|string',
                'behavioralAspects.*.mark' => 'nullable|string',
                'socialWorkerNotes' => 'nullable|string',
                'socialWorker' => 'nullable|string',
                'is_draft' => 'required|boolean',
            ]);

            if ($validated['report_type'] === 'academic') {
                $report = AcademicReport::updateOrCreate(
                    ['student_id' => $validated['student_id'], 'is_draft' => true],
                    [
                        'report_type' => 'academic',
                        'academic_year' => $validated['academic_year'],
                        'term' => $validated['term'],
                        'reporting_period' => $validated['reporting_period'] ?? null,
                        'is_draft' => true,
                    ]
                );

                if (!empty($validated['subjects'])) {
                    StudentGrade::where('academic_report_id', $report->id)->delete();

                    foreach ($validated['subjects'] as $subject) {
                        if (!empty($subject['name']) && (isset($subject['mark']) || !empty($subject['notes']))) {
                            StudentGrade::updateOrCreate([
                                'student_id' => $validated['student_id'],
                                'academic_report_id' => $report->id,
                                'subject_name' => $subject['name'],
                                'mark' => $subject['mark'] ?? '', // دعم القيم الفارغة أو "NA"
                                'notes' => $subject['notes'] ?? '',
                                'date_added' => now(),
                            ]);
                        }
                    }
                }
            } else {
                $report = BehavioralReport::updateOrCreate(
                    ['student_id' => $validated['student_id'], 'is_draft' => true],
                    [
                        'report_type' => 'behavioral',
                        'academic_year' => $validated['academic_year'],
                        'term' => $validated['term'],
                        'week' => $validated['week'] ?? null,
                        'social_worker_notes' => $validated['socialWorkerNotes'] ?? '',
                        'social_worker' => $validated['socialWorker'] ?? '',
                        'behavioral_aspects' => $validated['behavioralAspects'] ?? [],
                        'is_draft' => true,
                    ]
                );

                if (!empty($validated['behavioralAspects'])) {
                    BehavioralAspect::where('behavioral_report_id', $report->id)->delete();
                    foreach ($validated['behavioralAspects'] as $aspect) {
                        if (!empty($aspect['aspect']) || !empty($aspect['action']) || !empty($aspect['mark'])) {
                            BehavioralAspect::updateOrCreate([
                                'behavioral_report_id' => $report->id,
                                'aspect' => $aspect['aspect'] ?? '',
                                'action' => $aspect['action'] ?? '',
                                'mark' => $aspect['mark'] === 'NA' ? null : $aspect['mark'],
                            ]);
                        }
                    }
                }
            }

            return response()->json(['message' => 'تم حفظ المسودة بنجاح']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error in saveDraft: ', $e->errors());
            return response()->json(['error' => 'فشل التحقق من البيانات: ' . json_encode($e->errors())], 422);
        } catch (\Exception $e) {
            \Log::error('Error in saveDraft: ' . $e->getMessage());
            return response()->json(['error' => 'فشل في حفظ المسودة: ' . $e->getMessage()], 500);
        }
    }

    public function getDraft($studentId, $reportType)
    {
        if ($reportType === 'academic') {
            $draft = AcademicReport::where('student_id', $studentId)->where('is_draft', true)->first();
            if ($draft) {
                $subjects = StudentGrade::where('academic_report_id', $draft->id)->get()->map(function ($grade) {
                    return [
                        'name' => $grade->subject_name,
                        'mark' => $grade->mark ?? 'NA',
                        'notes' => $grade->notes ?? '',
                    ];
                })->toArray();

                return response()->json([
                    'draft' => [
                        'student_id' => $draft->student_id,
                        'report_type' => $draft->report_type,
                        'academic_year' => $draft->academic_year,
                        'term' => $draft->term,
                        'reporting_period' => $draft->reporting_period,
                        'subjects' => $subjects,
                        'is_draft' => $draft->is_draft,
                    ]
                ]);
            }
        } else {
            $draft = BehavioralReport::where('student_id', $studentId)->where('is_draft', true)->first();
            if ($draft) {
                $aspects = BehavioralAspect::where('behavioral_report_id', $draft->id)->get()->map(function ($aspect) {
                    return [
                        'aspect' => $aspect->aspect,
                        'action' => $aspect->action,
                        'mark' => $aspect->mark ?? 'NA',
                    ];
                })->toArray();

                return response()->json([
                    'draft' => [
                        'student_id' => $draft->student_id,
                        'report_type' => $draft->report_type,
                        'academic_year' => $draft->academic_year,
                        'term' => $draft->term,
                        'week' => $draft->week,
                        'behavioralAspects' => $aspects,
                        'socialWorkerNotes' => $draft->social_worker_notes,
                        'socialWorker' => $draft->social_worker,
                        'is_draft' => $draft->is_draft,
                    ]
                ]);
            }
        }

        return response()->json(['draft' => null]);
    }

    public function sendReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'student_id' => 'required|exists:students,id',
                'report_type' => 'required|in:behavioral,academic',
                'subjects' => 'array|required_if:report_type,academic',
                'subjects.*.mark' => 'nullable|string',
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
                'is_draft' => 'required|boolean',
            ], [
                'subjects.required_if' => 'حقل المواد مطلوب للتقرير الأكاديمي.',
                'academic_year.required_if' => 'حقل السنة الأكاديمية مطلوب.',
                'term.required_if' => 'حقل الفصل الدراسي مطلوب.',
                'reporting_period.required_if' => 'حقل الفترة التقريرية مطلوب للتقرير الأكاديمي.',
                'week.required_if' => 'حقل الأسبوع مطلوب للتقرير السلوكي.',
                'behavioralAspects.required_if' => 'حقل الجوانب السلوكية مطلوب للتقرير السلوكي.',
            ]);

            $student = Student::findOrFail($validated['student_id']);
            $classroom = $student->class;
            if (!$classroom) {
                return response()->json(['error' => 'الفصل غير موجود'], 500);
            }

            if ($validated['report_type'] === 'behavioral') {
                $behavioralReports = BehavioralReport::where('student_id', $student->id)->get();
                foreach ($behavioralReports as $report) {
                    BehavioralAspect::where('behavioral_report_id', $report->id)->delete();
                    $report->delete();
                }

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
                $caption = "السيد ولي أمر الطالب {$student->name} - المقيد في الصف {$classroom->name} مرفق لكم التقرير السلوكي للطالب\n" .
                    "العام الدراسي: {$validated['academic_year']}\n" .
                    "الفصل: {$validated['term']}\n" .
                    "الأسبوع: {$validated['week']}\n" .
                    "مع تحيات مدارس مدينة زايد ح٢ و٣ ذكور";

                BehavioralReport::updateOrCreate([
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
                    'is_draft' => false,
                ]);
            } else {
                $academicReports = AcademicReport::where('student_id', $student->id)->get();
                foreach ($academicReports as $report) {
                    StudentGrade::where('academic_report_id', $report->id)->delete();
                    $report->delete();
                }

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
                        'mark' => $validated['subjects'][$index]['mark'] ?? '',
                        'notes' => $validated['subjects'][$index]['notes'] ?? '',
                    ];
                }, $subjectsList, array_keys($subjectsList));

                $academicReport = AcademicReport::updateOrCreate([
                    'student_id' => $student->id,
                    'report_type' => 'academic',
                    'academic_year' => $validated['academic_year'],
                    'term' => $validated['term'],
                    'reporting_period' => $validated['reporting_period'],
                    'report_file_url' => '',
                    'date_sent' => now(),
                    'is_draft' => false,
                ]);

                foreach ($subjects as $subject) {
                    if (!empty($subject['mark']) || !empty($subject['notes'])) {
                        StudentGrade::updateOrCreate([
                            'student_id' => $student->id,
                            'academic_report_id' => $academicReport->id,
                            'subject_name' => $subject['name'],
                            'mark' => $subject['mark'] === 'NA' ? null : $subject['mark'],
                            'notes' => $subject['notes'] ?? '',
                            'date_added' => now(),
                        ]);
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
                $caption = "السيد ولي أمر الطالب {$student->name} - المقيد في الصف {$classroom->name} مرفق لكم التقرير الأكاديمي للتقويم المستمر للفصل الدراسي {$validated['term']}\n" .
                    "العام الدراسي: {$validated['academic_year']}\n" .
                    "الفترة الاختبارية: {$validated['reporting_period']}\n" .
                    "مع تحيات مدارس مدينة زايد ح٢ و٣ ذكور";
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

    public function show($id)
    {
        $student = Student::select('id', 'name', 'student_number', 'class_id', 'parent_whatsapp', 'class_description', 'section_number', 'path')
            ->findOrFail($id);
        return response()->json(['student' => $student]);
    }

    public function classes(Request $request)
    {
        $classes = ClassRoom::with('teachers:id,name')
            ->withCount('students')
            ->whereNull('deleted_at')
            ->select(
                'id',
                'name',
                'section',
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
                'section' => $class->section,
                'class_description' => $class->class_description,
                'section_number' => $class->section_number,
                'path' => $class->path,
                'students_count' => $class->students->count(),
                'teacher_name' => $class->teachers->pluck('name')->join(', ') ?: '-',
            ];
        });

        return Inertia::render('Reports/ClassesList', [
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

        return Inertia::render('Reports/StudentsList', [
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
}
