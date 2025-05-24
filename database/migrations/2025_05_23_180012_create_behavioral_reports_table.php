<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBehavioralReportsTable extends Migration
{
    public function up()
    {
        Schema::create('behavioral_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('report_type');
            $table->string('academic_year');
            $table->string('term');
            $table->string('week');
            $table->json('behavioral_aspects');
            $table->text('social_worker_notes')->nullable();
            $table->string('social_worker')->nullable();
            $table->string('report_file_url')->nullable();
            $table->timestamp('date_sent')->useCurrent();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('behavioral_reports');
    }
}
