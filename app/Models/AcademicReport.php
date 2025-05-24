<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicReport extends Model
{
    protected $fillable = ['student_id', 'report_type', 'academic_year', 'term', 'reporting_period', 'report_file_url', 'date_sent'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
