<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ruta extends Model
{
    public $timestamps = false;

    protected $table = 'rutas';

    protected $fillable = [
        'ciudad',
        'region',
        'codigo',
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];
}
