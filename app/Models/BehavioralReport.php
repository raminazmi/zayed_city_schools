<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BehavioralReport extends Model
{
    protected $fillable = [
        'student_id',
        'report_type',
        'academic_year',
        'term',
        'week',
        'behavioral_aspects',
        'social_worker_notes',
        'social_worker',
        'report_file_url',
        'date_sent',
        'is_draft'
    ];

    protected $casts = [
        'behavioral_aspects' => 'array',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
