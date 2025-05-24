import React from 'react';
import { useSelector } from 'react-redux';
import PrimaryButton from '@/Components/PrimaryButton';
import { MessageCircleReply } from 'lucide-react';

const TeacherBehavioralReportTemplate = ({ studentDetails, classroom, data, onInputChange, onBehavioralChange, onSendReport, isSending, t }) => {
    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const behavioralAspects = Array.isArray(data.behavioralAspects) ? data.behavioralAspects : [
        { action: '', aspect: '' },
        { action: '', aspect: '' },
        { action: '', aspect: '' },
        { action: '', aspect: '' },
        { action: '', aspect: '' },
        { action: '', aspect: '' },
        { action: '', aspect: '' },
    ];

    if (!studentDetails || !classroom) {
        return <p className="text-red-600">Loading student or classroom data...</p>;
    }

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
                        <h1 className="text-md font-bold mb-1">مدارس مدينة زايد ح2 و 3 – ذكور</h1>
                        <p className="text-sm mb-1">Zayed City Schools C2&3 - Boys</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 text-center my-8">
                <div className="text-base font-bold mb-2">
                    {' '}التقرير السلوكي الأسبوعي للطالب للعام الدراسي{' '}
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
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm`}>الفصل الدراسي Term</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>
                            <input
                                type="text"
                                value={data.term || ''}
                                onChange={(e) => onInputChange('term', e.target.value)}
                                className={`w-full text-right py-0.5 px-1 rounded-[3px] ${isDark ? 'bg-DarkBG3 text-TextLight border-DarkBG2' : 'bg-LightBG1 text-TextDark border-DarkBG1'}`}
                            />
                        </td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm`}>الأسبوع Week</td>
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
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm`}>اسم الطالب Student Name</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>{studentDetails.name || ''}</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm`}>رقم الطالب ESIS</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>{studentDetails.student_number || ''}</td>
                    </tr>
                    <tr>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm`}>الصف Grade</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>{classroom.name || ''}</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm`}>الشعبة Class</td>
                        <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>{classroom.section_number || ''}</td>
                    </tr>
                </tbody>
            </table>
            <h3 className="text-lg font-semibold mb-2">السلوكيات</h3>
            <table className="w-full border-collapse mb-4">
                <thead>
                    <tr>
                        <th className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm font-bold`}>الجانب السلوكي</th>
                        <th className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight' : 'border-DarkBG1 bg-blue-500 text-white'} p-2 text-sm font-bold`}>الإجراء المتبع</th>
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
                                    className={`w-full text-right py-0.5 px-1 rounded-[3px] ${isDark ? 'bg-DarkBG3 text-TextLight border-DarkBG2' : 'bg-LightBG1 text-TextDark border-DarkBG1'}`}
                                />
                            </td>
                            <td className={`border ${isDark ? 'border-DarkBG2 bg-DarkBG1' : 'border-DarkBG1 bg-LightBG2'} p-2 text-sm`}>
                                <input
                                    type="text"
                                    value={aspect.action || ''}
                                    onChange={(e) => onBehavioralChange(index, 'action', e.target.value)}
                                    className={`w-full text-right py-0.5 px-1 rounded-[3px] ${isDark ? 'bg-DarkBG3 text-TextLight border-DarkBG2' : 'bg-LightBG1 text-TextDark border-DarkBG1'}`}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mb-4">
                <label className={`block text-sm font-medium ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>ملاحظات الأخصائي الاجتماعي</label>
                <textarea
                    value={data.socialWorkerNotes || ''}
                    onChange={(e) => onInputChange('socialWorkerNotes', e.target.value)}
                    className={`mt-1 block w-full p-2 border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight focus:ring-blue-500 focus:border-blue-500' : 'border-DarkBG1 bg-LightBG2 text-TextDark focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm`}
                    rows="4"
                />
            </div>
            <div className="mb-4">
                <label className={`block text-sm font-medium ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>الأخصائي الاجتماعي</label>
                <input
                    type="text"
                    value={data.socialWorker || ''}
                    onChange={(e) => onInputChange('socialWorker', e.target.value)}
                    className={`mt-1 block w-full p-2 border ${isDark ? 'border-DarkBG2 bg-DarkBG3 text-TextLight focus:ring-blue-500 focus:border-blue-500' : 'border-DarkBG1 bg-LightBG2 text-TextDark focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm`}
                />
            </div>
            <div className="flex justify-between mt-10 text-sm">
                <div className="text-right">
                    <p>مديرة المدرسة</p>
                    <p className={`${isDark ? 'text-blue-600' : 'text-red-600'}  font-bold`}>حنان الجنيبي</p>
                </div>
                <div className="text-left">
                    <p>School Principal</p>
                    <p className={`${isDark ? 'text-blue-600' : 'text-red-600'}  font-bold`}>Hanan Al Juneibi</p>
                </div>
            </div>
            <div className="mt-6 text-center">
                <PrimaryButton
                    className="mb-4 text-white px-4 py-2 rounded !bg-green-500 hover:bg-green-600 ring-green-500"
                    onClick={onSendReport}
                    disabled={isSending}
                >
                    <MessageCircleReply className="w-4 h-4 mx-1" />
                    {isSending ? t['sending'] : t['send_whatsapp']}
                </PrimaryButton>
            </div>
        </div>
    );
};

export default TeacherBehavioralReportTemplate;