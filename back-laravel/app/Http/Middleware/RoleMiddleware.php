<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, int $minNivel)
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json(['detail' => 'No autenticado'], 401);
        }

        $usuario->loadMissing('rol');

        if ($usuario->rol->nivel < $minNivel) {
            return response()->json(['detail' => 'No tienes permisos para esta acción'], 403);
        }

        return $next($request);
    }
}
