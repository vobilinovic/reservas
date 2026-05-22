import { apiFetch } from './auth'

export async function crearRuta(data) {
  const response = await apiFetch('/rutas', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al crear ruta')
  return result
}

export async function listarRutas() {
  const response = await apiFetch('/rutas')
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al listar rutas')
  return result
}

export async function getRuta(id) {
  const response = await apiFetch(`/rutas/${id}`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al obtener la ruta')
  return result
}

export async function actualizarRuta(id, data) {
  const response = await apiFetch(`/rutas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al actualizar la ruta')
  return result
}

export async function eliminarRuta(id) {
  const response = await apiFetch(`/rutas/${id}`, { method: 'DELETE' })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al eliminar la ruta')
  return result
}
