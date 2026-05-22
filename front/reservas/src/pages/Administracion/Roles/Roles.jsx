import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarRoles, eliminarRol } from '../../../services/roles'
import { BotonPrimario, BotonSecundario, BotonDanger } from '../../../components/ui/Button'
import { Pencil, Plus, Trash, UserKey } from 'lucide-react'
import ModalEliminar from '../../../components/ModalEliminar'
import { formatearFechaHora, formatearRut } from '../../../utils/helpers'

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


function Roles() {
    const navigate = useNavigate()
    const [roles, setRoles]               = useState([])
    const [loading, setLoading]           = useState(true)
    const [error, setError]               = useState('')
    const [rolAEliminar, setRolAEliminar] = useState(null)   
    const [eliminando, setEliminando]     = useState(false)
    const [busqueda, setBusqueda] = useState('')

    const filtrados = roles.filter(r => 
        r.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        r.tipo.toLowerCase().includes(busqueda.toLowerCase()) 
    )

    useEffect(() => {
        cargar()
        
    }, [])

    async function cargar() {
        setLoading(true)
        setError('')
        try {
            const data = await listarRoles()
            setRoles(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function confirmarEliminar() {
        setEliminando(true)
        try {
            await eliminarRol(rolAEliminar.id)
            setRolAEliminar(null)
            // Quitar el usuario eliminado de la lista sin recargar
            setRoles(prev => prev.filter(r => r.id !== rolAEliminar.id))
        } catch (err) {
            setError(err.message)
            setRolAEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    return (
        <div className="p-8">

            {/* Modal de confirmacion */}
            {rolAEliminar && (
                <ModalEliminar
                    data={rolAEliminar}
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => setRolAEliminar(null)}
                    eliminando={eliminando}
                    tipo = "rol"
                />
            )}

            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 flex gap-2"><UserKey/> Gestión de Roles</h2>
                    <p className="text-gray-400 text-sm mt-1">Configuración de roles.</p>
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
                        texto="Ingresar Rol"
                        icono={<Plus/>}
                        onClick={() => navigate('/admin/roles/nuevo')}
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
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nivel</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>

                        {loading && <FilasSkeleton />}

                        {!loading && roles.length === 0 && !error && (
                            <tr>
                                <td colSpan={4} className="px-4 py-16 text-center text-gray-300 text-sm">
                                    No hay roles registrados.
                                </td>
                            </tr>
                        )}

                        {filtrados.map(r => (
                            <tr key={r.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">

                                <td className="px-4 py-3 text-gray-800">
                                    {r.nombre}
                                </td>

                                <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                                    {r.tipo}
                                </td>

                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        Number(r.nivel) === 1 ? 'bg-red-100 text-red-700' :
                                        Number(r.nivel) === 2 ? 'bg-orange-100 text-orange-700' :
                                        Number(r.nivel) === 3 ? 'bg-yellow-100 text-yellow-700' :
                                        Number(r.nivel) === 4 ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        Nivel {r.nivel}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => navigate(`/admin/roles/editar/${r.id}`)}
                                            className="flex items-center gap-1.5 text-sm text-blue-900 hover:underline font-medium"
                                        >
                                            <Pencil size={14}/> Editar
                                        </button>
                                        <span className="text-gray-200">|</span>
                                        <button
                                            onClick={() => setRolAEliminar(r)}
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

                {!loading && roles.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                        {busqueda ? filtrados.length : roles.length} rol{filtrados.length !== 1 ? 'es' : ''} registrado{filtrados.length !== 1 ? 'e' : ''}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Roles;
