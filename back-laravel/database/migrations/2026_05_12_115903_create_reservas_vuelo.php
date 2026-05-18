<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('id_usuario')
                  ->constrained('usuarios')
                  ->noActionOnDelete();

            $table->foreignId('id_vuelo')
                  ->constrained('vuelos')
                  ->noActionOnDelete();

            $table->string('asiento', 5);       
            $table->string('solicitudEspecial', 250)->nullable(); 

            $table->date('fechaReserva');
            $table->date('fechaConfirmacion')->nullable();
            $table->date('fechaCancelacion')->nullable();

            $table->string('estado', 20)->default('reservado');
        
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
