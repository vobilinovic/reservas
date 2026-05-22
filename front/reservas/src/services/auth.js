const API_URL = "http://devdap:8000/api/v1"

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

// Wrapper central: agrega el token y cierra sesión automáticamente si el backend devuelve 401
export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
  })

  if (response.status === 401) {
    logout()
    window.location.href = '/'
    return
  }

  return response
}

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

export async function recuperarPassword(email) {
  const response = await fetch(`${API_URL}/auth/recuperar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })

  const result = await response.json()

  if (!response.ok) throw new Error(result.message || 'Error al enviar código')

  return result
}

export async function resetearPassword(email, token, password, passwordConfirmation) {
  const response = await fetch(`${API_URL}/auth/resetear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      token,
      password,
      password_confirmation: passwordConfirmation
    })
  })
  const result = await response.json()

  if (!response.ok) throw new Error(result.message || result.mensaje || 'Error al resetear contraseña')

  return result
}
