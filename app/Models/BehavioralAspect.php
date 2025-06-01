<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BehavioralAspect extends Model
{
    protected $fillable = ['behavioral_report_id', 'aspect', 'action', 'mark'];
    protected $table = 'behavioral_aspects';
}
