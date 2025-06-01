<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsDraftToBehavioralReports extends Migration
{
    public function up()
    {
        Schema::table('behavioral_reports', function (Blueprint $table) {
            $table->boolean('is_draft')->default(false);
        });
    }

    public function down()
    {
        Schema::table('behavioral_reports', function (Blueprint $table) {
            $table->dropColumn('is_draft');
        });
    }
}
