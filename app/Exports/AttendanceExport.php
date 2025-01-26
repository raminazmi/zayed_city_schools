<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Support\Collection;

class AttendanceExport implements FromCollection, WithHeadings, WithMapping
{
    protected $attendances;

    public function __construct(Collection $attendances)
    {
        $this->attendances = $attendances;
    }

    public function headings(): array
    {
        return [
            'Student',
            'Class',
            'Date',
            'Status',
            'Notes'
        ];
    }

    public function map($attendance): array
    {
        return [
            $attendance->Student,
            $attendance->Class,
            $attendance->Date,
            $attendance->Status,
            $attendance->Notes
        ];
    }

    public function collection()
    {
        return $this->attendances;
    }
}
