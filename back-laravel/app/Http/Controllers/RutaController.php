<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ruta;

class RutaController extends Controller
{
    // GET /api/v1/rutas
    public function index()
    {
        return response()->json(Ruta::all());
    }

    // GET /api/v1/rutas/{id}
    public function show($id)
    {
        $ruta = Ruta::find($id);

        if (!$ruta) {
            return response()->json(['message' => 'Ruta no encontrada'], 404);
        }

        return response()->json($ruta);
    }

    // POST /api/v1/rutas
    public function store(Request $request)
    {
        $data = $request->validate([
            'ciudad'        => 'required|string|max:100',
            'region'        => 'required|string|max:100',
            'codigo'        => 'required|string|max:20',
            'descripcion'   => 'nullable|string|max:200',
            'estado'        => 'boolean',
        ]);

        $ruta = Ruta::create($data);

        return response()->json($ruta, 201);
    }

    // PUT /api/v1/rutas/{id}
    public function update(Request $request, $id)
    {
        $ruta = Ruta::find($id);

        if (!$ruta) {
            return response()->json(['message' => 'Vuelo no encontrado'], 404);
        }

        $data = $request->validate([
            'ciudad'        => 'required|string|max:100',
            'region'        => 'required|string|max:100',
            'codigo'        => 'required|string|max:20',
            'descripcion'   => 'nullable|string|max:200',
            'estado'        => 'boolean',
        ]);

        $ruta->update($data);

        return response()->json($ruta);
    }

    // DELETE /api/v1/rutas/{id}
    public function destroy($id)
    {
        $ruta = Ruta::find($id);

        if (!$ruta) {
            return response()->json(['message' => 'Ruta no encontrada'], 404);
        }

        $ruta->delete();

        return response()->json(['message' => 'Ruta eliminada'], 200);
    }
}
