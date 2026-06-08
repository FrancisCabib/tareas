<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('days', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('label');
            $table->string('focus');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('day_id');
            $table->string('name');
            $table->string('benef')->default('');
            $table->string('tipo')->default('');
            $table->string('resp')->default('');
            $table->string('bc')->default('b-info');
            $table->boolean('done')->default(false);
            $table->boolean('buffer')->default(false);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->foreign('day_id')->references('id')->on('days')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('days');
    }
};
