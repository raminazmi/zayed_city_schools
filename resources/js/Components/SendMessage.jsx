import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import PrimaryButton from '@/Components/PrimaryButton';
import { translations } from '@translations';
import { useSelector } from 'react-redux';
import { FiSend, FiSearch, FiUsers, FiX } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';

const SendMessage = ({ t, classes }) => {
    const [message, setMessage] = useState('');
    const [selectedClass, setSelectedClass] = useState(classes.length > 0 ? classes[0].id : null);
    const [students, setStudents] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [recipients, setRecipients] = useState('');
    const [messageType, setMessageType] = useState(null);

    const isDark = useSelector((state) => state.theme.darkMode === 'dark');

    useEffect(() => {
        if (selectedClass && !searchQuery && messageType === 'individual') {
            fetchStudents(selectedClass);
            setSearchResults([]);
        }
    }, [selectedClass, searchQuery, messageType]);

    useEffect(() => {
        if (searchQuery.trim()) {
            searchStudents(searchQuery);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const fetchStudents = async (classId) => {
        try {
            const response = await axios.get(`/admin/dashboard/messages/get-students/${classId}`);
            setStudents(response.data);
        } catch (error) {
            toast.error(t['failed_to_load_students']);
        }
    };

    const searchStudents = async (query) => {
        try {
            const response = await axios.get(`/admin/dashboard/messages/search-students`, { params: { query } });
            setSearchResults(response.data);
        } catch (error) {
            toast.error(t['failed_to_search_students']);
        }
    };

    const handleClassSelect = (classId) => {
        setSelectedClass(classId);
        setSearchQuery('');
    };

    const handleStudentSelect = (studentId, classId) => {
        const student = searchQuery ? searchResults.find(s => s.id === studentId) : students.find(s => s.id === studentId);
        if (!student) return;

        const classroom = classes.find(c => c.id === classId);
        const className = classroom
            ? `${classroom.class_description}/${classroom.path}/${classroom.section_number}`
            : 'غير معروف';

        setSelectedStudents(prev => {
            if (prev.find(s => s.studentId === studentId)) {
                return prev.filter(s => s.studentId !== studentId);
            } else {
                return [...prev, { studentId, classId, name: student.name, student_number: student.student_number, className }];
            }
        });
    };

    const handleRemoveStudent = (studentId) => {
        setSelectedStudents(prev => prev.filter(s => s.studentId !== studentId));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error(t['message_required']);
            return;
        }

        let payload;
        if (messageType === 'individual' && selectedStudents.length > 0) {
            payload = { message, recipients: { type: 'students', students: selectedStudents.map(s => s.studentId) } };
        } else if (messageType === 'all') {
            payload = { message, recipients: 'all' };
        } else if (messageType === 'class') {
            payload = { message, recipients };
        } else {
            toast.error(t['invalid_message_type']);
            return;
        }

        setIsSending(true);
        try {
            await axios.post('/admin/dashboard/messages/send', payload);
            toast.success(t['message_sent']);
            setMessage('');
            setSelectedClass(null);
            setSelectedStudents([]);
            setSearchQuery('');
            setSearchResults([]);
            setRecipients('all');
            setMessageType(null);
        } catch (error) {
            toast.error(t['failed_to_send_message']);
        } finally {
            setIsSending(false);
        }
    };

    const groupedSelectedStudents = selectedStudents.reduce((acc, student) => {
        const classId = student.classId;
        if (!acc[classId]) acc[classId] = { className: student.className, students: [] };
        acc[classId].students.push(student);
        return acc;
    }, {});

    const displayStudents = searchQuery && searchResults.length > 0 ? searchResults : students;
    const filteredDisplayStudents = searchQuery && searchResults.length > 0
        ? searchResults
        : students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.student_number.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className={`p-4 sm:p-6 transition-all duration-300 flex flex-col gap-6`}>
            {!messageType ? (
                <div className={`flex flex-col items-center justify-center gap-6 py-8 rounded-xl shadow-lg ${isDark ? 'bg-DarkBG1' : 'bg-LightBG1'}`}>
                    <h2 className={`text-xl sm:text-2xl font-semibold text-center ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>
                        {t['select_message_type']}
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg px-4">
                        <button
                            onClick={() => setMessageType('all')}
                            className={`w-full py-3 px-4 rounded-lg text-sm sm:text-base ${isDark ? 'bg-DarkBG2 hover:bg-DarkBG3 text-TextLight' : 'bg-white hover:bg-gray-100 text-TextDark'} border border-primaryColor transition-all`}
                        >
                            {t['all_school']}
                        </button>
                        <button
                            onClick={() => setMessageType('class')}
                            className={`w-full py-3 px-4 rounded-lg text-sm sm:text-base ${isDark ? 'bg-DarkBG2 hover:bg-DarkBG3 text-TextLight' : 'bg-white hover:bg-gray-100 text-TextDark'} border border-primaryColor transition-all`}
                        >
                            {t['one_class']}
                        </button>
                        <button
                            onClick={() => setMessageType('individual')}
                            className={`w-full py-3 px-4 rounded-lg text-sm sm:text-base ${isDark ? 'bg-DarkBG2 hover:bg-DarkBG3 text-TextLight' : 'bg-white hover:bg-gray-100 text-TextDark'} border border-primaryColor transition-all`}
                        >
                            {t['individual']}
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 w-full">
                    {messageType === 'individual' && (
                        <div className={`w-full lg:w-1/3 xl:w-1/4`}>
                            <div className={`rounded-xl  shadow-lg max-h-80 ${isDark ? 'bg-DarkBG1' : 'bg-LightBG1'}`}>
                                <ul className="space-y-2  max-h-[300px] overflow-y-auto px-2 py-2">
                                    {classes.map((classroom) => (
                                        <li
                                            key={classroom.id}
                                            onClick={() => handleClassSelect(classroom.id)}
                                            className={`p-3 rounded-lg cursor-pointer transition-all ${selectedClass === classroom.id ? (isDark ? 'bg-DarkBG2 text-TextLight' : 'bg-LightBG3 text-TextDark') : (isDark ? 'bg-DarkBG3 hover:bg-DarkBG3 text-TextLight' : 'bg-LightBG2 hover:bg-LightBG3')}`}
                                        >
                                            {`${classroom.class_description}/${classroom.path}/${classroom.section_number}`}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )
                    }

                    <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col gap-6">
                        {(messageType === 'individual' && selectedClass) || searchQuery ? (
                            <div className={`p-4 rounded-xl shadow-lg  ${isDark ? 'bg-DarkBG1' : 'bg-LightBG1'}`}>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                    <h3 className={`text-lg font-semibold ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>
                                        {t['students']}
                                    </h3>
                                    <div className="relative w-full sm:w-64">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearch}
                                            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-primaryColor ${isDark ? 'bg-DarkBG3 border-DarkBorder text-TextLight' : 'bg-white border-LightBorder text-TextDark'}`}
                                            placeholder={t['search_students']}
                                        />
                                        <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                    </div>
                                </div>
                                {searchQuery && (
                                    <p className={`text-sm mb-3 ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>
                                        {t['search_results_count']} ({filteredDisplayStudents.length}) {t['students']}
                                    </p>
                                )}
                                <ul className="space-y-2 max-h-80 overflow-y-auto">
                                    {filteredDisplayStudents.map((student) => {
                                        const classroom = classes.find(c => c.id === student.class_id);
                                        const className = classroom
                                            ? `${classroom.class_description}/${classroom.path}/${classroom.section_number}`
                                            : 'غير معروف';
                                        return (
                                            <li
                                                key={student.id}
                                                className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${selectedStudents.some(s => s.studentId === student.id) ? (isDark ? 'bg-DarkBG2 text-TextLight' : 'bg-LightBG3 text-TextDark') : (isDark ? 'bg-DarkBG3 hover:bg-DarkBG3 text-TextLight' : 'bg-LightBG2 hover:bg-LightBG3')}`}
                                                onClick={() => handleStudentSelect(student.id, student.class_id || selectedClass)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.some(s => s.studentId === student.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleStudentSelect(student.id, student.class_id || selectedClass);
                                                    }}
                                                    className="form-checkbox h-5 w-5 text-primaryColor"
                                                />
                                                <span className="truncate">
                                                    {student.student_number} - {student.name} {searchQuery && <span className="text-xs"> - {className}</span>}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ) : null}

                        <div className={`p-4 rounded-xl ${isDark ? 'bg-DarkBG1' : 'bg-LightBG1'} shadow-lg`}>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="message" className={`block mb-2 text-sm font-medium ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>
                                        {t['your_message']}
                                    </label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-primaryColor min-h-[150px] ${isDark ? 'bg-DarkBG3 border-DarkBorder text-TextLight' : 'border-LightBorder text-TextDark'}`}
                                        placeholder={t['write_message']}
                                        disabled={isSending}
                                    />
                                </div>

                                {(messageType === 'all' || messageType === 'class') && (
                                    <div>
                                        <label htmlFor="recipients" className={`block mb-2 text-sm font-medium ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>
                                            <FiUsers className="inline ml-2 -mt-1" />
                                            {t['select_recipients']}
                                        </label>
                                        <select
                                            id="recipients"
                                            value={recipients}
                                            onChange={(e) => setRecipients(e.target.value)}
                                            className={`w-full p-2.5 ps-8 rounded-lg border focus:ring-2 focus:ring-primaryColor ${isDark ? 'bg-DarkBG3 border-DarkBorder text-TextLight' : 'border-LightBorder text-TextDark'} ${messageType === 'all' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={isSending || messageType === 'all'}
                                        >
                                            {messageType === 'all' ? <option value="all">{t['all_parents']}</option>
                                                : classes.map((classroom) => (
                                                    <option key={classroom.id} value={classroom.section}>
                                                        {`${classroom.section_number}/${classroom.path}/${classroom.class_description}`}
                                                    </option>
                                                ))}
                                        </select>
                                        <button
                                            onClick={() => setMessageType('individual')}
                                            className={`mt-2 text-sm ${isDark ? 'text-primaryColor hover:underline' : 'text-blue-500 hover:underline'}`}
                                        >
                                            {t['switch_to_individual']}
                                        </button>
                                    </div>
                                )}

                                {messageType === 'individual' && Object.keys(groupedSelectedStudents).length > 0 && (
                                    <div className="mt-4">
                                        <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>
                                            {t['selected_students']}
                                        </h4>
                                        <div className="space-y-3">
                                            {Object.entries(groupedSelectedStudents).map(([classId, { className, students }]) => (
                                                <div key={classId} className={`p-3 rounded-lg border ${isDark ? 'border-DarkBorder' : 'border-LightBorder'}`}>
                                                    <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-primaryColor' : 'text-primaryColor'}`}>
                                                        {className} ({students.length})
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {students.map((student) => (
                                                            <li key={student.studentId} className="flex items-center justify-between">
                                                                <span className={`truncate text-sm ${isDark ? 'text-TextLight' : 'text-TextDark'}`}>
                                                                    {student.student_number} - {student.name}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleRemoveStudent(student.studentId)}
                                                                    className={`p-1 ${isDark ? 'text-red-400 hover:text-red-500' : 'text-red-500 hover:text-red-600'}`}
                                                                >
                                                                    <FiX className="w-4 h-4" />
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <PrimaryButton
                                        type="submit"
                                        disabled={isSending}
                                        className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg transition-all ${isSending ? '!bg-green-600 cursor-not-allowed' : '!bg-green-500 hover:!bg-green-600 transform hover:scale-[1.02]'} ${isDark ? 'text-TextLight' : 'text-white'}`}
                                    >
                                        <FiSend className="w-5 h-5" />
                                        {isSending ? <span className="animate-pulse">{t['sending']}</span> : t['send']}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </form >
            )}

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
                theme={isDark ? 'dark' : 'light'}
                toastClassName={`${isDark ? 'bg-DarkBG2 text-TextLight' : 'bg-white text-TextDark'} shadow-xl rounded-lg`}
                progressClassName={isDark ? 'bg-primaryColor' : 'bg-green-500'}
            />
        </div >
    );
};

export default SendMessage;