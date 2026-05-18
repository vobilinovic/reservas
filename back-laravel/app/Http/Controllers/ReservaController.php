<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Reserva;
use App\Models\Vuelo;

class ReservaController extends Controller
{
    // GET /api/v1/reservas
    public function index()
    {
        return response()->json(Reserva::all());
    }

    // GET /api/v1/reservas/{id}
    public function show($id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json(['message' => 'Reserva no encontrada'], 404);
        }

        return response()->json($reserva);
    }

    // POST /api/v1/reservas
    public function store(Request $request)
    {
        $data = $request->validate([
            'id_usuario'        => 'required|integer|exists:usuarios,id',
            'id_vuelo'          => 'required|integer|exists:vuelos,id',
            'asiento'           => 'required|string|max:5',
            'solicitudEspecial' => 'nullable|string|max:250',
            'fechaReserva'      => 'required|date',
            'fechaConfirmacion' => 'nullable|date',
            'fechaCancelacion'  => 'nullable|date',
            'estado'            => 'required|string|max:20',
        ]);

        $data['created_at'] = DB::raw('GETDATE()');
        $data['updated_at'] = DB::raw('GETDATE()');

        $reserva = Reserva::create($data);

        return response()->json($reserva, 201);
    }

    // PUT /api/v1/reservas/{id}
    public function update(Request $request, $id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json(['message' => 'Reserva no encontrada'], 404);
        }

        $data = $request->validate([
            'id_usuario'        => 'required|integer|exists:usuarios,id',
            'id_vuelo'          => 'required|integer|exists:vuelos,id',
            'asiento'           => 'required|string|max:5',
            'solicitudEspecial' => 'nullable|string|max:250',
            'fechaReserva'      => 'required|date',
            'fechaConfirmacion' => 'nullable|date',
            'fechaCancelacion'  => 'nullable|date',
            'estado'            => 'required|string|max:20',
        ]);

        $data['updated_at'] = DB::raw('GETDATE()');

        $reserva->update($data);

        return response()->json($reserva);
    }

    // DELETE /api/v1/reservas/{id}
    public function destroy($id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json(['message' => 'Reserva no encontrada'], 404);
        }

        $reserva->delete();

        return response()->json(['message' => 'Reserva eliminada'], 200);
    }

    public function reservasUsuario($id){
        $reservas = Reserva::with('vuelo')
            ->where('id_usuario', $id)
            ->where('estado', '!=', 'cancelada')
            ->orderBy('fechaReserva', 'desc')
            ->get();

        if ($reservas->isEmpty()) {
            return response()->json(['message' => 'No hay reservas activas'], 404);
        }

        return response()->json($reservas);

    }
}
