import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsuario } from '../../services/auth'
import { listarReservasUsuario } from '../../services/reservas'
import { BotonPrimario } from '../../components/ui/Button'
import { Plus, TicketsPlane, Armchair, Pencil, Download, Ellipsis } from 'lucide-react'
import { Breadcrumb } from '../../components/ui/Breadcrumb'
import FilasSkeleton from '../../components/TableSkeleton'

const BADGE_RESERVA = {
    reservado:  'bg-blue-50  text-blue-700  border border-blue-200',
    confirmada: 'bg-green-50 text-green-700 border border-green-200',
    cancelada:  'bg-red-50   text-red-600   border border-red-200',
}
const LABEL_RESERVA = {
    reservado:  'Reservado',
    confirmada: 'Confirmada',
    cancelada:  'Cancelada',
}
function BadgeReserva({ estado }) {
    const clase = BADGE_RESERVA[estado] ?? 'bg-gray-100 text-gray-500 border border-gray-200'
    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${clase}`}>
            {LABEL_RESERVA[estado] ?? estado}
        </span>
    )
}



function MisReservas() {
    const usuario  = getUsuario()
    const navigate = useNavigate()

    const [reservas, setReservas] = useState([])
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState('')
    const [busqueda, setBusqueda] = useState('')

    const filtrados = reservas.filter(r =>
        r.vuelo?.num_vuelo?.toLowerCase().includes(busqueda.toLowerCase())         ||
        r.vuelo?.ruta_origen?.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.vuelo?.ruta_destino?.codigo?.toLowerCase().includes(busqueda.toLowerCase())
    )

    useEffect(() => { 
        cargar() }, 
        []
    )

    async function cargar() {
        setLoading(true)
        setError('')
        try {
            const data = await listarReservasUsuario(usuario.id)
            setReservas(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8">

            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 flex gap-2">
                        <TicketsPlane /> Mis Reservas
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Historial y estado de tus reservas activas.</p>
                </div>
                <Breadcrumb items={[{ texto: 'Inicio', href: '/inicio' }, { texto: 'Mis Reservas' }]} />
            </div>

            {/* Barra de acciones */}
            <div className="flex items-center justify-between mb-4">
                <BotonPrimario
                    texto="Nueva Reserva"
                    icono={<Plus size={16} />}
                    onClick={() => navigate('/inicio')}
                />
                <input
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    type="text"
                    placeholder="Buscar"
                    className="w-64 p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-900"
                />
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">

                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-100 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-left">
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">#</th>
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">N° Vuelo</th>
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Fecha vuelo</th>
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Ruta</th>
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Asiento</th>
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Fecha reserva</th>
                            <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Estado</th>
                            <th className="px-5 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>

                        {loading && <FilasSkeleton rows={4} cols={8} />}

                        {/* Sin reservas */}
                        {!loading && reservas.length === 0 && !error && (
                            <tr>
                                <td colSpan={8} className="px-5 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-gray-300">
                                        <TicketsPlane size={40} />
                                        <p className="text-sm font-medium">No tienes reservas activas.</p>
                                        <p className="text-xs">Haz clic en "Nueva Reserva" para comenzar.</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Sin resultados de búsqueda */}
                        {!loading && filtrados.length === 0 && reservas.length > 0 && (
                            <tr>
                                <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">
                                    Sin resultados para <span className="font-semibold text-gray-600">"{busqueda}"</span>.
                                </td>
                            </tr>
                        )}

                        {filtrados.map(r => (
                            <tr key={r.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">

                                {/* id reserva */}
                                <td className="px-5 py-4">
                                    {r.id}
                                </td>

                                {/* N° Vuelo */}
                                <td className="px-5 py-4">
                                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg">
                                        {r.vuelo?.num_vuelo}
                                    </span>
                                </td>

                                {/* Fecha vuelo */}
                                <td className="px-5 py-4">
                                    <p className="font-medium text-gray-700">
                                        {new Date(r.vuelo?.fecha_vuelo + 'T00:00:00').toLocaleDateString('es-CL', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                                        {r.vuelo?.hora_salida} → {r.vuelo?.hora_llegada} hrs
                                    </p>
                                </td>

                                {/* Ruta */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-mono font-bold text-gray-800">{r.vuelo?.ruta_origen?.codigo}</span>
                                        <span className="text-xs text-gray-400">{r.vuelo?.ruta_origen?.ciudad}</span>
                                        <span className="text-gray-300 mx-0.5">→</span>
                                        <span className="font-mono font-bold text-gray-800">{r.vuelo?.ruta_destino?.codigo}</span>
                                        <span className="text-xs text-gray-400">{r.vuelo?.ruta_destino?.ciudad}</span>
                                    </div>
                                </td>

                                {/* Asiento */}
                                <td className="px-5 py-4">
                                    <span className="inline-flex items-center gap-1.5 font-mono font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg text-xs">
                                        <Armchair size={12} className="text-gray-400" />
                                        {r.asiento}
                                    </span>
                                </td>

                                {/* Fecha reserva */}
                                <td className="px-5 py-4 text-gray-500">
                                    {r.fechaReserva
                                        ? new Date(r.fechaReserva + 'T00:00:00').toLocaleDateString('es-CL', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                          })
                                        : '—'}
                                </td>

                                {/* Estado */}
                                <td className="px-5 py-4">
                                    <BadgeReserva estado={r.estado} />
                                </td>
                                {/*acciones*/}
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => navigate(`/reservas/detalle/${r.id}`)}
                                            className="flex items-center gap-1.5 text-sm text-blue-900 hover:underline font-medium"
                                        >
                                            <Ellipsis size={14}/> Gestionar
                                        </button>
                                        <span className="text-gray-200">|</span>
                                        <button
                                            onClick={() => setUsuarioAEliminar(u)}
                                            className="flex items-center gap-1.5 text-sm text-green-600 hover:underline font-medium"
                                        >
                                            <Download size={14}/> Descargar
                                        </button>
                                    </div>
                                </td>

                            </tr>
                        ))}

                    </tbody>
                </table>

                {!loading && reservas.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
                        {filtrados.length} reserva{filtrados.length !== 1 ? 's' : ''} encontrada{filtrados.length !== 1 ? 's' : ''}
                        {busqueda && ` · filtrando de ${reservas.length} en total`}
                    </div>
                )}

            </div>
        </div>
    )
}

export default MisReservas
