import { apiFetch } from './auth'

export async function crearReserva(data) {
  const response = await apiFetch('/reservas', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al crear la reserva')
  return result
}

export async function listarReservasUsuario(id) {
  const response = await apiFetch(`/reservas/${id}/usuario`)
  const result = await response.json()
  if (response.status === 404) return []   // sin reservas activas → lista vacía
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al listar reservas')
  return result
}

export async function getReserva(id) {
  const response = await apiFetch(`/reservas/${id}`)
  const result = await response.json()
  console.log(result)
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al obtener detalle de la reserva')
  return result
}

export async function actualizarReserva(data){
  const response = await apiFetch(`/reservas/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al editar la reserva')
  return result
}

