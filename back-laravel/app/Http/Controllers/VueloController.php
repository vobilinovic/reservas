<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Vuelo;
use App\Models\Reserva;
use App\Models\Usuario;

class VueloController extends Controller
{
    private function withRelaciones(){
        return [
            'aeronave:id,matricula,tipo,filas,columnas,columnas_config,pasillo_despues_de,filas_emergencia',
            'rutaOrigen:id,ciudad,codigo',
            'rutaDestino:id,ciudad,codigo',
            'reservas'
        ];
    }

    // GET /api/v1/vuelos
    public function index()
    {
        $vuelos = Vuelo::with($this->withRelaciones())
        ->get()
        ->map(function($vuelo) {
            $cupo = $vuelo->cupo;
            $aeronave = $vuelo->aeronave;
            $columnas = $aeronave->columnas
                ?: count(array_filter(explode(',', $aeronave->columnas_config)));
            $capacidad = $aeronave->filas * $columnas;

            $ocupados = Reserva::where('id_vuelo', $vuelo->id)
                ->whereNotIn('estado', ['cancelada'])
                ->count();

            $vuelo->asientos = [
                'disponibles'       => $cupo - $ocupados,
                'ocupados'          => $ocupados,
                'asientosOcupados'  => Reserva::where('id_vuelo', $vuelo->id)
                                        ->whereNotIn('estado', ['cancelada'])
                                        ->pluck('asiento'),
                'capacidadAeronave' => $capacidad,
                'cupo'              => $cupo,
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
        $relaciones = array_merge(
            array_filter($this->withRelaciones(), fn($r) => $r !== 'reservas'),
            ['reservas.usuario:id,nombre,rut,email,cargo']
        );

        $vuelo = Vuelo::with($relaciones)->find($id);

        if (!$vuelo) {
            return response()->json(['message' => 'Vuelo no encontrado'], 404);
        }

        $cupo = $vuelo->cupo;
        $aeronave = $vuelo->aeronave;
        $colsValidas = array_values(array_map('trim', explode(',', $aeronave->columnas_config))); // ['A','B','C','D','E']
        $totalFilas  = $aeronave->filas;
        $columnas = $aeronave->columnas
            ?: count(array_filter(explode(',', $aeronave->columnas_config)));
        $capacidad = $totalFilas * $columnas;

        //reservados realmente
        $asientosReservados = Reserva::where('id_vuelo', $vuelo->id)
                                ->whereNotIn('estado', ['cancelada'])
                                ->pluck('asiento')
                                ->toArray();
        //total reservados
        $ocupados = count($asientosReservados);

        $asignados = $asientosReservados; // parte con los ya reservados

        $asientosOcupados = Usuario::whereNotNull('asiento')
                            ->get()
                            ->map(function($usuario) use ($vuelo, $aeronave, $colsValidas, $totalFilas, &$asignados) {
                                //¿los usuarios con asiento asignado ya tienen reserva para este vuelo?
                                $reserva = Reserva::where('id_vuelo', $vuelo->id)
                                    ->where('id_usuario', $usuario->id)
                                    ->whereNotIn('estado', ['cancelada'])
                                    ->first();
                                
                                if ($reserva) return $reserva->asiento;

                                //ahora revisamos si los asientos asignados existen en esta aeronave
                                $col   = preg_replace('/[0-9]/', '', $usuario->asiento);
                                $fila  = (int) preg_replace('/[A-Z]/', '', $usuario->asiento);
                                $existe = in_array($col, $colsValidas) && $fila <= $totalFilas;

                                if ($existe && !in_array($usuario->asiento, $asignados)) {
                                    $asignados[] = $usuario->asiento;
                                    return $usuario->asiento;
                                }

                                //si no existe, buscamos por ubicacion preferida
                                if ($usuario->ubicacion) {
                                    $mitad   = floor(count($colsValidas) / 2);
                                    $ventana = [$colsValidas[0], $colsValidas[count($colsValidas) - 1]];
                                    $pasillo = count($colsValidas) > 2
                                        ? [$colsValidas[$mitad - 1], $colsValidas[$mitad]]
                                        : $ventana;
                                    $medio = array_values(array_diff($colsValidas, $ventana, $pasillo));

                                    $colsBuscar = match($usuario->ubicacion) {
                                        'ventana' => $ventana,
                                        'pasillo' => $pasillo,
                                        'medio'   => array_values($medio),
                                        default   => $colsValidas
                                    };

                                    for ($f = 1; $f <= $totalFilas; $f++) {
                                        foreach ($colsBuscar as $c) {
                                            $asiento = $f . $c;
                                            if (!in_array($asiento, $asignados)) {
                                                $asignados[] = $asiento;
                                                return $asiento;
                                            }
                                        }
                                    }
                                }

                                return null;
                            })
                            ->filter()
                            ->unique()
                            ->values();

        $vuelo->asientos = [
            'disponibles'       => $cupo - $ocupados,
            'ocupados'          => $ocupados,
            'asientosOcupados'  => $asientosOcupados,
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
            'cupo'          => 'required|integer|min:0',
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
            'cupo'          => 'sometimes|integer|min:0',
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
