import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarRutas, eliminarRuta } from '../../../services/rutas'
import { BotonPrimario, BotonSecundario, BotonDanger } from '../../../components/ui/Button'
import { Pencil, Plus, Trash } from 'lucide-react'
import ModalEliminar from '../../../components/ModalEliminar'

function BadgeEstado({ activa }) {
    return activa
        ? <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">Activa</span>
        : <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">Inactiva</span>
}

function FilasSkeleton() {
    return Array.from({ length: 4 }, (_, i) => (
        <tr key={i} className="border-b border-gray-100">
            {Array.from({ length: 6 }, (_, j) => (
                <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                </td>
            ))}
        </tr>
    ))
}


function Rutas() {
    const navigate = useNavigate()
    const [rutas, setRutas]               = useState([])
    const [loading, setLoading]           = useState(true)
    const [error, setError]               = useState('')
    const [rutaAEliminar, setRutaAEliminar] = useState(null)   // ruta seleccionada para eliminar
    const [eliminando, setEliminando]     = useState(false)
    const [busqueda, setBusqueda] = useState('')

    const filtrados = rutas.filter(r => 
        r.ciudad.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.region.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    )

    useEffect(() => {
        cargar()
    }, [])

    async function cargar() {
        setLoading(true)
        setError('')
        try {
            const data = await listarRutas()
            setRutas(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function confirmarEliminar() {
        setEliminando(true)
        try {
            await eliminarRuta(rutaAEliminar.id)
            setRutaAEliminar(null)
            // Quitar la ruta eliminada de la lista sin recargar
            setRutas(prev => prev.filter(r => r.id !== rutaAEliminar.id))
        } catch (err) {
            setError(err.message)
            setRutaAEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    return (
        <div className="p-8">

            {/* Modal de confirmacion */}
            {rutaAEliminar && (
                <ModalEliminar
                    data={rutaAEliminar}
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => setRutaAEliminar(null)}
                    eliminando={eliminando}
                    tipo = "ruta"
                />
            )}

            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Gestión de Rutas</h2>
                    <p className="text-gray-400 text-sm mt-1">Configuración de rutas.</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        type="text"
                        placeholder= "Buscar"
                        className="w-100 p-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-900"
                    />
                    <BotonPrimario
                        texto="Ingresar Ruta"
                        icono={<Plus/>}
                        onClick={() => navigate('/admin/rutas/nueva')}
                    />
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">

                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-100 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-left">
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ciudad</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Región</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Código</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Descripción</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>

                        {loading && <FilasSkeleton />}

                        {!loading && rutas.length === 0 && !error && (
                            <tr>
                                <td colSpan={6} className="px-4 py-16 text-center text-gray-300 text-sm">
                                    No hay rutas registradas.
                                </td>
                            </tr>
                        )}

                        {filtrados.map(r => (
                            <tr key={r.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">

                                <td className="px-4 py-3 text-gray-800">
                                    {r.ciudad}
                                </td>

                                <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                                    {r.region}
                                </td>

                                <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                                        {r.codigo}
                                    </span>
                                </td>

                                <td className="px-4 py-3 text-gray-500">
                                    {r.descripcion || <span className="text-gray-300 italic">—</span>}
                                </td>

                                <td className="px-4 py-3">
                                    <BadgeEstado activa={r.estado} />
                                </td>

                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => navigate(`/admin/rutas/editar/${r.id}`)}
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

                {!loading && rutas.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                        {busqueda ? filtrados.length : rutas.length} ruta{filtrados.length !== 1 ? 's' : ''} registrada{filtrados.length !== 1 ? 's' : ''}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Rutas
