import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getVuelo } from '../../services/vuelos'
import { actualizarReserva } from '../../services/reservas'
import { Plane, Search, Users, Pencil, ArrowDownToLine } from 'lucide-react'
import { Breadcrumb } from '../../components/ui/Breadcrumb'
import { formatearFecha, formatearRut } from '../../utils/helpers'

// ─── helpers ────────────────────────────────────────────────────────────────

function generarColumnas(nColumnas) {
    const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return Array.from({ length: nColumnas }, (_, i) => LETRAS[i])
}

const ESTADO_BADGE = {
    confirmada: 'bg-green-100 text-green-700',
    pendiente:  'bg-yellow-100 text-yellow-700',
    cancelada:  'bg-red-100   text-red-500',
    embarcando: 'bg-blue-100  text-blue-700',
}

// ─── SectionTitle (mismo estilo que NuevaReserva) ────────────────────────────

const SectionTitle = ({ texto, extra }) => (
    <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">{texto}</h3>
        {extra}
    </div>
)

// ─── Mapa de cabina ──────────────────────────────────────────────────────────

function PreviewCabina({ filas, columnas, pasillo_despues_de, filas_emergencia,
                         reservasPorAsiento, asientoResaltado, onClickAsiento }) {

    const cols       = generarColumnas(columnas)
    const emergencia = filas_emergencia
        ? filas_emergencia.split(',').map(f => parseInt(f.trim())).filter(n => !isNaN(n))
        : []
    const nFilas     = parseInt(filas) || 0
    const pasilloIdx = pasillo_despues_de ? cols.indexOf(pasillo_despues_de) : -1
    const colsIzq    = pasilloIdx >= 0 ? cols.slice(0, pasilloIdx + 1) : cols
    const colsDer    = pasilloIdx >= 0 ? cols.slice(pasilloIdx + 1)    : []

    function Asiento({ rowNum, col }) {
        const id        = `${rowNum}${col}`
        const reserva   = reservasPorAsiento[id]
        const estado    = reserva?.estado
        const resaltado = asientoResaltado === id
        const esEmergencia = emergencia.includes(rowNum)

        let clases = 'w-6 h-6 flex-shrink-0 rounded-md border transition-all duration-150 '
        if (resaltado) {
            clases += 'bg-amber-400 border-amber-500 ring-2 ring-amber-300 scale-110 z-10'
        } else if (estado === 'cancelada') {
            clases += 'bg-red-100 border-red-200'
        } else if (estado) {
            clases += 'bg-blue-500 border-blue-600'
        } else {
            clases += `bg-white ${esEmergencia ? 'border-orange-200 bg-orange-50' : 'border-gray-200 hover:border-blue-300 hover:scale-105'}`
        }

        return (
            <button
                onClick={() => reserva && onClickAsiento(asientoResaltado === id ? null : id)}
                className={clases}
            />
        )
    }

    return (
        <div className="bg-blue-50 rounded-2xl p-4 select-none inline-block">
            {/* Cabecera letras */}
            <div className="flex items-center gap-1 mb-2">
                {colsIzq.map(col => (
                    <div key={col} className="w-6 text-center text-xs font-semibold text-blue-300">{col}</div>
                ))}
                <div className="w-6 flex-shrink-0" />
                {colsDer.map(col => (
                    <div key={col} className="w-6 text-center text-xs font-semibold text-blue-300">{col}</div>
                ))}
            </div>
            {/* Filas */}
            <div className="overflow-y-auto max-h-[520px] pr-1">
                {Array.from({ length: nFilas }, (_, i) => {
                    const rowNum = i + 1
                    return (
                        <div key={rowNum} className="flex items-center gap-1 mb-1">
                            {colsIzq.map(col => <Asiento key={col} rowNum={rowNum} col={col} />)}
                            <div className="w-6 flex-shrink-0 text-center text-xs text-blue-300 font-mono">{rowNum}</div>
                            {colsDer.map(col => <Asiento key={col} rowNum={rowNum} col={col} />)}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Página principal ────────────────────────────────────────────────────────

function DetalleVuelo() {
    const { id }   = useParams()
    const [vuelo,   setVuelo]   = useState(null)
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [asientoResaltado, setAsientoResaltado] = useState(null)
    const [filaEditar, setFilaEditar] = useState(null)
    const [form, setForm] = useState({
        id: '',
        id_usuario:   '',
        id_vuelo:     '',
        asiento:      '',
        solicitudEspecial: '',
        fechaReserva: '',
        estado:       '',
    })

    useEffect(() => {
        async function cargar() {
            try {
                const data = await getVuelo(id)
                setVuelo(data)
                console.log(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [id])

    function editarFila(r){
        setFilaEditar(r.id)
        setForm({
            id:               r.id,
            id_usuario:       r.usuario.id,
            id_vuelo:         r.id_vuelo,
            asiento:          r.asiento,  // ← valor inicial correcto
            solicitudEspecial: r.solicitudEspecial,
            fechaReserva:     r.fechaReserva,
            estado:           r.estado,
        })
    }

    async function handleSubmit() {
        setError('')
        try {
            await actualizarReserva({ ...form })
            // Recargar datos del vuelo
            const data = await getVuelo(id)
            setVuelo(data) 
        } catch (err) {
            setError(err.message)
        } finally {
            setFilaEditar(null)
            setForm({
                id: '',
                id_usuario:   '',
                id_vuelo:     '',
                asiento:      '',
                solicitudEspecial: '',
                fechaReserva: '',
                estado:       '',
            })
        }
    }

    if (loading) return (
        <div className="p-8 flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-900 rounded-full animate-spin" />
            Cargando información del vuelo...
        </div>
    )
    if (error) return (
        <div className="p-8">
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
        </div>
    )
    if (!vuelo) return null

    const asientos = vuelo.asientos
    const reservas = vuelo.reservas ?? []

    // Mapa asiento → { nombre, estado } para tooltip y colores
    const reservasPorAsiento = {}
    reservas.forEach(r => {
        if (r.asiento) {
            reservasPorAsiento[r.asiento] = {
                nombre: r.usuario?.nombre ?? 'Sin nombre',
                estado: r.estado,
            }
        }
    })

    // Filtrado por búsqueda
    const reservasFiltradas = reservas.filter(r => {
        if (!busqueda) return true
        const q = busqueda.toLowerCase()
        return (
            r.usuario?.nombre?.toLowerCase().includes(q) ||
            r.usuario?.rut?.toLowerCase().includes(q)    ||
            r.asiento?.toLowerCase().includes(q) ||
            r.cargo?.toLowerCase().includes(q)
        )
    })

    const confirmadas = reservas.filter(r => r.estado !== 'cancelada').length
    const canceladas  = reservas.filter(r => r.estado === 'cancelada').length

    return (
        <div className="p-8">

            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                        <Plane size={22} />
                        Vuelo {vuelo.num_vuelo}
                        <span className="text-xs font-semibold text-gray-400 self-end mb-0.5">
                            {formatearFecha(vuelo.fecha_vuelo)}
                        </span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-0.5">
                        {vuelo.rutaOrigen?.ciudad} → {vuelo.rutaDestino?.ciudad}
                        &nbsp;·&nbsp; {vuelo.hora_salida}
                    </p>
                </div>
                <Breadcrumb items={[
                    { texto: 'Vuelos', href: '/admin/vuelos' },
                    { texto: 'Vuelo ' + vuelo.num_vuelo },
                ]} />
            </div>

            {/* Cuerpo */}
            <div className="grid grid-cols-3 gap-6 items-start">

                {/* ── Listado de pasajeros ── */}
                <div className="col-span-2">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <SectionTitle
                            texto={
                                <span className="flex items-center gap-2">
                                    <Users size={15} className="text-blue-900" />
                                    Pasajeros
                                </span>
                            }
                            extra={
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                                        {confirmadas} activas
                                    </span>
                                    {canceladas > 0 && (
                                        <span className="text-xs bg-red-100 text-red-500 font-semibold px-2 py-0.5 rounded-full">
                                            {canceladas} canceladas
                                        </span>
                                    )}
                                    {/* Buscador */}
                                    <div className="relative w-48">
                                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            value={busqueda}
                                            onChange={e => setBusqueda(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg
                                                       focus:outline-none focus:ring-1 focus:ring-blue-300"
                                        />
                                    </div>
                                </div>
                            }
                        />

                        {/* Tabla */}
                        <div className="overflow-y-auto max-h-[560px]">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Rut</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Pasajero</th>
                                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cargo</th>
                                        <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Asiento</th>
                                        <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {reservasFiltradas.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-12 text-gray-300 text-sm">
                                                Sin pasajeros
                                            </td>
                                        </tr>
                                    )}
                                    {reservasFiltradas.map(r => {
                                        const activo = asientoResaltado === r.asiento
                                        return (
                                            <tr
                                                key={r.id}
                                                onClick={() => 
                                                    setAsientoResaltado(activo ? null : r.asiento) &&
                                                    setAsiento(r.asiento)
                                                }
                                                className={`cursor-pointer transition-colors
                                                    ${activo
                                                        ? 'bg-amber-50 border-l-[3px] border-l-amber-400'
                                                        : 'hover:bg-blue-50 border-l-[3px] border-l-transparent'
                                                    }
                                                    ${r.estado === 'cancelada' ? 'opacity-50' : ''}
                                                `}
                                            >
                                                <td className="px-3 py-3 text-gray-500 font-mono text-xs">{formatearRut(r.usuario?.rut) ?? '—'}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center
                                                                         text-xs font-bold shrink-0
                                                                         ${activo ? 'bg-amber-400 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                                            {r.usuario?.nombre?.[0]?.toUpperCase() ?? '?'}
                                                        </div>
                                                        {r.usuario?.nombre ?? '—'}
                                                    </div>
                                                </td>

                                                <td className="px-3 py-3 text-gray-500 text-xs">{r.usuario.cargo ?? '—'}</td>
                                                
                                                <td className="px-3 py-3 text-center">
                                                    {filaEditar !== r.id ? (
                                                        <span className={`font-bold font-mono text-sm ${activo ? 'text-amber-600' : 'text-blue-900'}`}>
                                                            {r.asiento ?? '—'}
                                                        </span>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={filaEditar === r.id ? form.asiento : r.asiento}
                                                            onClick={e => e.stopPropagation()}
                                                            onChange={e => setForm(prev => ({ ...prev, asiento: e.target.value.toUpperCase() }))}
                                                            className="w-20 px-2 py-0.5 text-sm border border-gray-200 rounded-lg
                                                            focus:outline-none focus:border-blue-300 appearance-none"
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                                                        ${ESTADO_BADGE[r.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                                                        {r.estado}
                                                    </span>
                                                </td>
                                                {filaEditar !== r.id ? (
                                                    <td className="px-3 py-3 text-center">
                                                        <button
                                                            onClick={() => editarFila(r)}
                                                            className="flex items-center gap-1.5 text-sm text-blue-900 hover:underline font-medium cursor-pointer"
                                                        >
                                                            <Pencil size={14} /> Editar
                                                        </button>
                                                    </td>
                                                ) : (
                                                    <td className="px-3 py-3 text-center">
                                                        <button
                                                            onClick={() => handleSubmit()}
                                                            className="flex items-center gap-1.5 text-sm text-blue-900 hover:underline font-medium cursor-pointer"
                                                        >
                                                            <ArrowDownToLine size={14} /> Guardar
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── Mapa de cabina ── */}
                <div className="col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <SectionTitle
                            texto="Mapa de cabina"
                            extra={
                                <span className="text-xs text-gray-400">
                                    <span className="font-mono font-semibold text-blue-900">{asientos?.ocupados ?? 0}</span>
                                    <span className="text-gray-300"> / {vuelo?.cupo ?? 0} ocupados</span>
                                </span>
                            }
                        />

                        {/* Mapa + Leyenda lado a lado */}
                        <div className="flex items-start gap-5 justify-center">
                            {asientos && (
                                <PreviewCabina
                                    filas={asientos.filas}
                                    columnas={asientos.columnas}
                                    pasillo_despues_de={asientos.pasillo_despues_de}
                                    filas_emergencia={asientos.emergencia}
                                    reservasPorAsiento={reservasPorAsiento}
                                    asientoResaltado={asientoResaltado}
                                    onClickAsiento={setAsientoResaltado}
                                />
                            )}

                            {/* Leyenda + panel hover */}
                            <div className="flex flex-col gap-2 pt-10 shrink-0">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Leyenda</p>
                                {[
                                    { color: 'bg-amber-400  border-amber-500',  label: 'Seleccionado' },
                                    { color: 'bg-blue-500   border-blue-600',   label: 'Ocupado'      },
                                    { color: 'bg-red-100    border-red-200',    label: 'Cancelado'    },
                                    { color: 'bg-orange-50  border-orange-200', label: 'Emergencia'   },
                                    { color: 'bg-white      border-gray-200',   label: 'Libre'        },
                                ].map(({ color, label }) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-md border flex-shrink-0 ${color}`} />
                                        <p className="text-xs text-gray-500">{label}</p>
                                    </div>
                                ))}

                                {/* Asiento seleccionado */}
                                {asientoResaltado && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                        <p className="text-xs text-gray-400 mb-0.5">Asiento seleccionado</p>
                                        <p className="text-2xl font-bold text-amber-500 font-mono">{asientoResaltado}</p>
                                        <p className="text-xs font-medium text-gray-600 mt-0.5">
                                            {reservasPorAsiento[asientoResaltado]?.nombre}
                                        </p>
                                        <p className="text-xs font-medium text-gray-600 mt-0.5">
                                            {reservasPorAsiento[asientoResaltado]?.cargo}
                                        </p>
                                        <button
                                            onClick={() => setAsientoResaltado(null)}
                                            className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
                                        >
                                            Limpiar selección
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        
                    </div>
                </div>

            </div>
        </div>
    )
}

export default DetalleVuelo
