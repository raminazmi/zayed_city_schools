<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('section');
            $table->string('class_description')->nullable();
            $table->string('section_number')->nullable();
            $table->string('path')->nullable();
            $table->foreignId('grade_id')->constrained('grades')->onDelete('cascade'); // Required field
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['name', 'section']);
            $table->index('grade_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
