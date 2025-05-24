<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAcademicReportsTable extends Migration
{
    public function up()
    {
        Schema::create('academic_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('report_type');
            $table->string('academic_year');
            $table->string('term');
            $table->string('reporting_period');
            $table->string('report_file_url')->nullable();
            $table->timestamp('date_sent')->useCurrent();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('academic_reports');
    }
}
