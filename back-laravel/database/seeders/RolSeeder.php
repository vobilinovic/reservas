<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rol;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['nombre' => 'ejecutivo', 'nivel' => 1, 'tipo' => 'ejecutivo'],
            ['nombre' => 'pasajero',  'nivel' => 1, 'tipo' => 'no_ejecutivo'],
            ['nombre' => 'guardia',   'nivel' => 2, 'tipo' => 'guardia'],
            ['nombre' => 'operador',  'nivel' => 3, 'tipo' => 'dap'],
            ['nombre' => 'admin',     'nivel' => 4, 'tipo' => 'dap'],
        ];

        foreach ($roles as $r) {
            Rol::firstOrCreate(['nombre' => $r['nombre']], $r);
        }
    }
}
