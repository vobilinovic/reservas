<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Usuario extends Authenticatable implements JWTSubject
{
    protected $table = 'usuarios';

    public $timestamps = false; // La tabla usa created_at (DB default) y no tiene updated_at

    protected $hidden = ['password'];

    protected $fillable = [
        'rut',
        'nombre',
        'email',
        'password',
        'rol_id',
        'activo',
        'prioridad',
    ];

    protected $casts = [
        'activo'     => 'boolean',
        'created_at' => 'datetime',
    ];

    // Relación con Rol
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    // --- Requerido por JWTSubject ---

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'rut'       => $this->rut,
            'rol_nivel' => $this->rol->nivel,
            'rol_tipo'  => $this->rol->tipo,
        ];
    }
}
