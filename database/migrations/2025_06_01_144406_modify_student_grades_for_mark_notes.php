<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyStudentGradesForMarkNotes extends Migration
{
    public function up()
    {
        Schema::table('student_grades', function (Blueprint $table) {
            // تحويل mark إلى string وجعله nullable
            $table->string('mark')->nullable()->change();
            // جعل notes nullable
            $table->string('notes')->nullable()->change();
            // إضافة academic_report_id إذا لم يكن موجودًا
            if (!Schema::hasColumn('student_grades', 'academic_report_id')) {
                $table->foreignId('academic_report_id')
                    ->nullable()
                    ->constrained('academic_reports')
                    ->onDelete('cascade')
                    ->after('student_id');
            }
        });
    }

    public function down()
    {
        Schema::table('student_grades', function (Blueprint $table) {
            // إعادة mark إلى integer وغير nullable
            $table->integer('mark')->nullable(false)->change();
            // إعادة notes إلى غير nullable
            $table->string('notes')->nullable(false)->change();
            // إزالة academic_report_id
            if (Schema::hasColumn('student_grades', 'academic_report_id')) {
                $table->dropForeign(['academic_report_id']);
                $table->dropColumn('academic_report_id');
            }
        });
    }
}
