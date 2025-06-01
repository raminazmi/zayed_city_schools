import React, { useState, useEffect, useRef } from 'react'; // أضفنا useRef
import { Head, usePage } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { useForm } from '@inertiajs/react';
import { translations } from '@translations';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AcademicReportTemplate from './AcademicReportTemplate';
import BehavioralReportTemplate from './BehavioralReportTemplate';
import { FaBook, FaUser } from 'react-icons/fa';

export default function ReportsPage({ auth, classroom }) {
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

    const defaultBehavioralAspects = [
        { action: '', aspect: '', mark: '' },
        { action: '', aspect: '', mark: '' },
        { action: '', aspect: '', mark: '' },
        { action: '', aspect: '', mark: '' },
        { action: '', aspect: '', mark: '' },
        { action: '', aspect: '', mark: '' },
        { action: '', aspect: '', mark: '' },
    ];

    const { data, setData } = useForm({
        student_id: studentId,
        report_type: 'behavioral',
        academic_year: props.initialData?.academic_year || '2024/2025',
        term: props.initialData?.term || 'الفصل الأول',
        week: props.initialData?.week || 'الأسبوع الأول',
        reporting_period: props.initialData?.reporting_period || 'الفترة الأولى',
        subjects: props.initialData?.subjects || subjectsList.map((name) => ({ name, mark: '', notes: '' })),
        behavioralAspects: props.initialData?.behavioralAspects || defaultBehavioralAspects,
        socialWorkerNotes: '',
        socialWorker: '',
        is_draft: false,
    });

    const [reportHtml, setReportHtml] = useState('');
    const [studentDetails, setStudentDetails] = useState(props.student || null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // حالة تحميل جديدة
    const [error, setError] = useState(null);
    const [reportUrl, setReportUrl] = useState('');
    const [showAcademicTemplate, setShowAcademicTemplate] = useState(false);
    const [showBehavioralTemplate, setShowBehavioralTemplate] = useState(false);

    // استخدام AbortController لإلغاء الطلبات
    const abortControllerRef = useRef(null);

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

    // useEffect لجلب المسودة فقط
    useEffect(() => {
        if (!studentId || !studentDetails) return;

        // إلغاء الطلب السابق إن وجد
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const fetchData = async () => {
            setIsLoading(true); // بدء التحميل
            try {
                const response = await axios.get(`/admin/dashboard/reports/draft/${studentId}/${data.report_type}`, {
                    signal: abortControllerRef.current.signal,
                });
                if (response.data.draft) {
                    const draft = response.data.draft;
                    if (data.report_type === 'academic') {
                        const mergedSubjects = subjectsList.map((name) => {
                            const draftSubject = draft.subjects.find((s) => s.name === name) || { name, mark: '', notes: '' };
                            return {
                                name: draftSubject.name,
                                mark: draftSubject.mark || '',
                                notes: draftSubject.notes || ''
                            };
                        });
                        setData({
                            ...data,
                            academic_year: draft.academic_year || '2024/2025',
                            term: draft.term || 'الفصل الأول',
                            reporting_period: draft.reporting_period || 'الفترة الأولى',
                            subjects: mergedSubjects,
                        });
                    } else {
                        const mergedAspects = defaultBehavioralAspects.map((defaultAspect, index) => {
                            const draftAspect = draft.behavioralAspects[index] || {};
                            return {
                                action: draftAspect.action || '',
                                aspect: draftAspect.aspect || '',
                                mark: draftAspect.mark || ''
                            };
                        });
                        setData({
                            ...data,
                            academic_year: draft.academic_year || '2024/2025',
                            term: draft.term || 'الفصل الأول',
                            week: draft.week || 'الأسبوع الأول',
                            behavioralAspects: mergedAspects,
                            socialWorkerNotes: draft.socialWorkerNotes || '',
                            socialWorker: draft.socialWorker || '',
                        });
                    }
                } else {
                    setData({
                        ...data,
                        academic_year: '2024/2025',
                        term: 'الفصل الأول',
                        week: 'الأسبوع الأول',
                        reporting_period: 'الفترة الأولى',
                        subjects: subjectsList.map((name) => ({ name, mark: '', notes: '' })),
                        behavioralAspects: defaultBehavioralAspects,
                        socialWorkerNotes: '',
                        socialWorker: '',
                    });
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log('Request canceled:', error.message);
                } else {
                    console.error('Error fetching draft:', error);
                    setData({
                        ...data,
                        academic_year: '2024/2025',
                        term: 'الفصل الأول',
                        week: 'الأسبوع الأول',
                        reporting_period: 'الفترة الأولى',
                        subjects: subjectsList.map((name) => ({ name, mark: '', notes: '' })),
                        behavioralAspects: defaultBehavioralAspects,
                        socialWorkerNotes: '',
                        socialWorker: '',
                    });
                }
            } finally {
                setIsLoading(false); // إنهاء التحميل
            }
        };

        fetchData();

        // تنظيف عند إلغاء المكون أو تغيير الـ dependency
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [studentId, studentDetails, data.report_type]);

    // useEffect لتوليد المعاينة فقط
    useEffect(() => {
        if (!studentId || !studentDetails) return;

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
    }, [studentId, studentDetails, data.report_type]);

    const fetchStudentDetails = async (id) => {
        try {
            const response = await axios.get(`/admin/dashboard/reports/${id}`);
            setStudentDetails(response.data.student);
            setError(null);
        } catch (error) {
            setStudentDetails(null);
            setError(t['student_not_found'] || 'Student not found');
            toast.error(t['student_not_found'] || 'Student not found', { position: "top-right", autoClose: 3000 });
        }
    };

    const handleSaveDraft = async () => {
        try {
            const payload = {
                ...data,
                is_draft: true,
            };
            await axios.post('/admin/dashboard/reports/save-draft', payload);
            toast.success('تم حفظ المسودة بنجاح');
        } catch (error) {
            toast.error('فشل في حفظ المسودة');
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
                subjects: data.subjects.map(subject => ({
                    ...subject,
                    mark: subject.mark !== null && subject.mark !== undefined ? subject.mark.toString() : ''
                })),
                behavioralAspects: data.behavioralAspects,
                socialWorkerNotes: data.socialWorkerNotes,
                socialWorker: data.socialWorker,
                is_draft: false,
            };

            const response = await axios.post('/admin/dashboard/reports/send-report', payload, {
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
        updatedSubjects[index] = { ...updatedSubjects[index], [field]: field === 'mark' ? value.toString() : value };
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
        { label: t['reports'] || 'Reports', href: '/admin/dashboard/reports' },
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
                                            disabled={isLoading}
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
                                            disabled={isLoading}
                                        >
                                            <FaBook className="ml-2" />
                                            {t['academic'] || 'Academic'}
                                        </button>
                                    </div>
                                </div>
                                {isLoading && (
                                    <div className="flex justify-center items-center">
                                        <div
                                            className={`w-12 h-12 border-4 border-t-4 border-blue-500 rounded-full animate-spin ${isDark ? 'border-gray-300' : 'border-gray-400'
                                                }`}
                                            style={{ borderTopColor: isDark ? '#60a5fa' : '#3b82f6' }}
                                        ></div>
                                    </div>
                                )}
                                {showBehavioralTemplate && data.report_type === 'behavioral' && studentDetails && !isLoading && (
                                    <BehavioralReportTemplate
                                        studentDetails={studentDetails}
                                        classroom={props.classroom || { name: 'غير متوفر', section_number: 'غير متوفر' }}
                                        data={data}
                                        onInputChange={handleInputChange}
                                        onBehavioralChange={handleBehavioralChange}
                                        onSendReport={handleSendReport}
                                        onSaveDraft={handleSaveDraft}
                                        isSending={isSending}
                                        t={t}
                                        reportUrl={reportUrl}
                                    />
                                )}
                                {showAcademicTemplate && data.report_type === 'academic' && studentDetails && !isLoading && (
                                    <AcademicReportTemplate
                                        studentDetails={studentDetails}
                                        classroom={props.classroom || { name: 'غير متوفر', section_number: 'غير متوفر' }}
                                        data={data}
                                        onInputChange={handleInputChange}
                                        onSubjectChange={handleSubjectChange}
                                        onSendReport={handleSendReport}
                                        onSaveDraft={handleSaveDraft}
                                        isSending={isSending}
                                        t={t}
                                        reportUrl={reportUrl}
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