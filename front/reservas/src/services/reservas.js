import { getToken } from './auth'

const API_URL = "http://devdap:8000/api/v1"

export async function crearReserva(data) {
  const response = await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al crear la reserva")
  }

  return result
}

export async function listarReservasUsuario(id) {
  const response = await fetch(`${API_URL}/reservas/${id}/usuario`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al listar reservas")
  }

  return result
}