import { apiFetch } from './auth'

export async function crearUsuario(data) {
  const response = await apiFetch('/usuarios', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al crear usuario')
  return result
}

export async function listarUsuarios() {
  const response = await apiFetch('/usuarios')
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al listar usuarios')
  return result
}

export async function getUsuario(id) {
  const response = await apiFetch(`/usuarios/${id}`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al obtener usuario')
  return result
}

export async function actualizarUsuario(data) {
  const response = await apiFetch(`/usuarios/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al actualizar usuario')
  return result
}

export async function eliminarUsuario(id) {
  const response = await apiFetch(`/usuarios/${id}`, { method: 'DELETE' })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al eliminar usuario')
  return result
}
