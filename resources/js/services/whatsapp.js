// WhatsApp messaging service
export const sendWhatsAppMessage = async (studentId, status, message) => {
    try {
        const response = await fetch('/api/notifications/whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentId, status, message }),
        });

        if (!response.ok) throw new Error('Failed to send notification');
        return await response.json();
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};