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
  if (!response.ok) throw new Error(result.message || result.detail || 'Error al listar reservas')
  return result
}
