<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBehavioralAspectsTable extends Migration
{
    public function up()
    {
        Schema::create('behavioral_aspects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('behavioral_report_id')->constrained('behavioral_reports')->onDelete('cascade');
            $table->string('aspect')->nullable();
            $table->string('action')->nullable();
            $table->string('mark')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('behavioral_aspects');
    }
}
