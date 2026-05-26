<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    public $timestamps = false;

    protected $table = 'reservas';

    protected $fillable = [
        'id_usuario',
        'id_vuelo',
        'asiento',
        'solicitudEspecial',
        'fechaReserva',
        'fechaConfirmacion',
        'fechaCancelacion',
        'estado',
        'created_at',
        'updated_at',
    ];


    public function vuelo()
    {
        return $this->belongsTo(Vuelo::class, 'id_vuelo');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

}
