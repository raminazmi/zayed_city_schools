import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Download } from 'lucide-react';

export default function ExportButton({ onExport, type = 'csv' }) {
      const { t } = useTranslation();
    return (
        <button
            onClick={onExport}
      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
              <Download className="w-4 h-4 mx-2" />
            {t('export_to_Excel')}
        </button>
    );
}

