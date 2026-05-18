const API_URL = "http://devdap:8000/api/v1"

export async function login(rut, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rut, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.detail || "Error al iniciar sesión")
  }

  return data
}

export function getToken() {
  return localStorage.getItem("token")
}

export function saveSession(data) {
  localStorage.setItem("token", data.access_token)
  localStorage.setItem("usuario", JSON.stringify(data.usuario))
}

export function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("usuario")
}

export function getUsuario() {
  const u = localStorage.getItem("usuario")
  return u ? JSON.parse(u) : null
}