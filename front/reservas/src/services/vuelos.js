import { apiFetch } from './auth'

export async function crearVuelo(data) {
  const response = await apiFetch('/vuelos', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al crear vuelo')
  return result
}

export async function listarVuelos() {
  const response = await apiFetch('/vuelos')
  const result = await response.json()
  if (!response.ok) throw new Error(result.detail || 'Error al listar vuelos')
  return result
}

export async function getVuelo(id) {
  const response = await apiFetch(`/vuelos/${id}`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al obtener información del vuelo')
  return result
}

export async function actualizarVuelo(data) {
  const response = await apiFetch(`/vuelos/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al actualizar vuelo')
  return result
}

export async function eliminarVuelo(id) {
  const response = await apiFetch(`/vuelos/${id}`, { method: 'DELETE' })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al eliminar vuelo')
  return result
}

export async function asientosDisponibles(id) {
  const response = await apiFetch(`/vuelos/${id}/asientos`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.detail || 'Error al listar asientos disponibles')
  return result
}

export async function getFechasDisponibles() {
    const response = await apiFetch(`/vuelos/fechas-disponibles`)
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Error')
    return result
}