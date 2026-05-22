<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Vuelo;
use App\Models\Reserva;

class VueloController extends Controller
{
    private function withRelaciones(){
        return [
            'aeronave:id,matricula,tipo,filas,columnas,columnas_config,pasillo_despues_de,filas_emergencia',
            'rutaOrigen:id,ciudad,codigo',
            'rutaDestino:id,ciudad,codigo'
        ];
    }

    // GET /api/v1/vuelos
    public function index()
    {
        $vuelos = Vuelo::with($this->withRelaciones())
        ->get()
        ->map(function($vuelo) {
            $aeronave = $vuelo->aeronave;
            $columnas = $aeronave->columnas
                ?: count(array_filter(explode(',', $aeronave->columnas_config)));
            $capacidad = $aeronave->filas * $columnas;

            $ocupados = Reserva::where('id_vuelo', $vuelo->id)
                ->whereNotIn('estado', ['cancelada'])
                ->count();

            $vuelo->asientos = [
                'disponibles'       => $capacidad - $ocupados,
                'ocupados'          => $ocupados,
                'asientosOcupados'  => Reserva::where('id_vuelo', $vuelo->id)
                                        ->whereNotIn('estado', ['cancelada'])
                                        ->pluck('asiento'),
                'capacidadAeronave' => $capacidad,
                'columnas'          => $columnas,
                'filas'             => $aeronave->filas,
                'pasillo_despues_de'=> $aeronave->pasillo_despues_de,
                'emergencia'        => $aeronave->filas_emergencia,
            ];

            return $vuelo;
        });

        return response()->json($vuelos);
    }

    // GET /api/v1/vuelos/{id}
    public function show($id)
    {
        $vuelo = Vuelo::with($this->withRelaciones())->find($id);

        if (!$vuelo) {
            return response()->json(['message' => 'Vuelo no encontrado'], 404);
        }

        $aeronave = $vuelo->aeronave;
        $columnas = $aeronave->columnas
            ?: count(array_filter(explode(',', $aeronave->columnas_config)));
        $capacidad = $aeronave->filas * $columnas;

        $ocupados = Reserva::where('id_vuelo', $vuelo->id)
            ->whereNotIn('estado', ['cancelada'])
            ->count();

        $vuelo->asientos = [
            'disponibles'       => $capacidad - $ocupados,
            'ocupados'          => $ocupados,
            'asientosOcupados'  => Reserva::where('id_vuelo', $vuelo->id)
                                        ->whereNotIn('estado', ['cancelada'])
                                        ->pluck('asiento'),
            'capacidadAeronave' => $capacidad,
            'columnas'          => $columnas,
            'filas'             => $aeronave->filas,
            'pasillo_despues_de'=> $aeronave->pasillo_despues_de,
            'emergencia'        => $aeronave->filas_emergencia,
        ];

        return response()->json($vuelo);
    }

    // POST /api/v1/vuelos
    public function store(Request $request)
    {
        $data = $request->validate([
            'num_vuelo'    => 'required|string|max:20',
            'id_aeronave'  => 'required|integer|exists:aeronaves,id',
            'id_origen'    => 'required|integer|exists:rutas,id',
            'id_destino'   => 'required|integer|exists:rutas,id',
            'fecha_vuelo'  => 'required|date',
            'hora_salida'  => 'required|regex:/^\d{2}:\d{2}$/',
            'hora_llegada' => 'nullable|regex:/^\d{2}:\d{2}$/',
            'estado'       => 'required|string|max:20',
        ]);

        $vuelo = Vuelo::create($data);

        return response()->json($vuelo->load($this->withRelaciones()), 201);
    }

    // PUT /api/v1/vuelos/{id}
    public function update(Request $request, $id)
    {
        $vuelo = Vuelo::find($id);

        if (!$vuelo) {
            return response()->json(['message' => 'Vuelo no encontrado'], 404);
        }

        $data = $request->validate([
            'num_vuelo'    => 'sometimes|string|max:20',
            'id_aeronave'  => 'sometimes|integer|exists:aeronaves,id',
            'id_origen'    => 'sometimes|integer|exists:rutas,id',
            'id_destino'   => 'sometimes|integer|exists:rutas,id',
            'fecha_vuelo'  => 'sometimes|date',
            'hora_salida'  => 'sometimes|regex:/^\d{2}:\d{2}$/',
            'hora_llegada' => 'nullable|regex:/^\d{2}:\d{2}$/',
            'estado'       => 'sometimes|string|max:20',
        ]);

        $vuelo->update($data);

        return response()->json($vuelo->load($this->withRelaciones()));
    }

    // DELETE /api/v1/vuelos/{id}
    public function destroy($id)
    {
        $vuelo = Vuelo::find($id);

        if (!$vuelo) {
            return response()->json(['message' => 'Vuelo no encontrado'], 404);
        }

        $vuelo->delete();

        return response()->json(['message' => 'Vuelo eliminado'], 200);
    }

    /*public function asientosDisponibles($idVuelo){
        $vuelo = Vuelo::find($idVuelo);
        if (!$vuelo) {
            return response()->json(['message' => 'Vuelo no encontrado'], 404);
        }

        $aeronave = $vuelo->aeronave;
        // columnas puede estar en 0 si la aeronave fue creada sin ese campo;
        // en ese caso se cuenta desde columnas_config (ej: "A,B,C,D,E,F" = 6)
        $columnas = $aeronave->columnas
            ?: count(array_filter(explode(',', $aeronave->columnas_config)));
        $capacidadAeronave = $aeronave->filas * $columnas;

        $ocupados = Reserva::where('id_vuelo', $idVuelo)
            ->whereNotIn('estado', ['cancelada'])
            ->count();

        $asientosOcupados = Reserva::where('id_vuelo', $idVuelo)
            ->whereNotIn('estado', ['cancelada'])
            ->pluck('asiento'); //pluck trae solo ese valor
    
        return response()->json([
            'disponibles' => $capacidadAeronave - $ocupados,
            'ocupados' => $ocupados,
            'asientosOcupados' => $asientosOcupados,
            'capacidadAeronave' => $capacidadAeronave,
            'columnas' => $columnas,
            'filas' => $aeronave->filas,
            'pasillo_despues_de' => $aeronave->pasillo_despues_de,
            'emergencia' => $aeronave->filas_emergencia,
        ]);
    }*/

    public function fechasDisponibles(){
        // DB::table() evita el cast Carbon sobre fecha_vuelo que falla con ODBC de SQL Server
        $fechas = DB::table('vuelos')
            ->whereRaw('fecha_vuelo >= CAST(GETDATE() AS DATE)')
            ->whereIn('estado', ['programado', 'embarcando', 'demorado'])
            ->pluck('fecha_vuelo')
            ->unique()
            ->values()
            ->map(fn($f) => substr($f, 0, 10)); // Asegurar formato YYYY-MM-DD

        return response()->json($fechas);
    }

}
