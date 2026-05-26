import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsuario } from '../../services/auth'
import { listarVuelos } from '../../services/vuelos'
import { listarRutas } from '../../services/rutas'
import { listarReservasUsuario } from '../../services/reservas'
import { CalendarDays, Plane, Ticket, ArrowRight, Clock, Search, ChevronRight, Calendar, Armchair, Users } from 'lucide-react'
import { BotonPrimario, BotonSecundario } from '../../components/ui/Button'
import { BadgeEstado } from '../../components/ui/BadgeEstado'

// Calcula duración entre dos horas HH:MM
function calcularDuracion(salida, llegada) {
    if (!salida || !llegada) return null
    const [hS, mS] = salida.split(':').map(Number)
    const [hL, mL] = llegada.split(':').map(Number)
    let min = (hL * 60 + mL) - (hS * 60 + mS)
    if (min < 0) min += 24 * 60
    const h = Math.floor(min / 60)
    const m = min % 60
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`
}

// Asientos disponibles con color según disponibilidad
function AsientosDisponibles({ asientos }) {
    if (!asientos) return <span className="text-xs text-gray-300 font-mono">—</span>
    const { disponibles, cupo } = asientos
    const pct = cupo > 0 ? (disponibles / cupo) * 100 : 0
    const color = pct > 60 ? 'text-green-600' : pct > 25 ? 'text-amber-500' : 'text-red-500'
    return (
        <div className={`flex items-center gap-1 ${color}`}>
            <Users size={11} className="shrink-0" />
            <span className="text-xs font-bold font-mono">{disponibles}/{cupo}</span>
            <span className="text-xs font-medium">asientos disponibles</span>
        </div>
    )
}

function Inicio() {
    const usuario  = getUsuario()
    const navigate = useNavigate()

    // Rutas para los selects
    const [rutas, setRutas] = useState([])

    // Formulario de búsqueda
    const ahora = new Date()
    const hoy = new Date().toISOString().split('T')[0]
    
    const [busqueda, setBusqueda] = useState({
        id_origen:  '',
        id_destino: '',
        fecha:      hoy,
    })

    // Resultados
    const [resultados, setResultados] = useState([])
    const [buscando, setBuscando]     = useState(false)
    const [buscado, setBuscado]       = useState(false)  
    const [reservas, setReservas] = useState([])

    useEffect(() => {
        listarReservas()
        listarRutas()
            .then(data => setRutas(Array.isArray(data) ? data.filter(r => r.estado) : []))
            .catch(() => {})
    }, [])

    async function listarReservas(){
        try{
            const reservas = await listarReservasUsuario(usuario.id)
            setReservas(reservas)
            console.log(reservas)
        }catch(err){
            console.log(err)
        }
    }

    function setField(name, value) {
        setBusqueda(prev => ({ ...prev, [name]: value }))
    }

    async function handleBuscar(e) {
        e.preventDefault()
        setBuscando(true)
        setBuscado(true)
        try {
            const todos = await listarVuelos()
            const estadosActivos = ['programado', 'embarcando', 'en_vuelo', 'demorado']

            console.log('vuelos' , todos)
            const filtrados = todos.filter(v => {
                if (!estadosActivos.includes(v.estado))       return false
                if (v.fecha_vuelo && v.hora_salida) {
                    const salidaVuelo = new Date(`${v.fecha_vuelo}T${v.hora_salida}:00`)
                    if (salidaVuelo < ahora) return false
                } else {
                    if (v.fecha_vuelo < hoy) return false  
                }
                if (busqueda.id_origen  && String(v.id_origen)  !== busqueda.id_origen)  return false
                if (busqueda.id_destino && String(v.id_destino) !== busqueda.id_destino) return false
                if (busqueda.fecha      && v.fecha_vuelo        !== busqueda.fecha)       return false
                return true
            }).sort((a, b) => {
                if (a.fecha_vuelo !== b.fecha_vuelo) return a.fecha_vuelo.localeCompare(b.fecha_vuelo)
                return a.hora_salida.localeCompare(b.hora_salida)
            })

            console.log('reservas',reservas)

            const vuelosConReserva = filtrados.map(v => {
                const reserva = reservas.find(r => Number(r.id_vuelo) === Number(v.id) && Number(r.id_usuario) === usuario.id)
                return {
                    ...v,
                    yaReservo: reserva ? 1 : 0 //le agrega la propiedad yaReservo
                }
            })
            console.log('vuelosConReserva', vuelosConReserva)
            setResultados(vuelosConReserva)
        } catch(err) {
            console.error('handleBuscar error:', err)
            setResultados([])
        } finally {
            setBuscando(false)
        }
    }

    const selectClass = "w-full p-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-blue-900 bg-white"
    const labelClass  = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide"

    // Próxima reserva: la más cercana en el futuro y no cancelada
    const proximaReserva = reservas
        .filter(r => r.estado !== 'cancelada' && r.vuelo?.fecha_vuelo)
        .filter(r => new Date(`${r.vuelo.fecha_vuelo}T${r.vuelo.hora_salida || '00:00'}:00`) >= new Date())
        .sort((a, b) =>
            new Date(`${a.vuelo.fecha_vuelo}T${a.vuelo.hora_salida || '00:00'}:00`) -
            new Date(`${b.vuelo.fecha_vuelo}T${b.vuelo.hora_salida || '00:00'}:00`)
        )[0] ?? null

    return (
        <div className="p-8">

            {/* Encabezado */}
            <div className="mb-6">
                <p className="text-sm text-gray-400 mb-1">Bienvenido</p>
                <h2 className="text-2xl font-bold text-blue-900">{usuario?.nombre}</h2>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar size={14}/>
                    {new Date().toLocaleDateString('es-CL', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* ── Card próximo vuelo (ancho completo) ── */}
            {proximaReserva ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6 flex">

                    {/* Panel izquierdo azul claro */}
                    <div className="bg-blue-50 px-6 py-6 flex flex-col items-center justify-center gap-4 shrink-0 w-44 border-r border-blue-100">
                        <div className="text-center">
                            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2">Vuelo</p>
                            <p className="text-blue-900 font-mono font-black text-2xl tracking-wider leading-none">
                                {proximaReserva.vuelo.num_vuelo}
                            </p>
                        </div>
                        <div className="w-8 h-px bg-blue-200" />
                        <div className="text-center">
                            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2">Asiento</p>
                            <div className="flex items-center justify-center gap-1.5">
                                <Armchair size={26} className="text-blue-400" />
                                <p className="text-blue-900 font-mono font-black text-2xl leading-none">
                                    {proximaReserva.asiento}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contenido derecho */}
                    <div className="flex-1 flex flex-col">

                        {/* Etiqueta */}
                        <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                                Próximo vuelo confirmado
                            </p>
                        </div>

                        {/* Ruta */}
                        <div className="px-6 py-5 flex items-center gap-4 flex-1">
                            {/* Origen */}
                            <div className="text-left shrink-0">
                                <p className="text-3xl font-black font-mono text-blue-900 leading-none">
                                    {proximaReserva.vuelo.ruta_origen?.codigo}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{proximaReserva.vuelo.ruta_origen?.ciudad}</p>
                                <p className="text-xs font-mono font-semibold text-gray-500 mt-2 flex items-center gap-1">
                                    <Clock size={10} className="text-gray-400" />
                                    {proximaReserva.vuelo.hora_salida} hrs
                                </p>
                            </div>

                            {/* Línea + avión */}
                            <div className="flex-1 flex items-center gap-2">
                                <div className="h-px flex-1 bg-gray-200" />
                                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <Plane size={15} className="text-blue-900 -rotate-90" />
                                </div>
                                <div className="h-px flex-1 bg-gray-200" />
                            </div>

                            {/* Destino */}
                            <div className="text-right shrink-0">
                                <p className="text-3xl font-black font-mono text-blue-900 leading-none">
                                    {proximaReserva.vuelo.ruta_destino?.codigo}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{proximaReserva.vuelo.ruta_destino?.ciudad}</p>
                                <p className="text-xs font-mono font-semibold text-gray-500 mt-2 flex items-center justify-end gap-1">
                                    <Clock size={10} className="text-gray-400" />
                                    {proximaReserva.vuelo.hora_llegada} hrs
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Fecha</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {new Date(proximaReserva.vuelo.fecha_vuelo + 'T00:00:00').toLocaleDateString('es-CL', {
                                            day: 'numeric', month: 'long'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Embarque</p>
                                    <p className="text-sm font-semibold text-gray-800 font-mono flex items-center gap-2">
                                        <Clock size={12}/> {proximaReserva.vuelo.hora_salida} hrs
                                    </p>
                                </div>
                            </div>
                            <BotonPrimario
                                onClick={() => navigate('/mis-reservas')}
                                texto="Gestionar reserva"
                                icono={<ChevronRight />}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                /* Sin próximo vuelo */
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-5 mb-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                        <Plane size={18} className="text-gray-300" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-400">Sin vuelos próximos</p>
                        <p className="text-xs text-gray-300 mt-0.5">Busca un vuelo y haz tu reserva para verlo aquí.</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-6">

                {/* ── Card: Mis Reservas ── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Ticket size={16} className="text-blue-900" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Mis Reservas</h3>
                        </div>
                        <button
                            onClick={() => navigate('/mis-reservas')}
                            className="text-xs text-blue-900 hover:underline font-medium flex items-center gap-1"
                        >
                            Ver todas <ArrowRight size={12} />
                        </button>
                    </div>

                    {reservas.length > 0 ? (
                        <div>
                            {/* Header columnas */}
                            <div className="grid grid-cols-[90px_140px_1fr_80px_110px_20px] gap-4 px-6 py-2.5 border-b border-gray-50">
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">N° Vuelo</span>
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Fecha</span>
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Ruta</span>
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Asiento</span>
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Estado</span>
                                <span />
                            </div>
                            {reservas.map(r => (
                                <div
                                    key={r.id}
                                    onClick={() => navigate(`/reservas/detalle/${r.id}`)}
                                    className="grid grid-cols-[90px_140px_1fr_80px_110px_20px] gap-4 items-center px-6 py-3.5 border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer last:border-0"
                                >
                                    <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2 py-1 rounded-md text-center w-fit">
                                        {r.vuelo.num_vuelo}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {new Date(r.vuelo.fecha_vuelo + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                                        </p>
                                        <p className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-2"><Clock size={12}/> {r.vuelo.hora_salida} hrs</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-black font-mono text-sm text-blue-900">{r.vuelo.ruta_origen?.codigo}</span>
                                        <span className="text-xs text-gray-400">{r.vuelo.ruta_origen?.ciudad}</span>
                                        <ArrowRight size={11} className="text-gray-300 shrink-0 mx-1" />
                                        <span className="font-black font-mono text-sm text-blue-900">{r.vuelo.ruta_destino?.codigo}</span>
                                        <span className="text-xs text-gray-400">{r.vuelo.ruta_destino?.ciudad}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Armchair size={18} className="text-gray-300 shrink-0" />
                                        <span className="text-sm font-mono font-semibold text-gray-700">{r.asiento}</span>
                                    </div>
                                    <BadgeEstado estado={r.estado} />
                                    <ChevronRight size={14} className="text-gray-300" />
                                </div>
                            ))}
                            <div className="px-6 py-3">
                                <p className="text-xs text-gray-400 text-right">{reservas.length} reserva{reservas.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                <Ticket size={22} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-400">No tienes reservas activas</p>
                            <p className="text-xs text-gray-300 mt-1">Busca un vuelo y haz tu primera reserva</p>
                        </div>
                    )}
                </div>

                {/* ── Card: Buscar Vuelo ── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Plane size={16} className="text-blue-900" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Buscar Vuelo</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Encuentra vuelos disponibles para reservar.</p>
                    </div>

                    <div className="px-6 py-5">
                        <form onSubmit={handleBuscar}>
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className={labelClass}>Origen</label>
                                    <select value={busqueda.id_origen} onChange={e => setField('id_origen', e.target.value)} className={selectClass}>
                                        <option value="">Todos los orígenes</option>
                                        {rutas.map(r => <option key={r.id} value={r.id}>{r.codigo} — {r.ciudad}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className={labelClass}>Destino</label>
                                    <select value={busqueda.id_destino} onChange={e => setField('id_destino', e.target.value)} className={selectClass}>
                                        <option value="">Todos los destinos</option>
                                        {rutas.map(r => <option key={r.id} value={r.id}>{r.codigo} — {r.ciudad}</option>)}
                                    </select>
                                </div>
                                <div className="w-44">
                                    <label className={labelClass}>Fecha</label>
                                    <input type="date" value={busqueda.fecha} min={hoy} onChange={e => setField('fecha', e.target.value)} className={selectClass} />
                                </div>
                                <button
                                    type="submit"
                                    disabled={buscando}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 shrink-0"
                                >
                                    <Search size={15} />
                                    {buscando ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                        </form>

                        {buscado && (
                            <div className="mt-5 border-t border-gray-100 pt-4">
                                {resultados.length === 0 ? (
                                    <div className="flex flex-col items-center py-6 text-center">
                                        <CalendarDays size={28} className="text-gray-200 mb-2" />
                                        <p className="text-sm text-gray-400 font-medium">No se encontraron vuelos</p>
                                        <p className="text-xs text-gray-300 mt-1">Intenta con otra fecha u origen</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {resultados.map(v => (
                                            <div
                                                key={v.id}
                                                className="grid grid-cols-[90px_1fr_90px_200px_90px] gap-3 items-center px-3 py-2.5 rounded-lg hover:bg-blue-50/40 transition-colors"
                                            >
                                                <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded-md text-center">
                                                    {v.num_vuelo}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-black font-mono text-sm text-blue-900">{v.ruta_origen?.codigo}</span>
                                                    <span className="text-xs text-gray-400">{v.ruta_origen?.ciudad}</span>
                                                    <ArrowRight size={11} className="text-gray-300 shrink-0" />
                                                    <span className="font-black font-mono text-sm text-blue-900">{v.ruta_destino?.codigo}</span>
                                                    <span className="text-xs text-gray-400">{v.ruta_destino?.ciudad}</span>
                                                </div>
                                                <div className="flex flex-col shrink-0">
                                                    <span className="text-[10px] text-gray-400 leading-none mb-0.5">Hora salida</span>
                                                    <span className="text-xs font-mono font-semibold text-gray-700">{v.hora_salida}</span>
                                                </div>
                                                <AsientosDisponibles asientos={v.asientos} />
                                                <button
                                                    onClick={() => !v.yaReservo && navigate('/reservas/nueva/' + v.id)}
                                                    disabled={!!v.yaReservo}
                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                                                        v.yaReservo
                                                            ? 'border border-gray-200 text-gray-400 cursor-not-allowed'
                                                            : 'bg-blue-900 text-white hover:bg-blue-800'
                                                    }`}
                                                >
                                                    {v.yaReservo ? 'Reservado' : 'Reservar'}
                                                </button>
                                            </div>
                                        ))}
                                        <p className="text-xs text-gray-400 text-right pt-1">
                                            {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Inicio
