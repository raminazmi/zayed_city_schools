import axios from 'axios';

export const sendWhatsAppNotification = async ({ studentId, status, message }) => {
    try {
        const response = await axios.post('/notifications/whatsapp', {
            studentId,
            status,
            message
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to send WhatsApp notification');
    }
};