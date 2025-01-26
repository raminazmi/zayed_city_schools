import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export class ExportService {
    static async exportToPDF(data, filename) {
        try {
            const response = await fetch('/api/reports/export/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const blob = await response.blob();
            saveAs(blob, `${filename}.pdf`);
        } catch (error) {
            throw new Error('Failed to export PDF');
        }
    }

    static async exportToCSV(data, filename) {
        try {
            const response = await fetch('/api/reports/export/csv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const blob = await response.blob();
            saveAs(blob, `${filename}.csv`);
        } catch (error) {
            throw new Error('Failed to export CSV');
        }
    }
}