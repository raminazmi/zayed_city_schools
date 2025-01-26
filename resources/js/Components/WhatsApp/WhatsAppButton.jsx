import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { getStatusMessage } from '@/utils/messageTemplates';

const WhatsAppButton = ({ student, status }) => {
  const [loading, setLoading] = useState(false);

const handleSendMessage = () => {
  // تحقق من أن الطالب موجود وأن رقم WhatsApp موجود
  if (!student || !student.parent_whatsapp) {
    alert('رقم WhatsApp لولي الأمر غير متاح');
    return;
  }
const parent_whatsapp = student.parent_whatsapp
  const message = getStatusMessage(status, student.name);

  const url = `https://api.whatsapp.com/send?phone=${parent_whatsapp}&text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};



  return (
    <button
      onClick={handleSendMessage}
      disabled={loading}
      className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
    >
      <MessageCircle className="w-4 h-4 ml-1" />
      {loading ? 'جاري الإرسال...' : 'إرسال واتساب'}
    </button>
  );
};

export default WhatsAppButton;
