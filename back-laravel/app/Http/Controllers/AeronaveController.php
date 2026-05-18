<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aeronave;

class AeronaveController extends Controller
{
    // GET /api/v1/aeronaves  (nivel mínimo 1)
    public function index()
    {
        return response()->json(Aeronave::all());
    }

    // POST /api/v1/aeronaves  (nivel mínimo 3 — operador/admin)
    public function store(Request $request)
    {
        $data = $request->validate([
            'tipo'               => 'required|string|max:10',
            'matricula'          => 'required|string|max:20|unique:aeronaves,matricula',
            'filas'              => 'required|integer|min:1',
            'columnas'           => 'required|integer|min:1|max:26',
            'columnas_config'    => 'required|string|max:20',
            'pasillo_despues_de' => 'required|string|max:2',
            'filas_emergencia'   => 'nullable|string|max:20',
            'estado'             => 'boolean',
        ]);

        $aeronave = Aeronave::create($data);

        return response()->json($aeronave, 201);
    }

    public function show($id)
    {
        $aeronave = Aeronave::find($id);

        if (!$aeronave) {
            return response()->json(['message' => 'Aeronave no encontrada'], 404);
        }

        return response()->json($aeronave);
    }

    public function update(Request $request, $id)
    {
        $aeronave = Aeronave::find($id);

        if (!$aeronave) {
            return response()->json(['message' => 'Aeronave no encontrada'], 404);
        }

        $data = $request->validate([
            'tipo'               => 'required|string|max:10',
            'matricula' => "required|string|max:20|unique:aeronaves,matricula,{$id}",
            'filas'              => 'required|integer|min:1',
            'columnas'           => 'required|integer|min:1|max:26',
            'columnas_config'    => 'required|string|max:20',
            'pasillo_despues_de' => 'required|string|max:2',
            'filas_emergencia'   => 'nullable|string|max:20',
            'estado'             => 'boolean',
        ]);

        $aeronave->update($data);

        return response()->json($aeronave);
    }

    public function selectList()
    {
        return Aeronave::where('estado', true)
            ->select('id', 'matricula', 'tipo')
            ->orderBy('matricula')
            ->get();
    }

    public function destroy($id)
    {
        $aeronave = Aeronave::find($id);

        if (!$aeronave) {
            return response()->json(['message' => 'Aeronave no encontrada'], 404);
        }

        $aeronave->delete();

        return response()->json(['message' => 'Aeronave eliminada'], 200);
    }
}
