<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aeronaves', function (Blueprint $table) {
            $table->id();
            $table->string('tipo', 10);
            $table->string('matricula', 20)->unique();
            $table->integer('filas');
            $table->integer('columnas');
            $table->string('columnas_config', 20);
            $table->string('pasillo_despues_de', 2);
            $table->string('filas_emergencia', 20)->nullable();
            $table->boolean('estado')->default(true);
            // Sin timestamps
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aeronaves');
    }
};
