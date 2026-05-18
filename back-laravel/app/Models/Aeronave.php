<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aeronave extends Model
{
    public $timestamps = false;

    protected $table = 'aeronaves';

    protected $fillable = [
        'tipo',
        'matricula',
        'filas',
        'columnas',
        'columnas_config',
        'pasillo_despues_de',
        'filas_emergencia',
        'estado',
    ];

    protected $casts = [
        'filas'    => 'integer',
        'columnas' => 'integer',
        'estado'   => 'boolean',
    ];
}
