import { apiFetch } from './auth'

export async function crearRol(data) {
  const response = await apiFetch('/roles', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al crear rol')
  return result
}

export async function listarRoles() {
  const response = await apiFetch('/roles')
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al listar roles')
  return result
}

export async function getRol(id) {
  const response = await apiFetch(`/roles/${id}`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al obtener rol')
  return result
}

export async function actualizarRol(data) {
  const response = await apiFetch(`/roles/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al actualizar rol')
  return result
}

export async function eliminarRol(id) {
  const response = await apiFetch(`/roles/${id}`, { method: 'DELETE' })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al eliminar rol')
  return result
}
