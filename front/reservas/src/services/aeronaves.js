import { apiFetch } from './auth'

export async function crearAeronave(data) {
  const response = await apiFetch('/aeronaves', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al crear aeronave')
  return result
}

export async function listarAeronaves() {
  const response = await apiFetch('/aeronaves')
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al listar aeronaves')
  return result
}

export async function getAeronavesSelect() {
  const response = await apiFetch('/aeronaves/select')
  return response.json()
}

export async function getAeronave(id) {
  const response = await apiFetch(`/aeronaves/${id}`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al obtener la aeronave')
  return result
}

export async function actualizarAeronave(data) {
  const response = await apiFetch(`/aeronaves/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al actualizar la aeronave')
  return result
}

export async function eliminarAeronave(id) {
  const response = await apiFetch(`/aeronaves/${id}`, { method: 'DELETE' })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al eliminar la aeronave')
  return result
}
