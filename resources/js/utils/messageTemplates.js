export const getStatusMessage = (status, studentName, date, time) => {
    const statusMessages = {
        "حاضر": `عزيزي ولي الأمر، نود إعلامكم بأن ${studentName} حضر إلى المدرسة اليوم ${date}.`,
        "غائب": `عزيزي ولي الأمر، ${studentName} كان غائباً عن المدرسة يوم ${date}.`,
        "متأخر": `عزيزي ولي الأمر، نود إعلامكم بأن ${studentName} وصل متأخراً إلى المدرسة يوم ${date} الساعة ${time}.`,
        "present": `Dear parent, we would like to inform you that ${studentName} was present at school today, ${date}.`,
        "absent": `Dear parent, ${studentName} was absent from school on ${date}.`,
        "late": `Dear parent, ${studentName} arrived late to school on ${date} at ${time}.`,
    };
    return statusMessages[status];
};
