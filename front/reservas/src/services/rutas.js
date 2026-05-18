import { getToken } from './auth'

const API_URL = "http://devdap:8000/api/v1"

export async function crearRuta(data) {
    const response = await fetch(`${API_URL}/rutas`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.message || result.detail || "Error al crear ruta")
    }

    return result
}

export async function listarRutas() {
  const response = await fetch(`${API_URL}/rutas`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al listar rutas")
  }

  return result
}

export async function getRuta(id) {
  const response = await fetch(`${API_URL}/rutas/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al obtener la ruta")
  }

  return result
}

export async function actualizarRuta(id, data) {
  const response = await fetch(`${API_URL}/rutas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al actualizar la ruta")
  }

  return result
}

export async function eliminarRuta(id) {
  const response = await fetch(`${API_URL}/rutas/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    }
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || result.detail || "Error al eliminar la ruta")
  }

  return result
}

