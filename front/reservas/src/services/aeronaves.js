import { getToken } from './auth'

const API_URL = "http://devdap:8000/api/v1"

export async function crearAeronave(data) {
  const response = await fetch(`${API_URL}/aeronaves`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al crear aeronave")
  }

  return result
}

export async function listarAeronaves() {
  const response = await fetch(`${API_URL}/aeronaves`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al listar aeronaves")
  }

  return result
}

export async function getAeronavesSelect() {
  const response = await fetch(`${API_URL}/aeronaves/select`, {
    headers: { "Authorization": `Bearer ${getToken()}` }
  })
  
  return response.json()
}

export async function getAeronave(id) {
  const response = await fetch(`${API_URL}/aeronaves/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al obtener la aeronave")
  }

  return result
}

export async function actualizarAeronave(data) {
  const response = await fetch(`${API_URL}/aeronaves/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al actualizar la aeronave")
  }

  return result
}

export async function eliminarAeronave(id) {
  const response = await fetch(`${API_URL}/aeronaves/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al eliminar la aeronave")
  }

  return result
}