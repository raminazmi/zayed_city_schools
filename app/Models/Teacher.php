<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'email', 'role', 'grades'];

    public function classes()
    {
        return $this->belongsToMany(ClassRoom::class, 'class_teacher_attendance', 'teacher_id', 'class_id')
            ->withTimestamps();
    }

    public function user()
    {
        return $this->hasOne(User::class, 'email', 'email');
    }
}
