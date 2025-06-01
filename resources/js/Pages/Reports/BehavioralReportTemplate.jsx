import React from 'react';
import { useSelector } from 'react-redux';
import PrimaryButton from '@/Components/PrimaryButton';
import { MessageCircleReply } from 'lucide-react';

const BehavioralReportTemplate = ({ studentDetails, classroom, data, onInputChange, onBehavioralChange, onSendReport, onSaveDraft, isSending, t, reportUrl }) => {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const behavioralAspects = Array.isArray(data.behavioralAspects) ? data.behavioralAspects : [
        { action: '', aspect: '', mark: '' },
        { action: '', aspect: '', mark: '' },
        { action: '', aspect: '', mark: '' },
        { action: '', aspect: '', mark: '' },
        { action: '', aspect: '', mark: '' },
        { action: '', aspect: '', mark: '' },
        { action: '', aspect: '', mark: '' },
    ];

    if (!studentDetails || !classroom) {
        return <p className="text-red-600">{t['loading_student_or_classroom'] || 'Loading student or classroom data...'}</p>;
    }

    const handleSetNA = (index) => {
        onBehavioralChange(index, 'mark', 'NA');
    };

    return (
        <div className={`p-4 border border-dotted ${isDark ? 'border-DarkBG2 bg-DarkBG1 text-TextLight' : 'border-LightBG2 bg-LightBG1 text-TextDark'} rounded-lg mb-6`}>
            <div className="flex items-center justify-center border border-black gap-4">
                <div className="flex items-center gap-4">
                    <img src="/images/uae.png" alt="Logo1" className="w-56 h-auto object-contain" />
                </div>
                <div className="flex items-center justify-between p-4 gap-2">
                    <div className="flex items-center gap-4">
                        <img src="/images/mz.png" alt="Logo2" className="w-16 h-auto object-contain" />
                    </div>
                    <div className="flex-1 text-center">
                        <h1 className="text-md font-bold mb-1">{t['MZ']}</h1>
                        <p className="text-sm mb-1">{t['MZ']}</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 text-center my-8">
                <div className="text-base font-bold mb-2">
                    {' '}{t['weekly_behavioral_report']}{' '}
                    <span className="bg-yellow-200 text-TextDark font-bold px-2 rounded">
                        <input
                            type="text"
                            value={data.academic_year || ''}
                            onChange={(e) => onInputChange('academic_year', e.target.value)}
                            className={`w-24 text-right py-0.5 px-1 rounded-[3px] ${isDark ? 'bg-DarkBG3 text-TextLight border-DarkBG2' : 'bg-LightBG1 text-TextDark border-DarkBG1'}`}
                        />
                    </span>
                </div>
            </div>
            <table className="w-full border-collapse mb-4">
                <tbody>
                    <tr>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm`}>{t['term_label']}</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>
                            <input
                                type="text"
                                value={data.term || ''}
                                onChange={(e) => onInputChange('term', e.target.value)}
                                className={`w-full text-right py-0.5 px-1 rounded-[3px] ${isDark ? 'bg-DarkBG3 text-TextLight border-DarkBG2' : 'bg-LightBG1 text-TextDark border-DarkBG1'}`}
                            />
                        </td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm`}>{t['week_label']}</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>
                            <input
                                type="text"
                                value={data.week || ''}
                                onChange={(e) => onInputChange('week', e.target.value)}
                                className={`w-full text-right py-0.5 px-1 rounded-[3px] ${isDark ? 'bg-DarkBG3 text-TextLight border-DarkBG2' : 'bg-LightBG1 text-TextDark border-DarkBG1'}`}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm`}>{t['student_name_label']}</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>{studentDetails.name || ''}</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm`}>{t['student_esis_number']}</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>{studentDetails.student_number || ''}</td>
                    </tr>
                    <tr>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm`}>{t['grade_label']}</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>{classroom.name || ''}</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm`}>{t['class_section_label']}</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>{classroom.section_number || ''}</td>
                    </tr>
                </tbody>
            </table>
            <table className="w-full border-collapse mb-4">
                <thead>
                    <tr>
                        <th className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm font-bold`}>{t['behavioral_aspect']}</th>
                        <th className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm font-bold`}>{t['action_taken']}</th>
                    </tr>
                </thead>
                <tbody>
                    {behavioralAspects.map((aspect, index) => (
                        <tr key={index}>
                            <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>
                                <input
                                    type="text"
                                    value={aspect.aspect || ''}
                                    onChange={(e) => onBehavioralChange(index, 'aspect', e.target.value)}
                                    className={`w-full text-right py-0.5 px-1 rounded-[3px] ${isDark ? 'bg-DarkBG3 text-TextLight border-DarkBG2' : 'bg-LightBG1 text-TextDark border-DarkBG1'} rounded-md`}
                                />
                            </td>
                            <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>
                                <input
                                    type="text"
                                    value={aspect.action || ''}
                                    onChange={(e) => onBehavioralChange(index, 'action', e.target.value)}
                                    className={`w-full text-right py-0.5 px-1 rounded-[3px] ${isDark ? 'bg-DarkBG3 text-TextLight border-DarkBG2' : 'bg-LightBG1 text-TextDark border-DarkBG1'} rounded-md`}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mb-4">
                <label className={`block text-sm font-medium ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>{t['social_worker_notes']}</label>
                <textarea
                    value={data.socialWorkerNotes || ''}
                    onChange={(e) => onInputChange('socialWorkerNotes', e.target.value)}
                    className={`mt-1 block w-full p-2 border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight focus:ring-blue-500 focus:border-blue-500' : 'border-DarkBG1 bg-LightBG2 text-TextDark focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm`}
                    rows="4"
                />
            </div>
            <div className="mb-4">
                <label className={`block text-sm font-medium ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>{t['social_worker']}</label>
                <input
                    type="text"
                    value={data.socialWorker || ''}
                    onChange={(e) => onInputChange('socialWorker', e.target.value)}
                    className={`mt-1 block w-full p-2 border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight focus:ring-blue-500 focus:border-blue-500' : 'border-DarkBG1 bg-LightBG2 text-TextDark focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm`}
                />
            </div>
            <div className="flex justify-between mt-10 text-sm">
                <div className="text-right">
                    <p>{t['school_principal']}</p>
                    <p className={`${isDark ? 'text-blue-600' : 'text-red-600'} font-bold`}>Hanan Al Juneibi</p>
                </div>
                <div className="text-left">
                    <p>{t['school_principal']}</p>
                    <p className={`${isDark ? 'text-blue-600' : 'text-red-600'} font-bold`}>Hanan Al Juneibi</p>
                </div>
            </div>
            <div className="mt-6 text-center flex justify-center items-center gap-2">
                <PrimaryButton
                    onClick={onSaveDraft}
                    className="mb-4 text-white px-4 py-2 rounded !bg-blue-500 !ring-blue-500 hover:!bg-blue-600 mr-2"
                >
                    {t['save_draft']}
                </PrimaryButton>
                <PrimaryButton
                    className="mb-4 text-white px-4 py-2 rounded !bg-green-500 !ring-green-500 hover:bg-green-600 ring-green-500"
                    onClick={onSendReport}
                    disabled={isSending}
                >
                    <MessageCircleReply className="w-4 h-4 mx-1" />
                    {isSending ? t['sending'] : t['send_whatsapp']}
                </PrimaryButton>
            </div>
            {reportUrl && (
                <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="text-green-500 font-medium">{t['report_sent_success']}</span>
                    <a
                        href={reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1"
                    >
                        <i className="fas fa-file-pdf"></i> {t['view_sent_report']}
                    </a>
                </div>
            )}
        </div>
    );
};

export default BehavioralReportTemplate;