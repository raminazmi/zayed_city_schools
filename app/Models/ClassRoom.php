<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClassRoom extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'classes';
    protected $fillable = [
        'name',
        'section',
        'grade_id',
        'class_description',
        'section_number',
        'path',
    ];

    protected $casts = [
        'grade_id' => 'integer',
    ];

    public function grade()
    {
        return $this->belongsTo(Grade::class, 'grade_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'class_id', 'id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'class_id');
    }

    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'class_teacher_attendance', 'class_id', 'teacher_id')
            ->withTimestamps();
    }
}
