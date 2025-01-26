<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Twilio\Rest\Client;

class MessageController extends Controller
{
    public function sendWhatsAppMessage(Request $request)
    {
        // التحقق من صحة البيانات
        $validated = $request->validate([
            'to' => 'required|string',
            'message' => 'required|string',
        ]);

        // استخراج مفاتيح Twilio من ملف .env
        $sid = env('TWILIO_ACCOUNT_SID');
        $token = env('TWILIO_AUTH_TOKEN');
        $twilio = new Client($sid, $token);

        try {
            // إرسال الرسالة
            $message = $twilio->messages->create(
                "whatsapp:" . $validated['to'], // الرقم المرسل إليه
                [
                    'from' => env('TWILIO_WHATSAPP_NUMBER'), // الرقم المرسل منه
                    'body' => $validated['message'], // نص الرسالة
                ]
            );

            // إرجاع رسالة نجاح
            return response()->json([
                'success' => true,
                'message' => 'تم إرسال الرسالة بنجاح!',
                'message_sid' => $message->sid,
            ]);
        } catch (\Exception $e) {
            // إرجاع رسالة خطأ في حالة فشل الإرسال
            return response()->json([
                'success' => false,
                'message' => 'فشل إرسال الرسالة: ' . $e->getMessage(),
            ], 500);
        }
    }
}
