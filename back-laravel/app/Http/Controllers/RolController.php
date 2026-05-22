<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rol;

class RolController extends Controller
{
    // GET /api/v1/roles
    public function index()
    {
        return response()->json(Rol::all());
    }

    // POST /api/v1/roles
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'   => 'required|string|max:100',
            'nivel'    => 'required|integer|min:1|max:3',
            'tipo'     => 'required|string|max:10',
        ]);

        $rol = Rol::create($data);

        return response()->json($rol, 201);
    }

    // GET /api/v1/roles/{id}
    public function show($id)
    {
        $rol = Rol::find($id);

        if (!$rol) {
            return response()->json(['message' => 'Rol no encontrado'], 404);
        }

        return response()->json($rol);
    }

    // PUT /api/v1/roles/{id}
    public function update(Request $request, $id)
    {
        $rol = Rol::find($id);

        if (!$rol) {
            return response()->json(['message' => 'Rol no encontrado'], 404);
        }

        $data = $request->validate([
            'nombre'   => 'required|string|max:100',
            'nivel'    => 'required|integer|min:1|max:3',
            'tipo'     => 'required|string|max:10',
        ]);

        $rol->update($data);

        return response()->json($rol);
    }

    // DELETE /api/v1/roles/{id}
    public function destroy($id)
    {
        $rol = Rol::find($id);

        if (!$rol) {
            return response()->json(['message' => 'Rol no encontrado'], 404);
        }

        $rol->delete();

        return response()->json(['message' => 'Rol eliminado'], 200);
    }
}
?>