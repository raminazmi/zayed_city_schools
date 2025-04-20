<!DOCTYPE html>
<html lang="ar">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير سلوكي للطالب</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            direction: rtl;
        }

        .header {
            text-align: center;
        }

        .student-info {
            margin-bottom: 20px;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
        }

        .table th,
        .table td {
            border: 1px solid #ddd;
            padding: 8px;
        }

        .table th {
            background-color: #f2f2f2;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>تقرير سلوكي للطالب</h1>
        <p>السنة الدراسية: {{ $academicYear }}</p>
        <p>التاريخ: {{ $date }}</p>
    </div>
    <div class="student-info">
        <p><strong>اسم الطالب:</strong> {{ $student->student_name }}</p>
        <p><strong>الصف:</strong> {{ $classroom->name }}</p>
    </div>
    <table class="table">
        <thead>
            <tr>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>ملاحظات</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($attendanceRecords as $record)
            <tr>
                <td>{{ $record->date }}</td>
                <td>{{ $record->status }}</td>
                <td>{{ $record->notes ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>