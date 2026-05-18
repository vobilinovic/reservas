import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarVuelos } from '../../services/vuelos'
import { BotonPrimario } from '../../components/ui/Button'
import { Pencil, Plus, Trash } from 'lucide-react'

/* ---- Badge estado ---- */
const ESTADO_ESTILOS = {
    programado: 'bg-blue-50  text-blue-700  border border-blue-200',
    embarcando: 'bg-green-50 text-green-700 border border-green-200',
    en_vuelo:   'bg-indigo-50 text-indigo-700 border border-indigo-200',
    aterrizado: 'bg-gray-100  text-gray-600  border border-gray-200',
    demorado:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
    cancelado:  'bg-red-50   text-red-600    border border-red-200',
}

const ESTADO_LABELS = {
    programado: 'Programado',
    embarcando: 'Embarcando',
    en_vuelo:   'En vuelo',
    aterrizado: 'Aterrizado',
    demorado:   'Demorado',
    cancelado:  'Cancelado',
}

function BadgeEstado({ estado }) {
    const clase = ESTADO_ESTILOS[estado] ?? 'bg-gray-100 text-gray-500 border border-gray-200'
    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${clase}`}>
            {ESTADO_LABELS[estado] ?? estado}
        </span>
    )
}

/* ---- Skeleton ---- */
function FilasSkeleton() {
    return Array.from({ length: 4 }, (_, i) => (
        <tr key={i} className="border-b border-gray-100">
            {Array.from({ length: 7 }, (_, j) => (
                <td key={j} className="px-5 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                </td>
            ))}
        </tr>
    ))
}


function Vuelos() {
    const navigate = useNavigate()
    const [vuelos, setVuelos]   = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState('')

    useEffect(() => {
        async function cargar() {
            try {
                const data = await listarVuelos()
                setVuelos(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [])

    return (
        <div className="p-8">

            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Gestión de Vuelos</h2>
                    <p className="text-gray-400 text-sm mt-1">Vuelos programados y su estado operacional.</p>
                </div>
                <BotonPrimario
                    texto="Ingresar Vuelo"
                    icono={<Plus/>}
                    onClick={() => navigate('/vuelos/nuevo')}
                />
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">

                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-100 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-left">
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">N° Vuelo</th>
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Aeronave</th>
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Ruta</th>
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Fecha</th>
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Horario</th>
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Estado</th>
                            <th className="px-5 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>

                        {loading && <FilasSkeleton />}

                        {!loading && vuelos.length === 0 && !error && (
                            <tr>
                                <td colSpan={7} className="px-5 py-16 text-center text-gray-300 text-sm">
                                    No hay vuelos registrados.
                                </td>
                            </tr>
                        )}

                        {vuelos.map(v => (
                            <tr key={v.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">

                                {/* N° Vuelo */}
                                <td className="px-5 py-4">
                                    <span className="font-mono font-bold text-sm text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg">
                                        {v.num_vuelo}
                                    </span>
                                </td>

                                {/* Aeronave */}
                                <td className="px-5 py-4">
                                    <span className="font-mono text-sm font-semibold text-gray-700">
                                        {v.aeronave?.matricula}
                                    </span>
                                    <span className="ml-2 text-xs text-gray-400">{v.aeronave?.tipo}</span>
                                </td>

                                {/* Ruta */}
                                <td className="px-5 py-4">
                                    <span className="font-mono font-bold text-gray-800">{v.ruta_origen?.codigo}</span>
                                    <span className="mx-1 text-xs text-gray-400">{v.ruta_origen?.ciudad}</span>
                                    <span className="mx-1.5 text-gray-300">→</span>
                                    <span className="font-mono font-bold text-gray-800">{v.ruta_destino?.codigo}</span>
                                    <span className="ml-1 text-xs text-gray-400">{v.ruta_destino?.ciudad}</span>
                                </td>

                                {/* Fecha */}
                                <td className="px-5 py-4 text-sm text-gray-600">
                                    {v.fecha_vuelo}
                                </td>

                                {/* Horario */}
                                <td className="px-5 py-4">
                                    <span className="font-mono text-sm font-semibold text-gray-800">{v.hora_salida}</span>
                                    {v.hora_llegada && (
                                        <>
                                            <span className="mx-1 text-gray-300">–</span>
                                            <span className="font-mono text-sm text-gray-500">{v.hora_llegada}</span>
                                        </>
                                    )}
                                </td>

                                {/* Estado */}
                                <td className="px-5 py-4">
                                    <BadgeEstado estado={v.estado} />
                                </td>

                                {/* acciones */}
                                <td className="px-5 py-4 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    <button
                                      onClick={() => navigate(`/rutas/editar/${v.id}`)}
                                      className="flex items-center gap-1.5 text-sm text-blue-900 hover:underline font-medium"
                                    >
                                      <Pencil size={14}/> Editar
                                    </button>
                                    <span className="text-gray-200">|</span>
                                    <button
                                      onClick={() => setRutaAEliminar(r)}
                                      className="flex items-center gap-1.5 text-sm text-red-600 hover:underline font-medium"
                                    >
                                      <Trash size={14}/> Eliminar
                                    </button>
                                  </div>
                                </td>

                            </tr>
                        ))}

                    </tbody>
                </table>

                {!loading && vuelos.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
                        {vuelos.length} vuelo{vuelos.length !== 1 ? 's' : ''} registrado{vuelos.length !== 1 ? 's' : ''}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Vuelos
