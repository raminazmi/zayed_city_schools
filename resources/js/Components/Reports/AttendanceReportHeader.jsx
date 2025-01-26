import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart } from 'lucide-react';
import ExportButton from './ExportButton';
import { useSelector } from "react-redux";
import { translations } from '@translations';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { toast } from 'react-toastify';
import { router } from '@inertiajs/react';

export default function AttendanceReportHeader({ onExport, role }) {
  const isDark = useSelector((state) => state.theme.darkMode === "dark");
  const language = useSelector((state) => state.language.current);
  const t = translations[language];

  const [showExportModal, setShowExportModal] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(role === "admin" ?
          '/admin/dashboard/classes/getClasses'
          :
          '/teacher/dashboard/classes/getClasses'
        );
        if (Array.isArray(response.data) && response.data.length > 0) {
          setClasses(response.data);
        } else {
          toast.error(t['no_classes_found'], { position: "top-right", autoClose: 3000 });
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error(t['error_fetching_classes'], { position: "top-right", autoClose: 3000 });
      }
    };

    fetchClasses();
  }, []);

  const handleExport = async () => {
    setShowExportModal(true);
  };

  const handleExportSubmit = () => {
    if (!selectedClass) {
      toast.error(t['date_class_required'], { position: "top-right", autoClose: 3000 });
      return;
    }

   const url = `${role === "admin" 
    ? `/admin/dashboard/attendance/export-all?class_id=${selectedClass}` 
    : `/teacher/dashboard/attendance/export-all?class_id=${selectedClass}`}`;
    window.location.href = url;
    setShowExportModal(false);
    setSelectedClass('');
  };


  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold flex items-center">
        <BarChart className={`w-5 h-5 ${language === 'en' ? 'mr-2' : 'ml-2'}`} />
        {t['attendance_report']}
      </h2>
      <div className="flex gap-2">
        <ExportButton onExport={handleExport} type='csv' />
      </div>

      <Modal show={showExportModal} onClose={() => setShowExportModal(false)}>
        <div className="p-6">
          <div className='flex justify-between gap-6'>
            <div className='w-full'>
              <InputLabel value={t['select_class']} />
              <select
                id="class_id"
                name="class_id"
                className={`appearance-none mt-1 shadow-sm focus:border-primaryColor focus:ring-primaryColor h-[45px] mt-3 block w-full p-2 border-none rounded ${isDark ? 'bg-DarkBG1 text-TextLight' : 'bg-TextLight text-TextDark'}`}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="" disabled>{t['select_class']}</option>
                {Array.isArray(classes) && classes.length > 0 ? classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                )) : <option value="" disabled>{t['no_classes_available']}</option>}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <SecondaryButton onClick={() => setShowExportModal(false)} className='mx-2 !bg-gray-600 rounded-md hover:!bg-gray-700 focus:!bg-gray-700 text-white focus:!ring-gray-500'>
              {t['cancel']}
            </SecondaryButton>
            <PrimaryButton onClick={handleExportSubmit} className="!bg-blue-600 rounded-md hover:!bg-blue-700 focus:!bg-blue-700 focus:!ring-blue-500">
              {t['export_to_Excel']}
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
