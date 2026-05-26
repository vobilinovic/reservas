import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getReserva, actualizarReserva } from '../../services/reservas'
import toast, { Toaster } from 'react-hot-toast'
import {Clock, CalendarDays, Armchair, Plane, TicketsPlane, Luggage,Download, Printer, X, Info, FileText, ExternalLink, Shield, ChevronRight, Headphones, Mail, Pencil} from 'lucide-react'
import { Breadcrumb } from '../../components/ui/Breadcrumb'
import BadgeEstado from '../../components/ui/BadgeEstado'
import { formatearRut } from '../../utils/helpers'
import { BotonPrimario, BotonSecundario, BotonSecundarioDanger } from '../../components/ui/Button'
import  ModalEliminar from '../../components/ModalEliminar'

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

const SectionTitle = ({ texto }) => (
    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm">{texto}</h3>
    </div>
)


function DetalleReserva() {
    const navigate   = useNavigate()
    const { id }     = useParams()
    const [reserva,  setReserva]  = useState(null)
    const [vuelo,    setVuelo]    = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error,    setError]    = useState('')
    const [reservaCancelar, setReservaCancelar] = useState(null)
    const [eliminando, setEliminando] = useState(false)
    const [form,     setForm]     = useState({
        id: id,
        id_usuario:        '',
        id_vuelo:          '',
        asiento:           '',
        solicitudEspecial: '',
        fechaReserva:      '',
        fechaConfirmacion: '',
        fechaCancelacion:  '',
        estado:            ''
    })

    
    useEffect(() => {
        async function datosReserva() {
            try {
                const data = await getReserva(id)
                setReserva(data)
                setVuelo(data.vuelo)
                setForm({
                    id:                id,
                    id_usuario:        data.id_usuario,
                    id_vuelo:          data.id_vuelo,
                    asiento:           data.asiento,
                    solicitudEspecial: data.solicitudEspecial,
                    fechaReserva:      data.fechaReserva,
                    fechaConfirmacion: data.fechaConfirmacion,
                    fechaCancelacion:  data.fechaCancelacion,
                    estado:            data.estado,
                })
            } catch (err) {
                setError(err.message)
            } finally {
                setCargando(false)
            }
        }
        datosReserva()
    }, [id])

    async function confirmarEliminar() {
        setEliminando(true)

        try {
            await actualizarReserva({ ...form, 
                fechaCancelacion: new Date().toISOString().split('T')[0], 
                estado: 'cancelada' 
            })
        } catch (err) {
            setError(err.message)
            setReservaCancelar(null)
        } finally {
            setEliminando(false)
        }
    }

    return (
        <div className="p-8">
            {reservaCancelar && (
                <ModalEliminar
                    data={reservaCancelar}
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => setReservaCancelar(null)}
                    eliminando={eliminando}
                    tipo = "reserva"
                />
            )}

            <Toaster />

            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 flex gap-2">
                        <TicketsPlane /> Detalle Reserva #{id}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Información completa de tu reserva.</p>
                </div>
                <Breadcrumb items={[
                    { texto: 'Inicio',      href: '/inicio'       },
                    { texto: 'Mis Reservas', href: '/mis-reservas' },
                    { texto: 'Detalle Reserva #' + id },
                ]} />
            </div>

            {/* Cargando */}
            {cargando && (
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="flex items-center justify-center py-24 text-gray-400 text-sm gap-2">
                        <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-900 rounded-full animate-spin" />
                        Cargando información de la reserva...
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                    {error}
                </div>
            )}

            {reserva && vuelo && (
                <div className="grid grid-cols-3 gap-6">

                    {/* ── Columna principal (2/3) ── */}
                    <div className="col-span-2 flex flex-col gap-5">

                        {/* Ticket */}
                        <div className="bg-white rounded-xl shadow-sm relative overflow-hidden">
                            {/* Mordiscos */}
                            <div className="absolute -left-3 top-[65px] w-6 h-10 bg-gray-50 rounded-full z-10" />
                            <div className="absolute -right-3 top-[65px] w-6 h-10 bg-gray-50 rounded-full z-10" />

                            {/* Stub superior: vuelo + estado */}
                            <div className="px-6 py-4 flex items-center justify-between border-b border-dashed border-gray-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-10 bg-blue-900 rounded-full" />
                                    <div>
                                        <span className="text-xs text-gray-400 uppercase tracking-wide">Vuelo</span>
                                        <p className="font-mono font-black text-2xl text-blue-900 tracking-wider leading-none mt-0.5">
                                            {vuelo.num_vuelo}
                                        </p>
                                    </div>
                                </div>
                                <BadgeEstado estado={vuelo.estado} />
                            </div>

                            {/* Cuerpo: ruta */}
                            <div className="px-6 py-5 flex items-center gap-4">
                                {/* Origen */}
                                <div className="text-left shrink-0">
                                    <p className="text-3xl font-black font-mono text-blue-900 leading-none">
                                        {vuelo.ruta_origen?.codigo}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{vuelo.ruta_origen?.ciudad}</p>
                                    <p className="text-xs font-mono font-semibold text-gray-500 mt-2 flex items-center gap-1">
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
                                    <p className="text-xs font-mono font-semibold text-gray-500 mt-2 flex items-center justify-end gap-1">
                                        <Clock size={10} className="text-gray-400" />
                                        {vuelo.hora_llegada} hrs
                                    </p>
                                </div>
                            </div>

                            {/* Stub inferior: fecha salida · estado · asiento */}
                            <div className="border-t border-dashed border-gray-300 px-6 py-4 grid grid-cols-3 divide-x divide-dashed divide-gray-200">
                                <div className="pr-6">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Fecha de salida</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {new Date(vuelo.fecha_vuelo + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="px-6 flex flex-col items-center">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Estado</p>
                                    <BadgeReserva estado={form.estado} />
                                </div>
                                <div className="pl-6 flex flex-col items-end">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Asiento</p>
                                    <div className="inline-flex items-center gap-1.5 bg-blue-900 text-white px-3 py-1 rounded-lg">
                                        <Armchair size={13} />
                                        <span className="font-mono font-black text-base tracking-wider">
                                            {form.asiento || '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {reserva.estado != 'cancelada' && (
                        <>
                        {/* Info pasajero + Servicios */}
                        <div className="grid grid-cols-2 gap-5">

                            {/* Información del pasajero */}
                            <div className="bg-white rounded-xl shadow-sm p-5">
                                <SectionTitle texto="Información del Pasajero" />
                                <div className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-2.5">
                                    <span className="text-sm text-gray-400">Nombre</span>
                                    <span className="text-sm font-semibold text-blue-900">
                                        {[reserva.usuario?.nombre, reserva.usuario?.primer_apellido, reserva.usuario?.segundo_apellido].filter(Boolean).join(' ')}
                                    </span>
                                    <span className="text-sm text-gray-400">RUT</span>
                                    <span className="text-sm font-semibold text-blue-900">
                                        {formatearRut(reserva.usuario?.rut)}
                                    </span>
                                    <span className="text-sm text-gray-400">Email</span>
                                    <span className="text-sm font-semibold text-blue-900">
                                        {reserva.usuario?.email}
                                    </span>
                                    <span className="text-sm text-gray-400">Teléfono</span>
                                    <span className="text-sm font-semibold text-blue-900">
                                        {reserva.usuario?.telefono || '—'}
                                    </span>
                                </div>
                            </div>

                            {/* Servicios incluidos */}
                            <div className="bg-white rounded-xl shadow-sm p-5">
                                <SectionTitle texto="Servicios Incluidos" />
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                            <Armchair size={17} className="text-blue-900" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Asiento seleccionado</p>
                                            <p className="text-xs text-gray-400">Asiento {form.asiento || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                            <Luggage size={17} className="text-blue-900" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Equipaje de bodega</p>
                                            <p className="text-xs text-gray-400">1 maleta (23 kg)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botones acción */}
                        <div className="flex gap-3">
                            <BotonPrimario
                                tipo="button"
                                texto="Descargar Reserva"
                                clase="w-full"
                                icono={<Download size={15} />}
                            />
                            <BotonSecundario
                                tipo="button"
                                texto="Modificar Asiento"
                                clase="w-full"
                                icono={<Pencil size={15} />}
                                onClick={() => navigate('/reservas/modificar/' + reserva.id)}
                            />
                            <BotonSecundarioDanger
                                tipo="button"
                                texto="Cancelar Reserva"
                                clase="w-full"
                                icono={<X size={15} />}
                                onClick={() => setReservaCancelar(reserva)}
                            />
                        </div>
                        </>
                        )}
                    </div>

                    {/* ticket */}
                    <div className="col-span-1 flex flex-col gap-4">
                        
                        {/* Estado del ticket */}
                        {reserva.estado != 'cancelada' && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Info size={15} className="text-blue-700 shrink-0" />
                                <h4 className="font-semibold text-blue-900 text-sm">Estado del Ticket</h4>
                            </div>
                            <p className="text-sm text-blue-800/80 leading-relaxed mb-3">
                                Tu tarjeta de embarque será enviada a tu correo electrónico una vez que la reserva sea confirmada por el sistema.
                            </p>
                            <div className="bg-white/70 rounded-lg px-3 py-2 text-xs text-blue-700 border border-blue-100">
                                La descarga directa desde este portal no está disponible aún.
                            </div>
                        </div>
                        )}
                        
                        {/* Tarjeta oscura */}
                        <div className="bg-blue-900 rounded-xl p-5 text-white">
                            <p className="font-bold text-sm mb-1">¿Problemas con tu reserva?</p>
                            <p className="text-xs text-blue-200 leading-relaxed mb-4">
                                Contacta con nosotros.
                            </p>
                            <button className="w-full flex items-center justify-center gap-2 bg-white text-blue-900 px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">
                                <Mail size={13} />
                                correo@dap.cl
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}

export default DetalleReserva
