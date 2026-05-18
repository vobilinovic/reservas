<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rutas', function (Blueprint $table) {
            $table->id();

            $table->string('ciudad', 100);      
            $table->string('region', 100);
            $table->string('codigo', 20);
            $table->string('descripcion', 200)->nullable();
            $table->boolean('estado')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rutas');
    }
};
?>