<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AeronaveController;
use App\Http\Controllers\VueloController;
use App\Http\Controllers\RutaController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\RolController;

Route::prefix('v1')->group(function () {
    // ── Auth ─────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('login',       [AuthController::class, 'login']);
        Route::get('infoUsuario',  [AuthController::class, 'me'])->middleware('auth:api');
        Route::post('recuperar', [AuthController::class, 'recuperarPassword']);
        Route::post('resetear',  [AuthController::class, 'resetearPassword']);
    });

    // ── Aeronaves ─────────────────────────────────────────
    Route::prefix('aeronaves')->middleware('auth:api')->group(function () {
        Route::get('',   [AeronaveController::class, 'index'])->middleware('role:1');
        Route::post('',  [AeronaveController::class, 'store'])->middleware('role:3');
        Route::get('select',  [AeronaveController::class, 'selectList'])->middleware('auth:api');
        Route::get('{id}',    [AeronaveController::class, 'show'])->middleware('role:1');
        Route::put('{id}',    [AeronaveController::class, 'update'])->middleware('role:3');
        Route::delete('{id}', [AeronaveController::class, 'destroy'])->middleware('role:3');
    });

    // ── Vuelos ─────────────────────────────────────────
    Route::prefix('vuelos')->middleware('auth:api')->group(function () {
        Route::get('',        [VueloController::class, 'index'])->middleware('role:1');
        Route::post('',       [VueloController::class, 'store'])->middleware('role:3');
        Route::get('fechas-disponibles',[VueloController::class, 'fechasDisponibles'])->middleware('role:1');
        Route::get('{id}',    [VueloController::class, 'show'])->middleware('role:1');
        Route::put('{id}',    [VueloController::class, 'update'])->middleware('role:3');
        Route::delete('{id}', [VueloController::class, 'destroy'])->middleware('role:3');
        //asientos disponibles
        //Route::get('{id}/asientos', [VueloController::class, 'asientosDisponibles'])->middleware('auth:api');
    });

    // ── Rutas ─────────────────────────────────────────
    Route::prefix('rutas')->middleware('auth:api')->group(function () {
        Route::get('',        [RutaController::class, 'index'])->middleware('role:1');
        Route::post('',       [RutaController::class, 'store'])->middleware('role:3');
        Route::get('{id}',    [RutaController::class, 'show'])->middleware('role:1');
        Route::put('{id}',    [RutaController::class, 'update'])->middleware('role:3');
        Route::delete('{id}', [RutaController::class, 'destroy'])->middleware('role:3');
    });

    // ── Reservas ─────────────────────────────────────────
    Route::prefix('reservas')->middleware('auth:api')->group(function () {
        Route::get('',        [ReservaController::class, 'index'])->middleware('auth:api');
        Route::post('',       [ReservaController::class, 'store'])->middleware('auth:api');
        Route::get('{id}',    [ReservaController::class, 'show'])->middleware('auth:api');
        Route::put('{id}',    [ReservaController::class, 'update'])->middleware('auth:api');
        Route::delete('{id}', [ReservaController::class, 'destroy'])->middleware('auth:api');
        //reservas por usuario
        Route::get('{id}/usuario', [ReservaController::class, 'reservasUsuario'])->middleware('auth:api');
        //anular reserva
        Route::put('{id}/cancelar', [ReservaController::class, 'anularReserva'])->middleware('auth:api');
    });

    // ── Usuarios ─────────────────────────────────────────
    Route::prefix('usuarios')->middleware('auth:api')->group(function () {
        Route::get('',        [UsuarioController::class, 'index'])->middleware('role:1');
        Route::post('',       [UsuarioController::class, 'store'])->middleware('role:3');
        Route::get('{id}',    [UsuarioController::class, 'show'])->middleware('role:1');
        Route::put('{id}',    [UsuarioController::class, 'update'])->middleware('auth:api');
        Route::delete('{id}', [UsuarioController::class, 'destroy'])->middleware('role:3');
    });

    // ── Roles ─────────────────────────────────────────
    Route::prefix('roles')->middleware('auth:api')->group(function () {
        Route::get('',        [RolController::class, 'index'])->middleware('role:1');
        Route::post('',       [RolController::class, 'store'])->middleware('role:3');
        Route::get('{id}',    [RolController::class, 'show'])->middleware('role:1');
        Route::put('{id}',    [RolController::class, 'update'])->middleware('role:3');
        Route::delete('{id}', [RolController::class, 'destroy'])->middleware('role:3');
    });
});
