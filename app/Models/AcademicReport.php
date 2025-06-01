<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicReport extends Model
{
    protected $fillable = [
        'student_id',
        'report_type',
        'academic_year',
        'term',
        'reporting_period',
        'report_file_url',
        'date_sent',
        'is_draft'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function grades()
    {
        return $this->hasMany(StudentGrade::class, 'academic_report_id');
    }
}
