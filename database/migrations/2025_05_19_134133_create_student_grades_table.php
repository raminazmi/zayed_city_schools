<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudentGradesTable extends Migration
{
    public function up()
    {
        Schema::create('student_grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('subject_name');
            $table->integer('mark');
            $table->string('notes');
            $table->date('date_added')->default(now());
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('student_grades');
    }
}
