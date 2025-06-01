<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentGrade extends Model
{
    use HasFactory;

    protected $table = 'student_grades';

    protected $fillable = [
        'student_id',
        'academic_report_id',
        'subject_name',
        'mark',
        'notes',
        'date_added',
    ];

    protected $casts = [
        'mark' => 'string',
        'date_added' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function academicReport()
    {
        return $this->belongsTo(AcademicReport::class, 'academic_report_id');
    }
}
