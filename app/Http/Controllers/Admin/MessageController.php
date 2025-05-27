<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassRoom;
use App\Models\Student;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index()
    {
        $classes = ClassRoom::select('id', 'name', 'section', 'class_description', 'path', 'section_number')
            ->orderByRaw('CAST(class_description AS UNSIGNED) ASC')
            ->orderByRaw("CASE WHEN path = 'Adv-3rdLanguage' THEN 0 ELSE 1 END")
            ->orderBy('section_number', 'asc')
            ->get();

        return Inertia::render('MessagesPage', [
            'classes' => $classes,
        ]);
    }

    public function getStudentsByClass(Request $request, $classId)
    {
        $students = Student::where('class_id', $classId)
            ->select('id', 'name', 'student_number')
            ->get();

        Log::info("Students fetched for class $classId:", $students->toArray());
        return response()->json($students);
    }

    public function searchStudents(Request $request)
    {
        $query = $request->query('query', '');

        $students = Student::where('name', 'LIKE', "%{$query}%")
            ->orWhere('student_number', 'LIKE', "%{$query}%")
            ->select('id', 'name', 'student_number', 'class_id')
            ->with(['class' => function ($q) {
                $q->select('id', 'class_description', 'path', 'section_number');
            }])
            ->get();

        Log::info("Search students with query '$query':", $students->toArray());
        return response()->json($students);
    }

    public function sendMessage(Request $request)
    {
        Log::info('WhatsApp Message Request:', $request->all());

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'recipients' => 'required',
        ]);

        try {
            $query = Student::query();
            $recipients = $request->input('recipients');

            // Handle recipients based on type
            if (is_array($recipients) && isset($recipients['type']) && $recipients['type'] === 'students') {
                // Specific students
                $query->whereIn('id', $recipients['students']);
            } elseif ($recipients !== 'all') {
                // Specific class section
                $query->whereHas('class', function ($q) use ($recipients) {
                    $q->where('section', $recipients);
                });
            }

            // Restrict teachers to their classes
            if (auth()->user()->role === 'teacher') {
                $query->whereHas('class.teachers', function ($q) {
                    $q->where('teachers.id', auth()->id());
                });
            }

            $students = $query->get();
            if ($students->isEmpty()) {
                Log::warning('No students found.', ['recipients' => $recipients]);
                return response()->json(['message' => 'لا يوجد طلاب مطابقون'], 404);
            }

            $client = new Client(['verify' => false, 'timeout' => 10]);
            $url = 'https://api.ultramsg.com/' . env('ULTRAMSG_INSTANCE_ID') . '/messages/chat';
            $token = env('ULTRAMSG_TOKEN');

            if (!$token) {
                throw new \Exception('UltraMSG token not configured');
            }

            $successCount = 0;
            $failedNumbers = [];

            foreach ($students as $student) {
                $phone = $this->formatPhone($student->parent_whatsapp);
                if (!$phone) {
                    $failedNumbers[] = $student->parent_whatsapp ?? 'غير متوفر';
                    continue;
                }

                try {
                    $response = $client->post($url, [
                        'form_params' => [
                            'token' => $token,
                            'to' => $phone,
                            'body' => $validated['message'],
                        ],
                        'headers' => [
                            'Content-Type' => 'application/x-www-form-urlencoded',
                            'Accept' => 'application/json',
                        ],
                    ]);

                    $result = json_decode($response->getBody(), true);
                    Log::info('UltraMSG Response for ' . $phone, $result);

                    if (isset($result['sent']) && $result['sent'] === true) {
                        $successCount++;
                    } else {
                        $failedNumbers[] = $phone;
                    }
                } catch (\Exception $e) {
                    $failedNumbers[] = $phone;
                    Log::error('Failed to send to ' . $phone, ['error' => $e->getMessage()]);
                }
            }

            $message = "تم إرسال الرسائل بنجاح إلى {$successCount} من أصل {$students->count()}.";
            if (!empty($failedNumbers)) {
                $message .= ' فشل الإرسال إلى: ' . implode(', ', $failedNumbers);
            }

            return response()->json(['message' => $message]);
        } catch (\Exception $e) {
            Log::error('Error sending messages:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'حدث خطأ: ' . $e->getMessage()], 500);
        }
    }

    private function formatPhone($phone)
    {
        if (!$phone) return null;
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (strpos($phone, '00') === 0) $phone = substr($phone, 2);
        elseif (strpos($phone, '+') === 0) $phone = substr($phone, 1);
        if (preg_match('/^(5|59)/', $phone)) return '+970' . $phone; // لفلسطين
        return '+' . $phone;
    }
}
