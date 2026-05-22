import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarUsuarios, eliminarUsuario } from '../../../services/usuarios'
import { BotonPrimario, BotonSecundario, BotonDanger, BotonDropdown } from '../../../components/ui/Button'
import { Pencil, Plus, Trash, UserCog, Upload, Download, File } from 'lucide-react'
import ModalEliminar from '../../../components/ModalEliminar'
import { formatearFechaHora, formatearRut, mayusculas } from '../../../utils/helpers'
import { Breadcrumb } from '../../../components/ui/Breadcrumb'

function BadgeEstado({ activa }) {
    return activa
        ? <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">Activo</span>
        : <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">Inactivo</span>
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


function Usuarios() {
    const navigate = useNavigate()
    const [usuarios, setUsuarios]               = useState([])
    const [loading, setLoading]           = useState(true)
    const [error, setError]               = useState('')
    const [usuarioAEliminar, setUsuarioAEliminar] = useState(null)   
    const [eliminando, setEliminando]     = useState(false)
    const [busqueda, setBusqueda] = useState('')

    const filtrados = usuarios.filter(u => 
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        u.primer_apellido.toLowerCase().includes(busqueda.toLowerCase()) || 
        u.segundo_apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.rut.toLowerCase().includes(busqueda.toLowerCase()) || 
        u.rol.toLowerCase().includes(busqueda.toLowerCase())
    )

    useEffect(() => {
        cargar()
        
    }, [])

    async function cargar() {
        setLoading(true)
        setError('')
        try {
            const data = await listarUsuarios()
            setUsuarios(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function confirmarEliminar() {
        setEliminando(true)
        try {
            await eliminarUsuario(usuarioAEliminar.id)
            setUsuarioAEliminar(null)
            // Quitar el usuario eliminado de la lista sin recargar
            setUsuarios(prev => prev.filter(r => r.id !== usuarioAEliminar.id))
        } catch (err) {
            setError(err.message)
            setUsuarioAEliminar(null)
        } finally {
            setEliminando(false)
        }
    }

    return (
        <div className="p-8">

            {/* Modal de confirmacion */}
            {usuarioAEliminar && (
                <ModalEliminar
                    data={usuarioAEliminar}
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => setUsuarioAEliminar(null)}
                    eliminando={eliminando}
                    tipo = "usuario"
                />
            )}

            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 flex gap-2"><UserCog/> Gestión de Usuarios</h2>
                    <p className="text-gray-400 text-sm mt-1">Configuración de usuarios.</p>
                </div>
                <Breadcrumb items={[{ texto: 'Administración', href: '/admin' }, { texto: 'Usuarios' }]} />
            </div>

            <div className="flex items-end justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BotonPrimario
                        texto="Ingresar Usuario"
                        icono={<Plus/>}
                        onClick={() => navigate('/admin/usuarios/nuevo')}
                    />
                    <BotonSecundario
                        texto="Descargar"
                        icono={<Download/>}
                        onClick={() => navigate('/admin/usuarios/nuevo')}
                    />
                    <BotonDropdown
                        texto="Carga Masiva"
                        icono={<Upload/>}
                        opciones={[
                            { texto: 'Descargar plantilla', },
                            { texto: 'Subir plantilla', esArchivo: true, accept: '.csv'},
                        ]}
                    />
                </div>
                <div>
                    <input
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        type="text"
                        placeholder= "Buscar"
                        className="w-100 p-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-900"
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
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rut</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cargo</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Correo</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rol</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Asiento asignado</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ubicación</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>

                        {loading && <FilasSkeleton />}

                        {!loading && usuarios.length === 0 && !error && (
                            <tr>
                                <td colSpan={7} className="px-4 py-16 text-center text-gray-300 text-sm">
                                    No hay usuarios registrados.
                                </td>
                            </tr>
                        )}

                        {filtrados.map(u => (
                            <tr key={u.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">

                                <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                                    {formatearRut(u.rut)}
                                </td>

                                <td className="px-4 py-3">
                                    {[u.nombre, u.primer_apellido, u.segundo_apellido].filter(Boolean).join(' ')}
                                </td>

                                <td className="px-4 py-3 flex flex-col gap-1">
                                    {u.cargo}<span className="text-xs text-gray-400">{u.empresa}</span>
                                </td>

                                <td className="px-4 py-3">
                                    {u.email}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                                        {mayusculas(u.rol.nombre)}
                                    </span>
                                </td>

                                <td className="px-4 py-3 font-bold">
                                    {u.asiento ? u.asiento : '—'}
                                </td>
                                <td className="px-4 py-3">
                                    {u.ubicacion ? (mayusculas(u.ubicacion)) : '—'}
                                </td>
                                 <td className="px-4 py-3">
                                    <BadgeEstado activa={u.activo} />
                                </td>

                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => navigate(`/admin/usuarios/editar/${u.id}`)}
                                            className="flex items-center gap-1.5 text-sm text-blue-900 hover:underline font-medium"
                                        >
                                            <Pencil size={14}/> Editar
                                        </button>
                                        <span className="text-gray-200">|</span>
                                        <button
                                            onClick={() => setUsuarioAEliminar(u)}
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

                {!loading && usuarios.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                        {busqueda ? filtrados.length : usuarios.length} usuario{filtrados.length !== 1 ? 's' : ''} registrado{filtrados.length !== 1 ? 's' : ''}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Usuarios
