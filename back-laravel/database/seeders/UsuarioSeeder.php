<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Rol;
use App\Models\Usuario;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $rolAdmin     = Rol::where('nombre', 'admin')->first();
        $rolEjecutivo = Rol::where('nombre', 'ejecutivo')->first();

        Usuario::firstOrCreate(
            ['rut' => '11111111-1'],
            [
                'nombre'   => 'Admin DAP',
                'email'    => 'admin@dap.cl',
                'password' => Hash::make('Admin@2026'),
                'rol_id'   => $rolAdmin->id,
                'activo'   => true,
            ]
        );

        Usuario::firstOrCreate(
            ['rut' => '22222222-2'],
            [
                'nombre'   => 'Ejecutivo DAP',
                'email'    => 'ejecutivo@dap.cl',
                'password' => Hash::make('Ejecutivo@2026'),
                'rol_id'   => $rolEjecutivo->id,
                'activo'   => true,
            ]
        );
    }
}
