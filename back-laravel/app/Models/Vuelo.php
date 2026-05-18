<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vuelo extends Model
{
    public $timestamps = false;

    protected $table = 'vuelos';

    protected $fillable = [
        'num_vuelo',
        'id_aeronave',
        'id_origen',
        'id_destino',
        'fecha_vuelo',
        'hora_salida',
        'hora_llegada',
        'estado',
    ];

    protected $casts = [
        'fecha_vuelo' => 'date:Y-m-d',
    ];

    public function aeronave()
    {
        return $this->belongsTo(Aeronave::class, 'id_aeronave');
    }

    public function rutaOrigen()
    {
        return $this->belongsTo(Ruta::class, 'id_origen');
    }

    public function rutaDestino()
    {
        return $this->belongsTo(Ruta::class, 'id_destino');
    }
}
