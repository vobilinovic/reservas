const ESTADO_ESTILOS = {
    programado: 'bg-blue-50 text-blue-700 border border-blue-200',
    embarcando: 'bg-green-50 text-green-700 border border-green-200',
    en_vuelo:   'bg-indigo-50 text-indigo-700 border border-indigo-200',
    demorado:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
}
const ESTADO_LABELS = {
    programado: 'Programado',
    embarcando: 'Embarcando',
    en_vuelo:   'En vuelo',
    demorado:   'Demorado',
}

export function BadgeEstado({ estado }) {
    const clase = ESTADO_ESTILOS[estado] ?? 'bg-gray-100 text-gray-500 border border-gray-200'
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${clase}`}>
            {ESTADO_LABELS[estado] ?? estado}
        </span>
    )
}

export default BadgeEstado

