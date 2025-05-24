import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { useForm } from '@inertiajs/react';
import { translations } from '@translations';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TeacherAcademicReportTemplate from './AcademicReportTemplate';
import TeacherBehavioralReportTemplate from './BehavioralReportTemplate';
import { FaBook, FaUser } from 'react-icons/fa';

export default function TeacherReportsPage({ auth, classroom }) {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language] || translations['en'];
    const { props } = usePage();
    const studentId = props.student_id || null;

    const subjectsList = [
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

    const { data, setData } = useForm({
        student_id: studentId,
        report_type: 'behavioral',
        academic_year: props.initialData?.academic_year || '2024/2025',
        term: props.initialData?.term || 'الفصل الأول',
        week: props.initialData?.week || 'الأسبوع الأول',
        reporting_period: props.initialData?.reporting_period || 'الفترة الأولى',
        subjects: props.initialData?.subjects || subjectsList.map((name) => ({ name, mark: '', notes: '' })),
        behavioralAspects: props.initialData?.behavioralAspects || [
            { action: '', aspect: '' },
            { action: '', aspect: '' },
            { action: '', aspect: '' },
            { action: '', aspect: '' },
            { action: '', aspect: '' },
            { action: '', aspect: '' },
            { action: '', aspect: '' },
        ],
        socialWorkerNotes: '',
        socialWorker: '',
    });

    const [reportHtml, setReportHtml] = useState('');
    const [studentDetails, setStudentDetails] = useState(props.student || null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    const [reportUrl, setReportUrl] = useState('');
    const [showAcademicTemplate, setShowAcademicTemplate] = useState(false);
    const [showBehavioralTemplate, setShowBehavioralTemplate] = useState(false);

    useEffect(() => {
        if (studentId && !studentDetails) {
            fetchStudentDetails(studentId);
        } else if (studentId) {
            setData('student_id', studentId);
            setError(null);
        } else {
            setError(t['select_student_first'] || 'Please provide a student ID in the URL (e.g., ?student_id=18)');
        }
    }, [studentId]);

    useEffect(() => {
        if (studentId && studentDetails) {
            handleGeneratePreview();
        }
    }, [data.report_type, studentId, studentDetails]);

    const fetchStudentDetails = async (id) => {
        try {
            const response = await axios.get(`/teacher/dashboard/reports/${id}`);
            setStudentDetails(response.data.student);
            setError(null);
        } catch (error) {
            setStudentDetails(null);
            setError(t['student_not_found'] || 'Student not found');
            toast.error(t['student_not_found'] || 'Student not found', { position: "top-right", autoClose: 3000 });
        }
    };

    const handleGeneratePreview = async () => {
        if (!studentId || !studentDetails) {
            toast.error(t['select_student_first'] || 'Please select a student first', { position: "top-right", autoClose: 3000 });
            return;
        }
        setIsGenerating(true);
        try {
            if (data.report_type === 'behavioral') {
                setShowBehavioralTemplate(true);
                setShowAcademicTemplate(false);
                setReportHtml('');
            } else if (data.report_type === 'academic') {
                setShowAcademicTemplate(true);
                setShowBehavioralTemplate(false);
                setReportHtml('');
            }
            setError(null);
        } catch (error) {
            const errorMessage = error.response?.data?.error || (t['failed_to_generate_report'] || 'Failed to generate report');
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendReport = async () => {
        setIsSending(true);
        try {
            const payload = {
                student_id: data.student_id,
                report_type: data.report_type,
                academic_year: data.academic_year,
                term: data.term,
                week: data.week,
                reporting_period: data.reporting_period,
                subjects: data.subjects,
                behavioralAspects: data.behavioralAspects,
                socialWorkerNotes: data.socialWorkerNotes,
                socialWorker: data.socialWorker,
            };

            const response = await axios.post('/teacher/dashboard/reports/send-report', payload, {
                headers: { 'Accept': 'application/json' },
            });
            toast.success(response.data.message || (t['report_sent_success'] || 'Report sent successfully'));
            setReportUrl(response.data.url || '');
        } catch (error) {
            const errorMessage = error.response?.data?.error || (t['failed_to_send_report'] || 'Failed to send report');
            toast.error(errorMessage);
        } finally {
            setIsSending(false);
        }
    };

    const handleInputChange = (field, value) => {
        setData(field, value);
    };

    const handleSubjectChange = (index, field, value) => {
        const updatedSubjects = [...data.subjects];
        updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
        setData('subjects', updatedSubjects);
    };

    const handleBehavioralChange = (index, field, value) => {
        const updatedAspects = [...data.behavioralAspects];
        updatedAspects[index] = { ...updatedAspects[index], [field]: value };
        setData('behavioralAspects', updatedAspects);
    };

    const handleReportTypeChange = (type) => {
        setData('report_type', type);
    };

    const breadcrumbItems = [
        { label: t['reports'] || 'Reports', href: '/teacher/dashboard/reports' },
        { label: classroom.name + ' / ' + classroom.path + ' / ' + (t['section'] || 'Section') + ' ' + classroom.section_number },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t['reports'] || 'Reports'} />
            <div className="flex h-[calc(100vh-66px)]">
                <main className="flex-1 overflow-y-auto">
                    <div className="py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-14">
                            <Breadcrumb items={breadcrumbItems} />
                            <h1 className="text-2xl sm:text-3xl mt-3 font-bold text-primaryColor">
                                {t['reports'] || 'Reports'}
                            </h1>
                        </div>
                        <div className="mx-auto px-4 sm:px-6 md:px-16 mt-6">
                            {error && <p className="text-red-600 mb-4">{error}</p>}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => handleReportTypeChange('behavioral')}
                                            className={`flex items-center px-4 py-2 rounded-md text-white font-medium ${data.report_type === 'behavioral'
                                                ? 'bg-blue-600'
                                                : isDark
                                                    ? 'bg-gray-700 hover:bg-gray-600'
                                                    : 'bg-gray-500 hover:bg-gray-400'
                                                }`}
                                        >
                                            <FaUser className="ml-2" />
                                            {t['behavioral'] || 'Behavioral'}
                                        </button>
                                        <button
                                            onClick={() => handleReportTypeChange('academic')}
                                            className={`flex items-center px-4 py-2 rounded-md text-white font-medium ${data.report_type === 'academic'
                                                ? 'bg-blue-600'
                                                : isDark
                                                    ? 'bg-gray-700 hover:bg-gray-600'
                                                    : 'bg-gray-500 hover:bg-gray-400'
                                                }`}
                                        >
                                            <FaBook className="ml-2" />
                                            {t['academic'] || 'Academic'}
                                        </button>
                                    </div>
                                </div>
                                {showBehavioralTemplate && data.report_type === 'behavioral' && studentDetails && (
                                    <TeacherBehavioralReportTemplate
                                        studentDetails={studentDetails}
                                        classroom={props.classroom || { name: 'غير متوفر', section_number: 'غير متوفر' }}
                                        data={data}
                                        onInputChange={handleInputChange}
                                        onBehavioralChange={handleBehavioralChange}
                                        onSendReport={handleSendReport}
                                        isSending={isSending}
                                        t={t}
                                    />
                                )}
                                {showAcademicTemplate && data.report_type === 'academic' && studentDetails && (
                                    <TeacherAcademicReportTemplate
                                        studentDetails={studentDetails}
                                        classroom={props.classroom || { name: 'غير متوفر', section_number: 'غير متوفر' }}
                                        data={data}
                                        onInputChange={handleInputChange}
                                        onSubjectChange={handleSubjectChange}
                                        onSendReport={handleSendReport}
                                        isSending={isSending}
                                        t={t}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <ToastContainer />
        </AuthenticatedLayout>
    );
}