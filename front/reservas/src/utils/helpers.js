export function formatearFecha(fecha) {
    if (!fecha) return '—'
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export function formatearFechaHora(fecha) {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export function formatearRut(rut) {
    if (!rut) return ''
    return rut.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function limpiarRut(rut) {
    if (!rut) return ''
    return rut.replace(/\./g, '').trim()
}

export function mayusculas(texto) {
    if (!texto) return ''
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}