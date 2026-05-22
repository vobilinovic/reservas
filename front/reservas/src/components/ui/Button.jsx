import { useState, useRef, useEffect } from 'react'
export function BotonPrimario({ id, texto, tipo = "button", onClick, disabled = false, icono, clase }) {
    return (
        <button
            id={id}
            type={tipo}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors ${clase} ${
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

export function BotonSecundario({ id, texto, tipo = "button", onClick, disabled = false, icono }) {
    return (
        <button
            id={id}
            type={tipo}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 transition-colors ${
                disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50 cursor-pointer'
            }`}
        >
            {icono}
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
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors ${
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
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors ${clase} ${
                disabled
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 cursor-pointer'
            }`}
        >
            {texto}
        </button>
    )
}

export function BotonDropdown({ texto, icono, opciones = [], clase }) {
    const [abierto, setAbierto] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        function handleClickFuera(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setAbierto(false)
            }
        }
        document.addEventListener('mousedown', handleClickFuera)
        return () => document.removeEventListener('mousedown', handleClickFuera)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setAbierto(!abierto)}
                className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-sm border border-gray-300 text-sm font-semibold text-gray-700 transition-colors cursor-pointer ${clase}`}
            >
                {icono}
                {texto}
                <svg className={`w-4 h-4 transition-transform ${abierto ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {abierto && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-52 overflow-hidden">
                    {opciones.map((op, i) => (
                        <div key={i}>
                            {op.esArchivo ? (
                                <label className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                                    {op.icono && <span>{op.icono}</span>}
                                    {op.texto}
                                    <input type="file" accept={op.accept || '.csv'} onChange={op.onClick} className="hidden" />
                                </label>
                            ) : (
                                <button
                                    onClick={() => { op.onClick(); setAbierto(false) }}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    {op.icono && <span>{op.icono}</span>}
                                    {op.texto}
                                </button>
                            )}
                            {i < opciones.length - 1 && <hr className="border-gray-100" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}