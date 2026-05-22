import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarAeronaves, eliminarAeronave } from '../../../services/aeronaves'
import { BotonPrimario } from '../../../components/ui/Button'
import { Plus, Pencil, Trash, Plane } from 'lucide-react'
import ModalEliminar from '../../../components/ModalEliminar'

function BadgeTipo({ tipo }) {
    const colores = {
        RJ85:  'bg-blue-100 text-blue-800',
        RJ100: 'bg-indigo-100 text-indigo-800',
    }
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${colores[tipo] ?? 'bg-gray-100 text-gray-600'}`}>
            {tipo}
        </span>
    )
}

function BadgeEstado({ activa }) {
    return activa
        ? <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">Activa</span>
        : <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">Inactiva</span>
}

function FilasSkeleton() {
    return Array.from({ length: 4 }, (_, i) => (
        <tr key={i} className="border-b border-gray-100">
            {Array.from({ length: 7 }, (_, j) => (
                <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                </td>
            ))}
        </tr>
    ))
}

function Aeronaves() {
    const navigate = useNavigate()
    const [aeronaves, setAeronaves] = useState([])
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState('')
    const [aeronaveAEliminar, setAeronaveAEliminar] = useState(null)  
    const [eliminando, setEliminando]     = useState(false)
    const [busqueda, setBusqueda] = useState('')

    const filtrados = aeronaves.filter(a =>
        a.matricula.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.tipo.toLowerCase().includes(busqueda.toLowerCase())
    )

    useEffect(() => {
        async function cargar() {
            try {
                const data = await listarAeronaves();

                setAeronaves(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [])

    async function confirmarEliminar() {
        setEliminando(true)
        try {
            await eliminarAeronave(aeronaveAEliminar.id)
            setAeronaveAEliminar(null)
            setAeronaves(prev => prev.filter(r => r.id !== aeronaveAEliminar.id))
        } catch (err) {
            setError(err.message)
            setAeronaveAEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    return (
        <div className="p-8">
            {/* Modal de confirmacion eliminar*/}
            {aeronaveAEliminar && (
                <ModalEliminar
                    data={aeronaveAEliminar}
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => setAeronaveAEliminar(null)}
                    eliminando={eliminando}
                    tipo = "aeronave"
                />
            )}
            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 flex gap-2"><Plane/> Gestión de Aeronaves</h2>
                    <p className="text-gray-400 text-sm mt-1">Configuración de las aeronaves disponibles.</p>
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
                        icono = {<Plus />}
                        texto="Ingresar Aeronave"
                        onClick={() => navigate('/admin/aeronaves/nueva')}
                    />
                </div>
            </div>
            <div className="flex items-start justify-start mb-6">
                
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
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Matrícula</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Distribución</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Capacidad</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Config. columnas</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>

                        {loading && <FilasSkeleton />}

                        {!loading && aeronaves.length === 0 && !error && (
                            <tr>
                                <td colSpan={7} className="px-4 py-16 text-center text-gray-300 text-sm">
                                    No hay aeronaves registradas.
                                </td>
                            </tr>
                        )}

                        {filtrados.map(a => (
                            <tr key={a.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">

                                <td className="px-4 py-3">
                                    <BadgeTipo tipo={a.tipo} />
                                </td>

                                <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                                    {a.matricula}
                                </td>

                                <td className="px-4 py-3 text-gray-500">
                                    {a.filas} filas × {a.columnas} col.
                                </td>

                                <td className="px-4 py-3 text-gray-700 font-medium">
                                    {a.filas * a.columnas} pasajeros
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex gap-1 flex-wrap">
                                        {a.columnas_config.split(',').map(col => (
                                            <span
                                                key={col}
                                                className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold border ${
                                                    col.trim() === a.pasillo_despues_de
                                                        ? 'bg-blue-900 text-white border-blue-900'
                                                        : 'bg-white text-gray-500 border-gray-200'
                                                }`}
                                                title={col.trim() === a.pasillo_despues_de ? 'Pasillo después de esta columna' : ''}
                                            >
                                                {col.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <BadgeEstado activa={a.estado} />
                                </td>

                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                                onClick={() => navigate(`/admin/aeronaves/editar/${a.id}`)}
                                                className="flex items-center gap-1.5 text-sm text-blue-900 hover:underline font-medium"
                                            >
                                                <Pencil size={14}/> Editar
                                            </button>
                                            <span className="text-gray-200">|</span>
                                            <button
                                                onClick={() => setAeronaveAEliminar(a)}
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

                {!loading && aeronaves.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                        {busqueda ? filtrados.length : aeronaves.length} aeronave{filtrados.length !== 1 ? 's' : ''} registrada{filtrados.length !== 1 ? 's' : ''}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Aeronaves
