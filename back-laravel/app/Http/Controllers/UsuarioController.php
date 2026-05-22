<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\Rol;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{

    private function withRelaciones(){
        return [
            'rol:id,nombre,nivel,tipo',
        ];
    }

    // GET /api/v1/usuarios
    public function index(){
        return response()->json(Usuario::with($this->withRelaciones())->get());
    }

    // GET /api/v1/usuarios/{id}
    public function show($id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json($usuario);
    }

    // POST /api/v1/usuarios
    public function store(Request $request){

        //modificar
        $data = $request->validate([
            'rut'           => 'required|string|max:12',
            'nombre'        => 'required|string|max:100',
            'primer_apellido'  => 'nullable|string|max:100',
            'segundo_apellido' => 'nullable|string|max:100',
            'email'         => 'required|string|max:100',
            'empresa'       => 'nullable|string|max:100',
            'cargo'         => 'nullable|string|max:100',
            'activo'        => 'boolean',
            'password'      => 'required|string|max:255',
            'rol_id'        => 'required|integer|exists:roles,id',
            'asiento'              => 'nullable|string|max:5',
            'ubicacion'            => 'nullable|string|max:100',
            'requiere_preferencia' => 'boolean',
        ]);

        $data['password'] = Hash::make($data['password']);

        $usuario = Usuario::create($data);

        return response()->json($usuario, 201);
    }

    // PUT /api/v1/usuarios/{id}
    public function update(Request $request, $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $data = $request->validate([
            'rut'           => 'required|string|max:12',
            'nombre'        => 'required|string|max:100',
            'primer_apellido'  => 'nullable|string|max:100',
            'segundo_apellido' => 'nullable|string|max:100',
            'email'         => 'required|string|max:100',
            'empresa'       => 'nullable|string|max:100',
            'cargo'         => 'nullable|string|max:100',
            'activo'        => 'boolean',
            'password'      => 'sometimes|nullable|string|min:6|max:255',
            'rol_id'        => 'required|integer|exists:roles,id',
            'asiento'              => 'nullable|string|max:5',
            'ubicacion'            => 'nullable|string|max:100',
            'requiere_preferencia' => 'boolean',
        ]);

        // Solo hashear si se envió una contraseña nueva
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $usuario->update($data);

        return response()->json($usuario);
    }

    // DELETE /api/v1/usuarios/{id}
    public function destroy($id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $usuario->delete();

        return response()->json(['message' => 'Usuario eliminado'], 200);
    }
}
