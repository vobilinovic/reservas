<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vuelos', function (Blueprint $table) {
            $table->id();

            $table->string('num_vuelo', 20);     
            $table->foreignId('id_aeronave')
                  ->constrained('aeronaves')
                  ->noActionOnDelete();

            $table->foreignId('id_origen')
                  ->constrained('rutas')
                  ->noActionOnDelete();
            $table->foreignId('id_destino')
                  ->constrained('rutas')
                  ->noActionOnDelete();

            $table->date('fecha_vuelo');
            $table->string('hora_salida', 5);           // HH:MM
            $table->string('hora_llegada', 5)->nullable(); // HH:MM

            $table->string('estado', 20)->default('programado');
        
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vuelos');
    }
};
