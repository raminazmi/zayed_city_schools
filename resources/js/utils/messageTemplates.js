export const getStatusMessage = (status, studentName, date, time) => {
    const statusMessages = {
        "حاضر": `عزيزي ولي الأمر، نود إعلامكم بأن ${studentName} حضر إلى المدرسة اليوم ${date}.`,
        "غائب": `السيد ولي أمر الطالب ${studentName}، نحيطكم علماً بتغيب ابنكم عن المدرسة اليوم ${date}. نرجو منكم التواصل فوراً مع المدرسة لتوضيح سبب الغياب.\n\nمدارس مدينة زايد ذكور`,
        "متأخر": `السيد ولي أمر الطالب ${studentName}، نحيطكم علماً بتأخر ابنكم في الحضور اليوم ${date} للمدرسة حيث تم تسجيل حضوره في الساعة ${time}. نرجو منكم التواصل فوراً مع المدرسة لتوضيح سبب التأخير.\n\nمدارس مدينة زايد ذكور`,
        "present": `Dear parent, we would like to inform you that ${studentName} was present at school today, ${date}.`,
        "absent": `Dear parent of ${studentName}, we would like to inform you about your child's absence from school on ${date}. Please contact the school immediately to clarify the reason for absence.\n\nZayed City Boys School`,
        "late": `Dear parent of ${studentName}, we inform you that your child arrived late to school on ${date} at ${time}. Please contact the school immediately to clarify the reason for the delay.\n\nZayed City Boys School`
    };
    return statusMessages[status] || "حالة الحضور غير معروفة";
};