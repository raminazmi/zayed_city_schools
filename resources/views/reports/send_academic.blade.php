<!DOCTYPE html>
<html dir="rtl" lang="ar">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>التقرير الأكاديمي</title>
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

        .header-label {
            text-align: center;
        }

        .header-logos {
            display: flex;
            align-items: center;
            gap: 18px;
        }

        .header-logos .img1 {
            width: 250px;
            height: 80;
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

        .header-center .academic-year {
            font-size: 15px;
            margin: 6px 0 0 0;
            font-weight: bold;
        }

        .header-center .academic-year-en {
            font-size: 13px;
            margin: 0 0 6px 0;
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

        .subjects-column {
            width: 380px;
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
                التقرير الأكاديمي لنتائج التقويم المستمر للعام الدراسي
            </div>
            <div class="academic-year-en">
                Academic Year <span class="yellow-bg">{{ $academic_year ?? '2024/2025' }}</span> Continuous
                Assessment Report Card
            </div>
        </div>
    </div>
    <table>
        <tr>
            <td>{{ $reporting_period ?? 'الفترة الأولى' }}</td>
            <td class="custom">Reporting Period الفترة الاختبارية</td>
            <td>{{ $term ?? 'الفصل الأول' }}</td>
            <td class="custom">Term الفصل الدراسي</td>
        </tr>
        <tr>
            <td>{{ $student->student_number }}</td>
            <td class="custom">ESIS رقم الطالب</td>
            <td>{{ $student->name }}</td>
            <td class="custom">Student Name اسم الطالب</td>
        </tr>
        <tr>
            <td>{{ $classroom->section_number }}</td>
            <td class="custom">Class الشعبة</td>
            <td>{{ $classroom->name }}</td>
            <td class="custom">Grade الصف</td>
        </tr>
    </table>
    <table>
        <thead>
            <tr>
                <th class="table-header">ملاحظات المعلم<br>Teacher Notes</th>
                <th class="table-header">الدرجة<br>Mark</th>
                <th class="table-header subjects-column">المواد الدراسية<br>Subjects</th>
            </tr>
        </thead>
        <tbody>
            @php
            $subjects_list = [
            'التربية الإسلامية',
            'اللغة العربية',
            'الدراسات الاجتماعية والتربية الأخلاقية',
            'English Language اللغة الإنجليزية',
            'Mathematics الرياضيات',
            'Science العلوم',
            'Physics الفيزياء',
            'Chemistry الكيمياء',
            'Biology الأحياء',
            'Health Science العلوم الصحية',
            'Computing Creative Design and Innovation الحوسبة و التصميم الإبداعي و الابتكار',
            'Physical Education التربية البدنية',
            'Arts الفنون'
            ];
            @endphp

            @if(isset($subjects) && !empty($subjects))
            @foreach($subjects_list as $index => $subject_name)
            <tr>
                <td style="text-align: center;">{{ $subjects[$index]['notes'] ?? '' }}</td>
                <td style="text-align: center;">{{ $subjects[$index]['mark'] ?? 'NA' }}</td>
                <td style="text-align: center;" class="subjects-column">{{ $subject_name }}</td>
            </tr>
            @endforeach
            @else
            @foreach($subjects_list as $index => $subject_name)
            <tr>
                <td><input type="text" name="subjects[{{ $index }}][notes]" style="width: 98%; text-align:center;"
                        value="{{ old('subjects.' . $index . '.notes') }}"></td>
                <td style="display: flex; justify-content: center; align-items: center; gap: 5px;">
                    <input type="number" min="0" max="100" name="subjects[{{ $index }}][mark]"
                        style="width: 70px; text-align:center;" value="{{ old('subjects.' . $index . '.mark') }}">
                    <button type="button" onclick="this.previousElementSibling.value='NA';"
                        style="padding: 2px 8px; font-size: 12px; background: #e0e0e0; border: 1px solid #888; border-radius: 2px;">NA</button>
                </td>
                <td class="subjects-column">{{ $subject_name }}</td>
            </tr>
            @endforeach
            @endif
        </tbody>
    </table>
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