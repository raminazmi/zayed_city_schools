<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('اسم الطالب');
            $table->foreignId('class_id')->constrained('classes')->onDelete('cascade')->comment('معرف الصف الذي ينتمي إليه الطالب');
            $table->string('parent_whatsapp')->nullable()->comment('رقم الواتساب للولي');
            $table->integer('class_description')->comment('وصف الصف');
            $table->integer('section_number')->comment('رقم الشعبة');
            $table->string('path')->nullable()->comment('المسار الدراسي: عام أو متقدم أو أي شيء آخر');
            $table->string('student_number', 6)->unique()->comment('رقم الطالب (يجب أن يتكون من 6 أرقام)');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
