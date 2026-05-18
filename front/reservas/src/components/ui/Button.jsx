export function BotonPrimario({ id, texto, tipo = "button", onClick, disabled = false, icono, clase }) {
    return (
        <button
            id={id}
            type={tipo}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${clase} ${
                disabled
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-900 hover:bg-blue-800 cursor-pointer'
            }`}
        >
            {icono}
            {texto}
        </button>
    )
}

export function BotonSecundario({ id, texto, tipo = "button", onClick, disabled = false }) {
    return (
        <button
            id={id}
            type={tipo}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 transition-colors ${
                disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50 cursor-pointer'
            }`}
        >
            {texto}
        </button>
    )
}

export function BotonDark({ id, texto, tipo = "button", onClick, disabled = false }) {
    return (
        <button
            id={id}
            type={tipo}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
                disabled
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-700 cursor-pointer'
            }`}
        >
            {texto}
        </button>
    )
}

export function BotonDanger({ id, texto, tipo = "button", clase, onClick, disabled = false }) {
    return (
        <button
            id={id}
            type={tipo}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${clase} ${
                disabled
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 cursor-pointer'
            }`}
        >
            {texto}
        </button>
    )
}