<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    public $timestamps = false;

    protected $table = 'roles';

    protected $fillable = [
        'nombre', 
        'nivel', 
        'tipo'
    ];

    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'rol_id');
    }
}
