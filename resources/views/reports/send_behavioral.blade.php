<!DOCTYPE html>
<html dir="rtl" lang="ar">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>التقرير السلوكي</title>
    <style>
        body {
            font-family: 'Almarai', sans-serif;
            direction: rtl;
            text-align: right;
            background: #ffffff;
            margin: 0;
            padding: 0;
        }

        .dotted-border {
            border: 1.5px dotted #888;
            padding: 8px 0 0 0;
            margin-bottom: 18px;
            border-radius: 4px;
        }

        .header-row {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px;
            padding-bottom: 10px;
            gap: 10px;
        }

        .header-cont {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 18px;
        }

        .header-logos {
            display: flex;
            align-items: center;
            gap: 18px;
        }

        .header-logos .img1 {
            width: 150px;
            height: auto;
            object-fit: contain;
        }

        .header-logos .img2 {
            width: 90px;
            height: 90px;
            object-fit: contain;
        }

        .header-center {
            flex: 1;
            text-align: center;
            margin: 0px 0 20px;
        }

        .header-center h1 {
            font-size: 18px;
            margin: 0 0 2px 0;
            font-weight: bold;
        }

        .header-center p {
            font-size: 13px;
            margin: 0 0 2px 0;
        }

        .header-center .yellow-bg {
            background: #ffff99;
            color: #222;
            font-weight: bold;
            padding: 0 4px;
            border-radius: 2px;
        }

        .header-center .report-title {
            font-size: 15px;
            font-weight: bold;
            margin: 0 0 2px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            direction: rtl;
            text-align: right;
            table-layout: auto;
        }

        th,
        td {
            border: 1px solid #222;
            padding: 7px 5px;
            font-size: 13px;
            text-align: right;
        }

        .table-header {
            background: #0074b8;
            color: #fff;
            font-weight: bold;
            text-align: center;
        }

        .custom {
            background: #0074b8;
            color: #fff;
            font-weight: bold;
            width: 1%;
            white-space: nowrap;
        }

        .signature {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            padding: 0px;
            margin: 0px;
        }

        .signature .principal-ar {
            text-align: right;
        }

        .signature .principal-en {
            text-align: left;
        }

        .signature .principal-name-ar {
            color: #d32f2f;
            font-weight: bold;
        }

        .signature .principal-name-en {
            color: #d32f2f;
            font-weight: bold;
        }

        .end_table {
            border: none;
        }
    </style>
</head>

<body>
    <div class="dotted-border">
        <div class="header-row">
            <table width="100%">
                <tr>
                    <td width="40%" style="text-align: center;">
                        <h4>مدارس مدينة زايد ح2 و3 - ذكور</h4>
                        <p>Zayed City Schools C2&3 - Boys</p>
                    </td>
                    <td width="30%">
                        <img src="{{ public_path('images/mz.png') }}" class="img2" alt="شعار المدرسة">
                    </td>
                    <td width="30%">
                        <img src="{{ public_path('images/uae.png') }}" class="img1" alt="شعار الإمارات">
                    </td>
                </tr>
            </table>
        </div>
        <div class="header-center">
            <div class="report-title">
                <span class="yellow-bg">{{ $academic_year ?? '2024/2025' }}</span>
                التقرير السلوكي الأسبوعي للطالب للعام الدراسي
            </div>
        </div>
    </div>
    <table>
        <tr>
            <td>{{ $week ?? 'الأسبوع الأول' }}</td>
            <td class="custom">Week الأسبوع</td>
            <td>{{ $term ?? 'الفصل الأول' }}</td>
            <td class="custom">Term الفصل الدراسي</td>
        </tr>
        <tr>
            <td>{{ $student->name }}</td>
            <td class="custom">Student Name اسم الطالب</td>
            <td>{{ $student->student_number }}</td>
            <td class="custom">ESIS رقم الطالب</td>
        </tr>
        <tr>
            <td>{{ $classroom->name }}</td>
            <td class="custom">Grade الصف</td>
            <td>{{ $classroom->section_number }}</td>
            <td class="custom">Class الشعبة</td>
        </tr>
    </table>
    <table>
        <thead>
            <tr>
                <th class="table-header">الإجراء المتبع</th>
                <th class="table-header">الجانب السلوكي</th>
            </tr>
        </thead>
        <tbody>
            @foreach($behavioralAspects as $aspect)
            <tr>
                <td>{{ $aspect['action'] ?? '' }}</td>
                <td>{{ $aspect['aspect'] ?? '' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <div>
        @isset($socialWorkerNotes)
        <table>
            <thead>
                <tr>
                    <th class="table-header">ملاحظات الأخصائي الاجتماعي:</th>
                </tr>
            </thead>
            <tr>
                <td>{{ $socialWorkerNotes }}</td>
            </tr>
        </table>
        @endisset
        @isset($socialWorker)
        <p>الأخصائي الاجتماعي: {{ $socialWorker }}</p>
        @endisset
    </div>
    <div class="signature">
        <table width="100%" class="end_table">
            <tr class="end_table">
                <td width="50%" class="end_table">
                    <div class="principal-en" style="text-align: end;">
                        <p>School Principal</p>
                        <p class="principal-name-en">Hanan Al Juneibi</p>
                    </div>
                </td>
                <td width="50%" class="end_table">
                    <div class="principal-ar" style="text-align: start;">
                        <p>مديرة المدرسة</p>
                        <p class="principal-name-ar">حنان الجنيبي</p>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>