import { getUsuario } from '../../services/auth'
import { BotonPrimario, BotonSecundario } from '../../components/ui/Button'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getVuelo, asientosDisponibles } from '../../services/vuelos'
import { crearReserva } from '../../services/reservas'
import { ArrowRight, Clock, CalendarDays, Armchair, Check, Plane } from 'lucide-react'
import BadgeEstado from '../../components/ui/BadgeEstado'


function generarColumnas(nColumnas) {
    const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return Array.from({ length: nColumnas }, (_, i) => LETRAS[i])
}

function PreviewCabina({ filas, columnas, pasillo_despues_de, filas_emergencia, ocupados, asientoSeleccionado, onSeleccion }) {
    const cols = generarColumnas(columnas)
    const emergencia = filas_emergencia
        ? filas_emergencia.split(',').map(f => parseInt(f.trim())).filter(n => !isNaN(n))
        : []
    const nFilas = parseInt(filas) || 0

    const renderFila = (rowNum) => {
        return cols.flatMap((col, j) => {
            const isEmergencia = emergencia.includes(rowNum)
            const elements = []
            const asiento = rowNum + col
            const ocupado = ocupados.includes(asiento)
            const seleccionado = asientoSeleccionado === asiento

            if (j > 0 && cols[j - 1] === pasillo_despues_de) {
                elements.push(<div key={`aisle-${rowNum}-${j}`} className="w-8 flex-shrink-0" />)
            }
            elements.push(
                <button
                    key={`seat-${rowNum}-${col}`}
                    onClick={() => !ocupado && onSeleccion(asiento)}
                    disabled={ocupado}
                    title={ocupado ? `${asiento} — Ocupado` : `${asiento}`}
                    className={`w-6 h-6 flex-shrink-0 rounded-t-md border transition-all ${
                        ocupado
                            ? 'bg-red-100 border-red-300 cursor-not-allowed opacity-70'
                            : seleccionado
                                ? isEmergencia
                                    ? 'bg-orange-400 border-orange-500 scale-110 shadow-sm'
                                    : 'bg-blue-900 border-blue-900 scale-110 shadow-sm'
                                : isEmergencia
                                    ? 'bg-orange-50 border-orange-300 hover:bg-orange-200 hover:scale-105 cursor-pointer'
                                    : 'bg-green-50 border-green-300 hover:bg-green-200 hover:scale-105 cursor-pointer'
                    }`}
                />
            )
            return elements
        })
    }

    return (
        <div className="select-none">
            {/* Nariz del avión */}
            <div className="flex justify-center mb-2 pl-6">
                <div className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center">
                    <Plane size={14} className="text-white -rotate-90" />
                </div>
            </div>

            {/* Cabecera de columnas */}
            <div className="flex gap-1 mb-1 pl-6">
                {cols.flatMap((col, j) => {
                    const els = []
                    if (j > 0 && cols[j - 1] === pasillo_despues_de) {
                        els.push(<div key={`ah-${j}`} className="w-8" />)
                    }
                    els.push(
                        <div key={`h-${col}`} className="w-6 text-center text-xs font-bold font-mono text-gray-400">
                            {col}
                        </div>
                    )
                    return els
                })}
            </div>

            {/* Filas */}
            <div className="overflow-y-auto overflow-x-hidden max-h-96">
                {Array.from({ length: nFilas }, (_, i) => {
                    const rowNum = i + 1
                    return (
                        <div key={rowNum} className="flex items-center gap-1 mb-0.5">
                            <span className="w-5 text-right mr-0.5 text-xs text-gray-300 font-mono">
                                {rowNum}
                            </span>
                            {renderFila(rowNum)}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


function NuevaReserva() {
    const usuario  = getUsuario()
    const navigate = useNavigate()
    const { id }   = useParams()

    const [vuelo,               setVuelo]               = useState(null)
    const [asientos,            setAsientos]            = useState(null)
    const [cargando,            setCargando]            = useState(true)
    const [loading,             setLoading]             = useState(false)
    const [error,               setError]               = useState(null)
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(null)
    const [form,                setForm]                = useState({
        id_usuario:  usuario?.id,
        id_vuelo:    id,
        asiento:     '',
        fechaReserva: new Date().toISOString().split('T')[0],
        estado:      'reservado',
    })

    function handleSeleccionAsiento(codigo) {
        setAsientoSeleccionado(codigo)
        setForm(prev => ({ ...prev, asiento: codigo }))
    }

    useEffect(() => {
        async function datosVuelo() {
            try {
                const [v, a] = await Promise.all([
                    getVuelo(id),
                    asientosDisponibles(id)
                ])
                setVuelo(v)
                setAsientos(a)
            } catch (err) {
                setError(err.message)
            } finally {
                setCargando(false)
            }
        }
        datosVuelo()
    }, [id])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await crearReserva({ ...form })
            navigate('/inicio')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const emergenciaFilas  = asientos?.emergencia
        ? asientos.emergencia.split(',').map(f => parseInt(f.trim())).filter(n => !isNaN(n))
        : []
    const filaSeleccionada = asientoSeleccionado ? parseInt(asientoSeleccionado) : null
    const esEmergencia     = emergenciaFilas.includes(filaSeleccionada)

    const SectionTitle = ({ texto, extra }) => (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">{texto}</h3>
            {extra}
        </div>
    )

    return (
        <div className="p-8">

            {/* Encabezado */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-900">Nueva Reserva</h2>
                <p className="text-sm text-gray-400 mt-1">Selecciona tu asiento y confirma la reserva.</p>
            </div>

            {/* Cargando */}
            {cargando && (
                <div className="flex items-center justify-center py-24 text-gray-400 text-sm gap-2">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-900 rounded-full animate-spin" />
                    Cargando información del vuelo...
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                    {error}
                </div>
            )}

            {vuelo && asientos && (
                <div className="flex flex-col gap-6">

                    {/* ── Card ticket de vuelo ── */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {/* Franja superior azul */}
                        <div className="bg-blue-900 px-6 py-3 flex items-center justify-between">
                            <span className="font-mono font-bold text-sm text-white/80 tracking-widest">
                                {vuelo.num_vuelo}
                            </span>
                            <BadgeEstado estado={vuelo.estado} />
                        </div>

                        {/* Cuerpo del ticket */}
                        <div className="px-6 py-5 flex items-center gap-4">
                            {/* Origen */}
                            <div className="text-center shrink-0">
                                <p className="text-3xl font-black font-mono text-blue-900 leading-none">
                                    {vuelo.ruta_origen?.codigo}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{vuelo.ruta_origen?.ciudad}</p>
                            </div>

                            {/* Línea de vuelo */}
                            <div className="flex-1 flex flex-col items-center gap-1.5">
                                <div className="flex items-center w-full gap-2">
                                    <div className="h-px flex-1 border-t border-dashed border-gray-300" />
                                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <Plane size={24} className="text-blue-900 -rotate-90" />
                                    </div>
                                    <div className="h-px flex-1 border-t border-dashed border-gray-300" />
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <CalendarDays size={11} className="text-gray-300" />
                                        {new Date(vuelo.fecha_vuelo + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <span className="text-gray-200">·</span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={11} className="text-gray-300" />
                                        <span className="font-mono">{vuelo.hora_salida} hrs</span>
                                    </span>
                                </div>
                            </div>

                            {/* Destino */}
                            <div className="text-center shrink-0">
                                <p className="text-3xl font-black font-mono text-blue-900 leading-none">
                                    {vuelo.ruta_destino?.codigo}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{vuelo.ruta_destino?.ciudad}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Grid: Cabina + Panel lateral ── */}
                    <div className="grid grid-cols-2 gap-6">

                        {/* Mapa de asientos */}
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <SectionTitle
                                texto="Mapa de asientos"
                                extra={
                                    <span className="text-xs text-gray-400">
                                        <span className="font-mono font-semibold text-green-600">{asientos.disponibles}</span>
                                        <span className="text-gray-300"> / {asientos.capacidadAeronave} disponibles</span>
                                    </span>
                                }
                            />

                            <div className="flex items-start gap-5 justify-center">
                                {/* Cabina envuelta en fondo */}
                                <div className="bg-gray-50 rounded-xl px-4 py-4 inline-flex">
                                    <PreviewCabina
                                        filas={asientos.filas}
                                        columnas={asientos.columnas}
                                        pasillo_despues_de={asientos.pasillo_despues_de}
                                        filas_emergencia={asientos.emergencia}
                                        ocupados={asientos.asientosOcupados}
                                        asientoSeleccionado={asientoSeleccionado}
                                        onSeleccion={handleSeleccionAsiento}
                                    />
                                </div>

                                {/* Leyenda vertical */}
                                <div className="flex flex-col gap-2 pt-10 shrink-0">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Leyenda</p>
                                    {[
                                        { color: 'bg-blue-900  border-blue-900',   label: 'Seleccionado' },
                                        { color: 'bg-green-50  border-green-300',  label: 'Disponible'   },
                                        { color: 'bg-orange-50 border-orange-300', label: 'Emergencia'   },
                                        { color: 'bg-red-100   border-red-300',    label: 'Ocupado'      },
                                    ].map(({ color, label }) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-t-sm border flex-shrink-0 ${color}`} />
                                            <p className="text-xs text-gray-500">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Panel lateral: selección o placeholder */}
                        {asientoSeleccionado ? (
                            <div className="flex flex-col gap-4">

                                {/* Card Mi Selección */}
                                <div className="bg-white rounded-xl shadow-sm p-5">
                                    <SectionTitle texto="Mi selección" />

                                    {/* Asiento destacado */}
                                    <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4 mb-4">
                                        <div className="w-14 h-14 bg-blue-900 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                                            <Armchair size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black text-blue-900 font-mono leading-none">
                                                {asientoSeleccionado}
                                            </p>
                                            <p className="text-xs text-blue-800 mt-1">Asiento seleccionado</p>
                                            {esEmergencia && (
                                                <span className="inline-block mt-1.5 text-xs bg-orange-400/20 text-orange-200 border border-orange-300/30 px-2 py-0.5 rounded-full font-semibold">
                                                    Fila de emergencia
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Detalle */}
                                    <div className="text-xs divide-y divide-gray-50 mb-4">
                                        {[
                                            { label: 'Pasajero', value: usuario?.nombre,                            mono: false },
                                            { label: 'Vuelo',    value: vuelo.num_vuelo,                            mono: true  },
                                            { label: 'Ruta',     value: `${vuelo.ruta_origen?.codigo} → ${vuelo.ruta_destino?.codigo}`, mono: false },
                                            {
                                                label: 'Fecha',
                                                value: `${new Date(vuelo.fecha_vuelo + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} · ${vuelo.hora_salida} hrs`,
                                                mono: true,
                                            },
                                        ].map(({ label, value, mono }) => (
                                            <div key={label} className="flex items-center justify-between py-2">
                                                <span className="text-gray-400">{label}</span>
                                                <span className={`font-semibold text-gray-700 ${mono ? 'font-mono' : ''}`}>
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                   
                                </div>

                                {/* Acciones */}
                                <BotonPrimario
                                    tipo="button"
                                    texto={loading ? 'Creando reserva...' : 'Confirmar reserva'}
                                    clase="w-full justify-center"
                                    icono={!loading && <Check size={15} />}
                                    onClick={handleSubmit}
                                    disabled={loading}
                                />
                                <BotonSecundario
                                    tipo="button"
                                    onClick={() => navigate(-1)}
                                    texto="Cancelar"
                                />
                            </div>

                        ) : (
                            /* Placeholder */
                            <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                    <Armchair size={26} className="text-gray-300" />
                                </div>
                                <p className="text-sm font-semibold text-gray-400">Ningún asiento seleccionado</p>
                                <p className="text-xs text-gray-300 mt-1.5 max-w-xs">
                                    Haz clic en un asiento verde del mapa para seleccionarlo
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            )}

        </div>
    )
}

export default NuevaReserva
