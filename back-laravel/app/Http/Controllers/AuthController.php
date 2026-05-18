<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Usuario;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'rut'      => 'required|string',
            'password' => 'required|string',
        ]);

        // Limpiar el RUT igual que en FastAPI
        $rut = str_replace('.', '', trim($request->rut));

        $usuario = Usuario::with('rol')->where('rut', $rut)->first();

        if (!$usuario || !Hash::check($request->password, $usuario->password)) {
            return response()->json(['detail' => 'RUT o contraseña incorrectos'], 401);
        }

        if (!$usuario->activo) {
            return response()->json(['detail' => 'Usuario inactivo.'], 403);
        }

        // Usar GETDATE() del servidor para evitar problemas de conversión con ODBC
        DB::table('usuarios')
            ->where('id', $usuario->id)
            ->update(['last_login' => DB::raw('GETDATE()')]);

        $token = JWTAuth::fromUser($usuario);

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'usuario'      => [
                'id'        => $usuario->id,
                'rut'       => $usuario->rut,
                'nombre'    => $usuario->nombre,
                'email'     => $usuario->email,
                'rol'       => $usuario->rol->nombre,
                'rol_nivel' => $usuario->rol->nivel,
                'rol_tipo'  => $usuario->rol->tipo,
                'rol_id'    => $usuario->rol->id,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $usuario = $request->user()->load('rol');

        return response()->json([
            'id'        => $usuario->id,
            'rut'       => $usuario->rut,
            'nombre'    => $usuario->nombre,
            'email'     => $usuario->email,
            'rol'       => $usuario->rol->nombre,
            'rol_nivel' => $usuario->rol->nivel,
            'rol_tipo'  => $usuario->rol->tipo,
        ]);
    }
}
