<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $table = 'grades';

    protected $fillable = ['name', 'cycle'];

    public function classrooms()
    {
        return $this->hasMany(ClassRoom::class, 'grade_id');
    }
}
