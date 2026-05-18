import { getToken } from './auth'

const API_URL = "http://devdap:8000/api/v1";

export async function crearVuelo(data) {
  const response = await fetch(`${API_URL}/vuelos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al crear vuelo")
  }

  return result
}

export async function listarVuelos() {
  const response = await fetch(`${API_URL}/vuelos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  })

  const result = await response.json()
  console.log(result)

  if (!response.ok) {
    throw new Error(result.detail || "Error al listar vuelos")
  }

  return result
}

export async function getVuelo(id) {
  const response = await fetch(`${API_URL}/vuelos/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al obtener información del vuelo")
  }

  return result
}

export async function asientosDisponibles(id) {
  const response = await fetch(`${API_URL}/vuelos/${id}/asientos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.detail || "Error al listar asientos disponibles")
  }
  console.log(result)
  return result
}

