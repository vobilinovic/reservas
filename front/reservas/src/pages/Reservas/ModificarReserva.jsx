import { getUsuario } from '../../services/auth'
import { BotonPrimario, BotonSecundario } from '../../components/ui/Button'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getVuelo } from '../../services/vuelos'
import { getReserva, actualizarReserva } from '../../services/reservas'
import { actualizarUsuario } from '../../services/usuarios'
import { ArrowRight, Clock, CalendarDays, Armchair, Check, Plane, TicketsPlane, Luggage, ArrowDown } from 'lucide-react'
import { Breadcrumb } from '../../components/ui/Breadcrumb'
import BadgeEstado from '../../components/ui/BadgeEstado'
import toast, { Toaster } from 'react-hot-toast'

function generarColumnas(nColumnas) {
    const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return Array.from({ length: nColumnas }, (_, i) => LETRAS[i])
}

function PreviewCabina({ filas, columnas, pasillo_despues_de, filas_emergencia, ocupados, asientoSeleccionado, asientoActual, onSeleccion }) {
    const cols       = generarColumnas(columnas)
    const emergencia = filas_emergencia
        ? filas_emergencia.split(',').map(f => parseInt(f.trim())).filter(n => !isNaN(n))
        : []
    const nFilas      = parseInt(filas) || 0
    const pasilloIdx  = pasillo_despues_de ? cols.indexOf(pasillo_despues_de) : -1
    const colsIzq     = pasilloIdx >= 0 ? cols.slice(0, pasilloIdx + 1) : cols
    const colsDer     = pasilloIdx >= 0 ? cols.slice(pasilloIdx + 1)    : []

    const Asiento = ({ rowNum, col }) => {
        const isEmergencia = emergencia.includes(rowNum)
        const id           = rowNum + col
        const ocupado      = ocupados.includes(id) && id !== asientoActual
        const seleccionado = asientoSeleccionado === id
        return (
            <button
                onClick={() => !ocupado && onSeleccion(id)}
                disabled={ocupado}
                title={ocupado ? `${id} — Ocupado` : id}
                className={`w-6 h-6 flex-shrink-0 rounded-md border transition-all duration-150 ${
                    ocupado
                        ? 'bg-red-100 border-red-200 cursor-not-allowed opacity-60'
                        : seleccionado
                            ? 'bg-blue-900 border-blue-900 scale-105 shadow-md'
                            : isEmergencia
                                ? 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:scale-105 cursor-pointer'
                                : 'bg-white border-gray-200 hover:bg-blue-100 hover:border-blue-300 hover:scale-105 cursor-pointer'
                }`}
            />
        )
    }

    return (
        <div className="bg-blue-50 rounded-2xl p-4 select-none inline-block">
            {/* Cabecera columnas */}
            <div className="flex items-center gap-1 mb-2 px-0.5">
                {colsIzq.map(col => (
                    <div key={col} className="w-6 text-center text-xs font-semibold text-blue-300">{col}</div>
                ))}
                <div className="w-6 flex-shrink-0" />
                {colsDer.map(col => (
                    <div key={col} className="w-6 text-center text-xs font-semibold text-blue-300">{col}</div>
                ))}
            </div>

            {/* Filas */}
            <div className="overflow-y-auto max-h-[420px] pr-2">
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


function ModificarReserva() {
    const usuario  = getUsuario()
    const navigate = useNavigate()
    const { id }   = useParams()

    const inputClass = "w-full p-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-blue-900"
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1"

    const [vuelo, setVuelo]               = useState(null)
    const [reserva, setReserva] = useState(null)
    const [asientos,setAsientos]            = useState(null)
    const [cargando, setCargando]            = useState(true)
    const [loading, setLoading]             = useState(false)
    const [error, setError]               = useState(null)
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(null)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [form, setForm]                = useState({
        id_usuario:   usuario?.id,
        id_vuelo:     '',
        asiento:      '',
        solicitudEspecial: '',
        fechaReserva: '',
        estado:       '',
    })

    function handleSeleccionAsiento(codigo) {
        setAsientoSeleccionado(codigo)
        setForm(prev => ({ ...prev, asiento: codigo }))
    }

    useEffect(() => {
        async function datosReserva() {
            try {
                const reserva = await getReserva(id)
                const vuelo   = await getVuelo(reserva.vuelo.id)
                setForm({
                    id:                reserva.id,
                    id_usuario:        reserva.id_usuario,
                    id_vuelo:          reserva.vuelo.id,
                    asiento:           reserva.asiento,
                    solicitudEspecial: reserva.solicitudEspecial,
                    fechaReserva:      reserva.fechaReserva,
                    estado:            reserva.estado,
                })
                setReserva(reserva) //datos reserva
                setAsientoSeleccionado(reserva.asiento) //asiento seleccionado en la reserva
                setVuelo(vuelo) // data del vuelo
                setAsientos(vuelo.asientos) //asientos disponibles 
            } catch (err) {
                setError(err.message)
            } finally {
                setCargando(false)
            }
        }
        datosReserva()
    }, [id])


    async function handleSubmit() {
        setError('')
        setLoading(true)

        if(asientoSeleccionado === reserva.asiento){
            toast.error('Por favor, selecciona un asiento diferente')
            return
        }

        try {
            await actualizarReserva({ ...form })
                
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
            setModalAbierto(true)
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
            <Toaster/>
            {/*modal de que se realizo el cambio de asiento*/}
            {modalAbierto && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Fondo oscuro */}
                <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setModalAbierto(false)}
                />

                {/* Tarjeta del modal */}
                <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">

                    {/* Icono */}
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
                        <Check size={22} className="text-green-600" />
                    </div>

                    <h3 className="text-center text-base font-bold text-gray-800 mb-1">
                        Cambio realizado con éxito
                    </h3>
                    <p className="text-center text-sm text-gray-500 mb-5 leading-relaxed">
                        Tu asiento fue cambiado a <span className="font-mono font-bold text-blue-900">{form.asiento}</span>.
                        Enviamos la confirmación a <span className="font-semibold text-gray-700">{usuario?.email}</span>
                    </p>

                    <div className="flex gap-3">
                        <BotonPrimario
                            type="button"
                            onClick={() => navigate('/reservas/detalle/' + form.id)}
                            texto="Cerrar"
                            clase={'w-full'}
                        />

                    </div>

                </div>
            </div>
            )}


            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 flex gap-2">
                        <TicketsPlane /> Modificar Reserva
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Modifica tu asiento de tu reserva.</p>
                </div>
                <Breadcrumb items={[
                    { texto: 'Inicio', href: '/inicio' },
                    { texto: 'Mis Reservas', href: '/mis-reservas' },
                    { texto: 'Modificar Reserva #' + id },
                ]} />
            </div>

            {/* Cargando */}
            {cargando && (
                <div className="bg-white rounded-xl shadow-sm relative">
                    <div className="flex items-center justify-center py-24 text-gray-400 text-sm gap-2">
                        <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-900 rounded-full animate-spin" />
                        Cargando información de la reserva...
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                    {error}
                </div>
            )}

            {vuelo && asientos && (
                <>
                    {/* ── Paso 1: Selección de asiento ── */}
                    <div className="grid grid-cols-3 gap-6 mt-6">

                            {/* Columna izquierda */}
                            <div className="col-span-2">
                                <div className="flex flex-col gap-6">
                                    <div className="bg-white rounded-xl shadow-sm relative">
                                        {/* Mordiscos laterales */}
                                        <div className="absolute -left-3 top-[65px] w-6 h-10 bg-gray-50 rounded-full z-10" />
                                        <div className="absolute -right-3 top-[65px] w-6 h-10 bg-gray-50 rounded-full z-10" />

                                        {/* Stub superior */}
                                        <div className="px-6 py-4 flex items-center justify-between border-b border-dashed border-gray-300">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-10 bg-blue-900 rounded-full" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-400">Vuelo</span>
                                                    <span className="font-mono font-black text-2xl text-blue-900 tracking-wider">
                                                        {vuelo.num_vuelo}
                                                    </span>
                                                </div>
                                            </div>
                                            <BadgeEstado estado={vuelo.estado} />
                                        </div>

                                        {/* Cuerpo del ticket */}
                                        <div className="px-6 py-5 flex items-center gap-4">
                                            {/* Origen */}
                                            <div className="text-left shrink-0">
                                                <p className="text-3xl font-black font-mono text-blue-900 leading-none">
                                                    {vuelo.ruta_origen?.codigo}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">{vuelo.ruta_origen?.ciudad}</p>
                                                <p className="text-xs font-mono font-bold text-gray-600 mt-2 flex items-center justify-center gap-1">
                                                    <Clock size={10} className="text-gray-400" />
                                                    {vuelo.hora_salida} hrs
                                                </p>
                                            </div>

                                            {/* Línea + fecha */}
                                            <div className="flex-1 flex flex-col items-center gap-2.5">
                                                <div className="flex items-center w-full gap-2">
                                                    <div className="h-px flex-1 bg-gray-200" />
                                                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                        <Plane size={15} className="text-blue-900 -rotate-90" />
                                                    </div>
                                                    <div className="h-px flex-1 bg-gray-200" />
                                                </div>
                                                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                    <CalendarDays size={11} />
                                                    {new Date(vuelo.fecha_vuelo + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>

                                            {/* Destino */}
                                            <div className="text-right shrink-0">
                                                <p className="text-3xl font-black font-mono text-blue-900 leading-none">
                                                    {vuelo.ruta_destino?.codigo}

                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">{vuelo.ruta_destino?.ciudad}</p>
                                                <p className="text-xs font-mono font-bold text-gray-600 mt-2 flex items-center justify-center gap-1">
                                                    <Clock size={10} className="text-gray-400" />
                                                    {vuelo.hora_llegada} hrs
                                                </p>
                                            </div>
                                        </div>
                                    
                                    </div>

                                    {/* Mapa de asientos */}
                                    <div className="bg-white rounded-xl shadow-sm p-5">
                                        <SectionTitle
                                            texto="Selección de asiento"
                                            extra={
                                                <span className="text-xs text-gray-400">
                                                    <span className="font-mono font-semibold text-green-600">{asientos.disponibles}</span>
                                                    <span className="text-gray-300"> / {asientos.capacidadAeronave} disponibles</span>
                                                </span>
                                            }
                                        />
                                        <div className="flex items-start gap-5 justify-center">
                                            <PreviewCabina
                                                filas={asientos.filas}
                                                columnas={asientos.columnas}
                                                pasillo_despues_de={asientos.pasillo_despues_de}
                                                filas_emergencia={asientos.emergencia}
                                                ocupados={asientos.asientosOcupados}
                                                asientoSeleccionado={asientoSeleccionado}
                                                asientoActual={reserva.asiento}
                                                onSeleccion={handleSeleccionAsiento}
                                            />
                                            {/* Leyenda */}
                                            <div className="flex flex-col gap-2 pt-10 shrink-0">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Leyenda</p>
                                                {[
                                                    { color: 'bg-blue-900  border-blue-900',   label: 'Seleccionado' },
                                                    { color: 'bg-white     border-gray-200',   label: 'Disponible'   },
                                                    { color: 'bg-orange-50 border-orange-200', label: 'Emergencia'   },
                                                    { color: 'bg-red-100   border-red-200',    label: 'Ocupado'      },
                                                ].map(({ color, label }) => (
                                                    <div key={label} className="flex items-center gap-2">
                                                        <div className={`w-4 h-4 rounded-md border flex-shrink-0 ${color}`} />
                                                        <p className="text-xs text-gray-500">{label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columna derecha */}
                            <div className="col-span-1">
                                {asientoSeleccionado ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="bg-white rounded-xl shadow-sm p-5">
                                            <SectionTitle texto="Cambio de asiento" />

                                            {/* Asiento anterior */}
                                            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                                                <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
                                                    <Armchair size={28} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-3xl font-black text-gray-300 font-mono leading-none line-through">
                                                        {reserva?.asiento}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">Asiento anterior</p>
                                                </div>
                                            </div>

                                            {/* Flecha */}
                                            <div className="flex items-center justify-center my-3">
                                                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0 text-blue-900">
                                                    <ArrowDown size={16} />
                                                </div>
                                            </div>

                                            {/* Asiento nuevo */}
                                            <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4 mb-4">
                                                <div className="w-14 h-14 bg-blue-900 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                                                    <Armchair size={28} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-3xl font-black text-blue-900 font-mono leading-none">
                                                        {asientoSeleccionado}
                                                    </p>
                                                    <p className="text-xs text-blue-800 mt-1">Asiento nuevo</p>
                                                    {esEmergencia && (
                                                        <span className="inline-block mt-1.5 text-xs bg-orange-400/20 text-orange-700 border border-orange-300/30 px-2 py-0.5 rounded-full font-semibold">
                                                            Fila de emergencia
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Detalle */}
                                            <div className="text-xs divide-y divide-gray-50 mb-4">
                                                {[
                                                    { label: 'Pasajero', value: usuario?.nombre,                                                                                                           mono: false },
                                                    { label: 'Vuelo',    value: vuelo.num_vuelo,                                                                                                           mono: true  },
                                                    { label: 'Ruta',     value: `${vuelo.ruta_origen?.codigo} → ${vuelo.ruta_destino?.codigo}`,                                                            mono: false },
                                                    { label: 'Fecha',    value: `${new Date(vuelo.fecha_vuelo + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} · ${vuelo.hora_salida} hrs`, mono: true },
                                                ].map(({ label, value, mono }) => (
                                                    <div key={label} className="flex items-center justify-between py-2">
                                                        <span className="text-gray-400">{label}</span>
                                                        <span className={`font-semibold text-gray-700 ${mono ? 'font-mono' : ''}`}>
                                                            {value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <BotonPrimario
                                                    tipo="button"
                                                    texto="Confirmar cambio"
                                                    clase="w-full justify-center"
                                                    icono={<Check size={15} />}
                                                    onClick={() => handleSubmit()}
                                                />
                                                <BotonSecundario
                                                    tipo="button"
                                                    onClick={() => navigate(-1)}
                                                    clase="w-full justify-center"
                                                    texto="Cancelar"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                            <Armchair size={26} className="text-gray-300" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-400">Ningún asiento seleccionado</p>
                                        <p className="text-xs text-gray-300 mt-1.5 max-w-xs">
                                            Haz clic en un asiento del mapa para seleccionarlo
                                        </p>
                                    </div>
                                )}
                            </div>

                    </div>
                </>
            )}

        </div>
    )
}

export default ModificarReserva