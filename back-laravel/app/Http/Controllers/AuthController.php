<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
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
                'asiento'   => $usuario->asiento,
                'ubicacion' => $usuario->ubicacion,
                'telefono'  => $usuario->telefono,
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
            'asiento'   => $usuario->asiento,
            'ubicacion' => $usuario->ubicacion,
            'telefono'  => $usuario->telefono,
        ]);
    }

    // POST /api/v1/auth/recuperar
    public function recuperarPassword(Request $request){
        $request->validate([
            'email' => 'required|email|exists:usuarios,email'
        ]);

        $token = Str::random(10);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token'      => Hash::make($token),
                'created_at' => DB::raw('GETDATE()'),
            ]
        );

        return response()->json([
            'token' => $token,
            'mensaje' => 'Código de recuperación enviado'
        ]);
    }

    //POST api/v1/auth/resetear
    public function resetearPassword(Request $request){
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|min:8|confirmed'
        ]);

        $registro = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$registro) {
            return response()->json([
                'mensaje' => 'Código de recuperación inválido'
            ], 400);
        }

        // Verificar token
        if (!Hash::check($request->token, $registro->token)) {
            return response()->json([
                'mensaje' => 'Código de recuperación inválido'
            ], 400);
        }

        // Verificar expiración sin Carbon (evita error ODBC con datetime de SQL Server)
        $expirado = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->whereRaw('DATEDIFF(MINUTE, created_at, GETDATE()) > 10')
            ->exists();

        if ($expirado) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'mensaje' => 'Código de recuperación expirado'
            ], 400);
        }

        Usuario::where('email', $request->email)->update([
            'password' => Hash::make($request->password)
        ]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'mensaje' => 'Contraseña actualizada correctamente'
        ]);
        
    }
}
