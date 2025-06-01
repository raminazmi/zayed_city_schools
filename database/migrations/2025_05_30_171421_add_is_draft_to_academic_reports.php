<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsDraftToAcademicReports extends Migration
{
    public function up()
    {
        Schema::table('academic_reports', function (Blueprint $table) {
            $table->boolean('is_draft')->default(false);
        });
    }

    public function down()
    {
        Schema::table('academic_reports', function (Blueprint $table) {
            $table->dropColumn('is_draft');
        });
    }
}
