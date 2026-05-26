<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Rol;
use App\Models\Usuario;

class UsuarioSeeder extends Seeder{
    public function run(): void
    {
        $rolAdmin     = Rol::where('nombre', 'admin')->first();
        $rolEjecutivo = Rol::where('nombre', 'ejecutivo')->first();

        Usuario::updateOrCreate(
            ['rut' => '11111111-1'],
            [
                'nombre'   => 'Admin DAP',
                'email'    => 'admin@dap.cl',
                'empresa'  => 'DAP',
                'cargo'    => 'Administrador',
                'password' => Hash::make('Admin@2026'),
                'rol_id'   => $rolAdmin->id,
                'activo'   => true,
            ]
        );

        Usuario::updateOrCreate(
            ['rut' => '22222222-2'],
            [
                'nombre'   => 'Ejecutivo',
                'email'    => 'ejecutivo@dap.cl',
                'empresa'  => 'Collahuasi',
                'cargo'    => 'Ejecutivo',
                'password' => Hash::make('Ejecutivo@2026'),
                'rol_id'   => $rolEjecutivo->id,
                'activo'   => true,
            ]
        );

        Usuario::updateOrCreate(
            ['rut' => '15421658-1'],
            [
                'nombre'   => 'Jose Perez',
                'email'    => 'joseperez@test.cl',
                'empresa'  => 'Collahuasi',
                'cargo'    => 'SI Construccion',
                'password' => Hash::make('Ejecutivo@2026'),
                'rol_id'   => $rolEjecutivo->id,
                'activo'   => true,
            ]
        );

        Usuario::updateOrCreate(
            ['rut' => '16422133-1'],
            [
                'nombre'   => 'Rafael Gonzalez',
                'email'    => 'rafael@test.cl',
                'empresa'  => 'Collahuasi',
                'cargo'    => 'Gerente de Proyectos',
                'password' => Hash::make('Ejecutivo@2026'),
                'rol_id'   => $rolEjecutivo->id,
                'activo'   => true,
            ]
        );

        Usuario::updateOrCreate(
            ['rut' => '16333133-1'],
            [
                'nombre'   => 'Jose Ramirez',
                'email'    => 'joseramirez@test.cl',
                'empresa'  => 'Collahuasi',
                'cargo'    => 'Gerente de Proyectos',
                'password' => Hash::make('Ejecutivo@2026'),
                'rol_id'   => $rolEjecutivo->id,
                'activo'   => true,
            ]
        );

        Usuario::updateOrCreate(
            ['rut' => '12345678-1'],
            [
                'nombre'   => 'Rafael Gonzalez',
                'email'    => 'rafaelgonzalez@test.cl',
                'empresa'  => 'Collahuasi',
                'cargo'    => 'Jefe Mantencion',
                'password' => Hash::make('Ejecutivo@2026'),
                'rol_id'   => $rolEjecutivo->id,
                'activo'   => true,
            ]
        );
    }
}
