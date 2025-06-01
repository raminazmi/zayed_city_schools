<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAcademicReportIdToStudentGrades extends Migration
{
    public function up()
    {
        Schema::table('student_grades', function (Blueprint $table) {
            $table->foreignId('academic_report_id')
                ->nullable()
                ->constrained('academic_reports')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('student_grades', function (Blueprint $table) {
            $table->dropForeign(['academic_report_id']);
            $table->dropColumn('academic_report_id');
        });
    }
}
