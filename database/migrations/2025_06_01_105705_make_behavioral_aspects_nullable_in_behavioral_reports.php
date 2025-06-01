<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MakeBehavioralAspectsNullableInBehavioralReports extends Migration
{
    public function up()
    {
        Schema::table('behavioral_reports', function (Blueprint $table) {
            $table->json('behavioral_aspects')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('behavioral_reports', function (Blueprint $table) {
            $table->json('behavioral_aspects')->nullable(false)->change();
        });
    }
}
