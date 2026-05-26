import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarVuelos } from '../../services/vuelos'
import { BotonDropdownPrimario } from '../../components/ui/Button'
import { Pencil, Plus, Trash, Eye, Plane, Users } from 'lucide-react'
import { Breadcrumb } from '../../components/ui/Breadcrumb'
import FilasSkeleton from '../../components/TableSkeleton'
import { formatearFecha } from '../../utils/helpers'

// ─── helpers ─────────────────────────────────────────────────────────────────

const hoy = new Date().toISOString().split('T')[0]

const ESTADO_ESTILOS = {
    programado: 'bg-blue-50   text-blue-700   border border-blue-200',
    embarcando: 'bg-green-50  text-green-700  border border-green-200',
    en_vuelo:   'bg-indigo-50 text-indigo-700 border border-indigo-200',
    aterrizado: 'bg-gray-100  text-gray-600   border border-gray-200',
    demorado:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
    cancelado:  'bg-red-50    text-red-600    border border-red-200',
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

function Asientos({ asientos }) {
    if (!asientos) return <span className="text-xs text-gray-300 font-mono">—</span>
    const { disponibles , cupo } = asientos
    const libres = cupo - disponibles
    const pct   = cupo > 0 ? (libres / cupo) * 100 : 0
    const color = pct < 60 ? 'text-green-600' : pct < 25 ? 'text-amber-500' : 'text-red-500'
    return (
        <div className={`flex items-center gap-1.5 ${color}`}>
            <Users size={13} className="shrink-0" />
            <span className="text-sm font-bold font-mono">{libres}/{cupo} reservados</span>
        </div>
    )
}

const selectClass = `w-full py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white
                     text-gray-700 focus:outline-none focus:border-blue-300 appearance-none`

// ─── Componente principal ─────────────────────────────────────────────────────

function Vuelos() {
    const navigate = useNavigate()
    const [vuelos,  setVuelos]  = useState([])
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState('')
    const [busqueda, setBusqueda] = useState('')

    const [filtroFecha,   setFiltroFecha]   = useState(hoy)
    const [filtroOrigen,  setFiltroOrigen]  = useState('')
    const [filtroDestino, setFiltroDestino] = useState('')
    const [filtroEstado,  setFiltroEstado]  = useState('programado')

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

    // Opciones únicas para los selects
    const origenes = useMemo(() => {
        const mapa = new Map()
        vuelos.forEach(v => { if (v.ruta_origen?.id) mapa.set(v.ruta_origen.id, v.ruta_origen) })
        return [...mapa.values()].sort((a, b) => a.codigo.localeCompare(b.codigo))
    }, [vuelos])

    const destinos = useMemo(() => {
        const mapa = new Map()
        vuelos.forEach(v => { if (v.ruta_destino?.id) mapa.set(v.ruta_destino.id, v.ruta_destino) })
        return [...mapa.values()].sort((a, b) => a.codigo.localeCompare(b.codigo))
    }, [vuelos])

    const filtrados = vuelos.filter(v => {
        const q = busqueda.toLowerCase()
        const ok_busqueda = !busqueda ||
            v.num_vuelo?.toLowerCase().includes(q)           ||
            v.aeronave?.matricula?.toLowerCase().includes(q) ||
            v.ruta_origen?.codigo?.toLowerCase().includes(q) ||
            v.ruta_destino?.codigo?.toLowerCase().includes(q)
        const ok_fecha   = !filtroFecha   || v.fecha_vuelo === filtroFecha
        const ok_origen  = !filtroOrigen  || String(v.ruta_origen?.id)  === filtroOrigen
        const ok_destino = !filtroDestino || String(v.ruta_destino?.id) === filtroDestino
        const ok_estado  = !filtroEstado  || v.estado === filtroEstado
        return ok_busqueda && ok_fecha && ok_origen && ok_destino && ok_estado
    })

    const hayFiltros = filtroFecha !== hoy || filtroOrigen || filtroDestino || filtroEstado !== 'programado'

    function limpiarFiltros() {
        setFiltroFecha(hoy)
        setFiltroOrigen('')
        setFiltroDestino('')
        setFiltroEstado('programado')
    }

    const ChevronDown = () => (
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        </div>
    )

    return (
        <div className="p-8">

            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                        <Plane size={22} /> Gestión de Vuelos
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Vuelos programados y su estado operacional.</p>
                </div>
                <Breadcrumb items={[{ texto: 'Administración', href: '/admin' }, { texto: 'Vuelos' }]} />
            </div>

            {/* ── Barra de acciones (igual que Usuarios) ── */}
            <div className="flex items-end justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BotonDropdownPrimario
                        texto="Ingresar Vuelo"
                        icono={<Plus size={15} />}
                        opciones={[
                            { texto: 'Vuelo Único', onClick: () => navigate('/admin/vuelos/nuevo')        },
                            { texto: 'Carga Masiva',     onClick: () => navigate('/admin/vuelos/carga-masiva') },
                        ]}
                    />
                </div>
                <div>
                    <input
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        type="text"
                        placeholder="Buscar"
                        className="w-56 p-2 bg-white border border-gray-200 rounded-lg text-sm
                                   focus:outline-none focus:border-blue-900"
                    />
                </div>
            </div>

            {/* ── Filtros ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 mb-4">
                <div className="flex items-end gap-4 flex-wrap">

                    {/* Fecha */}
                    <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Fecha</label>
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={filtroFecha === ''}
                                    onChange={e => setFiltroFecha(e.target.checked ? '' : hoy)}
                                    className="w-3.5 h-3.5 accent-blue-900 cursor-pointer"
                                />
                                <span className="text-xs text-gray-400">Todos</span>
                            </label>
                        </div>
                        <input
                            type="date"
                            value={filtroFecha}
                            disabled={filtroFecha === ''}
                            onChange={e => setFiltroFecha(e.target.value)}
                            className={`${selectClass} ${filtroFecha === '' ? 'opacity-40 cursor-not-allowed' : ''}`}
                        />
                    </div>

                    {/* Origen */}
                    <div className="flex flex-col gap-1.5 min-w-[170px]">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Origen</label>
                        <div className="relative">
                            <select value={filtroOrigen} onChange={e => setFiltroOrigen(e.target.value)} className={selectClass}>
                                <option value="">Todos</option>
                                {origenes.map(r => (
                                    <option key={r.id} value={r.id}>{r.codigo} – {r.ciudad}</option>
                                ))}
                            </select>
                            <ChevronDown />
                        </div>
                    </div>

                    {/* Destino */}
                    <div className="flex flex-col gap-1.5 min-w-[170px]">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Destino</label>
                        <div className="relative">
                            <select value={filtroDestino} onChange={e => setFiltroDestino(e.target.value)} className={selectClass}>
                                <option value="">Todos</option>
                                {destinos.map(r => (
                                    <option key={r.id} value={r.id}>{r.codigo} – {r.ciudad}</option>
                                ))}
                            </select>
                            <ChevronDown />
                        </div>
                    </div>

                    {/* Estado */}
                    <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</label>
                        <div className="relative">
                            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className={selectClass}>
                                <option value="">Todos</option>
                                {Object.entries(ESTADO_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            <ChevronDown />
                        </div>
                    </div>

                    {/* Limpiar */}
                    {hayFiltros && (
                        <button
                            onClick={limpiarFiltros}
                            className="self-end py-2 px-3 text-xs text-gray-500 hover:text-gray-700
                                       border border-gray-200 rounded-lg bg-white hover:bg-gray-50
                                       transition-colors whitespace-nowrap"
                        >
                            Limpiar filtros
                        </button>
                    )}

                </div>
            </div>

            {/* ── Tabla ── */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">

                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-100 text-red-700 text-sm">{error}</div>
                )}

                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-left">
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vuelo</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ruta</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aeronave</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pasajeros</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>

                        {loading && <FilasSkeleton rows={5} cols={6} />}

                        {!loading && filtrados.length === 0 && !error && (
                            <tr>
                                <td colSpan={6} className="px-4 py-16 text-center text-sm">
                                    <p className="text-gray-300 mb-2">Sin vuelos para los filtros seleccionados.</p>
                                    {hayFiltros && (
                                        <button onClick={limpiarFiltros} className="text-blue-600 text-xs hover:underline">
                                            Limpiar filtros
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )}

                        {filtrados.map(v => (
                            <tr key={v.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">

                                {/* Vuelo */}
                                <td className="px-4 py-3">
                                    <span className="font-mono font-bold text-sm text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg">
                                        {v.num_vuelo}
                                    </span>
                                </td>

                                {/* Fecha */}
                                <td className="px-4 py-3">
                                    <p className="text-sm text-gray-400 mt-1 font-mono">{formatearFecha(v.fecha_vuelo)}</p>
                                </td>

                                {/* Ruta + horario */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-gray-800">{v.ruta_origen?.codigo}</span>
                                        <span className="text-gray-300 text-xs">→</span>
                                        <span className="font-mono font-bold text-gray-800">{v.ruta_destino?.codigo}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                                        {v.hora_salida}
                                        {v.hora_llegada && <> – {v.hora_llegada}</>}
                                    </p>
                                </td>

                                {/* Aeronave */}
                                <td className="px-4 py-3">
                                    <span className="font-mono text-sm font-semibold text-gray-700">{v.aeronave?.matricula}</span>
                                    <p className="text-xs text-gray-400 mt-0.5">{v.aeronave?.tipo}</p>
                                </td>

                                {/* Asientos */}
                                <td className="px-4 py-3">
                                    <Asientos asientos={v.asientos} />
                                </td>

                                {/* Estado */}
                                <td className="px-4 py-3">
                                    <BadgeEstado estado={v.estado} />
                                </td>

                                {/* Acciones */}
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => navigate(`/admin/vuelos/detalle/${v.id}`)}
                                            className="flex items-center gap-1.5 text-sm text-green-800 hover:underline font-medium cursor-pointer"
                                        >
                                            <Eye size={14} /> Ver
                                        </button>
                                        <span className="text-gray-200">|</span>
                                        <button
                                            onClick={() => navigate(`/admin/vuelos/editar/${v.id}`)}
                                            className="flex items-center gap-1.5 text-sm text-blue-900 hover:underline font-medium cursor-pointer"
                                        >
                                            <Pencil size={14} /> Editar
                                        </button>
                                        <span className="text-gray-200">|</span>
                                        <button
                                            onClick={() => {/* eliminar */}}
                                            className="flex items-center gap-1.5 text-sm text-red-600 hover:underline font-medium cursor-pointer"
                                        >
                                            <Trash size={14} /> Eliminar
                                        </button>
                                    </div>
                                </td>

                            </tr>
                        ))}

                    </tbody>
                </table>

                {!loading && vuelos.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                        {filtrados.length} vuelo{filtrados.length !== 1 ? 's' : ''}
                        {filtrados.length !== vuelos.length && ` de ${vuelos.length} totales`}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Vuelos
