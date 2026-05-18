import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsuario } from '../../services/auth'
import { listarVuelos, asientosDisponibles } from '../../services/vuelos'
import { listarRutas } from '../../services/rutas'
import { listarReservasUsuario } from '../../services/reservas'
import { CalendarDays, Plane, Ticket, ArrowRight, Clock, Search, Users, ChevronRight, Calendar } from 'lucide-react'
import { BotonPrimario, BotonSecundario } from '../../components/ui/Button'
import { BadgeEstado } from '../../components/ui/BadgeEstado'

// Barra visual de asientos disponibles
function BarraAsientos({ asientos }) {
    if (!asientos) return (
        <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full animate-pulse" />
    )

    const { disponibles, ocupados, capacidadAeronave } = asientos
    const pct = capacidadAeronave > 0 ? (disponibles / capacidadAeronave) * 100 : 0

    // Color según % disponible
    const barColor  = pct > 60 ? 'bg-green-600'  : pct > 25 ? 'bg-amber-400'  : 'bg-red-400'
    const textColor = pct > 60 ? 'text-green-700' : pct > 25 ? 'text-amber-600' : 'text-red-600'
    const bgColor   = pct > 60 ? 'bg-green-50'   : pct > 25 ? 'bg-amber-50'   : 'bg-red-50'

    return (
        <div className={`mt-2.5 rounded-lg px-3 py-2 ${bgColor}`}>
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                    <Users size={11} className={textColor} />
                    <span className={`text-xs font-bold ${textColor}`}>
                        {disponibles} asiento{disponibles !== 1 ? 's' : ''} disponible{disponibles !== 1 ? 's' : ''}
                    </span>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                    {ocupados} / {capacidadAeronave}
                </span>
            </div>
            {/* Barra */}
            <div className="w-full bg-white/70 rounded-full h-1.5 overflow-hidden">
                <div
                    className={`${barColor} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                />
            </div>
        </div>
    )
}

function Inicio() {
    const usuario  = getUsuario()
    const navigate = useNavigate()

    // Rutas para los selects
    const [rutas, setRutas] = useState([])

    // Formulario de búsqueda
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

            const filtrados = todos.filter(v => {
                if (!estadosActivos.includes(v.estado))       return false
                if (v.fecha_vuelo < hoy)                      return false
                if (busqueda.id_origen  && String(v.id_origen)  !== busqueda.id_origen)  return false
                if (busqueda.id_destino && String(v.id_destino) !== busqueda.id_destino) return false
                if (busqueda.fecha      && v.fecha_vuelo        !== busqueda.fecha)       return false
                return true
            }).sort((a, b) => {
                if (a.fecha_vuelo !== b.fecha_vuelo) return a.fecha_vuelo.localeCompare(b.fecha_vuelo)
                return a.hora_salida.localeCompare(b.hora_salida)
            })

            const filtradosConAsientos = await Promise.all(
                filtrados.map(async v => {
                    const asientos = await asientosDisponibles(v.id)
                    return { ...v, asientos } //copia el array v y le agrega asientos
                })
            )

            console.log(reservas)
            //ahora filtramos si es ese vuelo esta reservado por el usuario
            const vuelosConReserva = filtradosConAsientos.map(v => {
                const reserva = reservas.find(r => Number(r.id_vuelo) === Number(v.id) && Number(r.id_usuario) === usuario.id)
                return {
                    ...v,
                    yaReservo: reserva ? 1 : 0 //le agrega la propiedad yaReservo
                }
            })
            console.log('vuelosConReserva', vuelosConReserva)
            setResultados(vuelosConReserva)
        } catch {
            setResultados([])
        } finally {
            setBuscando(false)
        }
    }

    const selectClass = "w-full p-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-blue-900 bg-white"
    const labelClass  = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide"

    return (
        <div className="p-8">

            {/* Encabezado */}
            <div className="mb-8">
                <p className="text-sm text-gray-400 mb-1">Bienvenido</p>
                <h2 className="text-2xl font-bold text-blue-900">{usuario?.nombre}</h2>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar size={14}/>
                    {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-6">

                {/*card mis reservas*/}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">

                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Ticket size={16} className="text-blue-900" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Mis Reservas</h3>
                            <p className="text-xs text-gray-400 mt-1">Vuelos confirmados.</p>
                        </div>
                        <button
                            onClick={() => navigate('/reservas/nueva')}
                            className="text-xs text-blue-900 hover:underline font-medium flex items-center gap-1"
                        >
                            Ver todas <ArrowRight size={12} />
                        </button>
                    </div>
                    {reservas.length > 0 ? (
                        <div className="p-5 flex flex-col gap-2">
                            {reservas.map(r => (
                                <div
                                    key={r.id}
                                    onClick={() => navigate(`/reservas/${r.id}`)}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
                                >
                                    {/* Número de vuelo */}
                                    <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2.5 py-1.5 rounded-md shrink-0">
                                        {r.vuelo.num_vuelo}
                                    </span>

                                    {/* Fecha + asiento */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <CalendarDays size={11} className="text-gray-300" />
                                            <span>
                                                {new Date(r.vuelo.fecha_vuelo + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <Clock size={11} className="text-gray-300 ml-0.5" />
                                            <span className="font-mono">{r.vuelo.hora_salida}</span>
                                        </div>
                                        
                                    </div>
                                    <p className="text-md text-gray-400 mt-0.5">
                                        Asiento <span className="font-mono font-semibold text-gray-600">{r.asiento}</span>
                                    </p>
                                    {/* Estado + chevron */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                            r.estado === 'reservado' ? 'bg-green-50 text-green-700 border-blue-200' :
                                            r.estado === 'cancelado' ? 'bg-red-50 text-red-600 border-red-200'   :
                                            'bg-gray-100 text-gray-500 border-gray-200'
                                        }`}>
                                            {r.estado === 'reservado' ? 'Reservado' :
                                            r.estado === 'cancelado' ? 'Cancelado' : r.estado}
                                        </span>
                                        <ChevronRight size={20} className="text-gray-500" />
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end align-end">
                                <p className="text-xs text-gray-500">{reservas.length} reserva{reservas.length !== 1 ? 's' : ''} activa{reservas.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    ) : (
                        /*sin reservas activas*/
                        <div className="flex-1 flex flex-col items-center justify-center py-14 px-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                <Ticket size={22} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-400">No tienes reservas activas</p>
                            <p className="text-xs text-gray-300 mt-1">Tus próximas reservas aparecerán aquí</p>
                            
                        </div>
                    )}

                </div>

                {/* ── Card: Buscar Vuelo ── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">

                    <div className="flex items-center gap-2 p-5 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Plane size={16} className="text-blue-900" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Buscar Vuelo</h3>
                        <p className="text-xs text-gray-400 mt-1">Vuelos disponibles para reservar.</p>
                    </div>

                    <div className="p-5">

                        {/* Formulario */}
                        <form onSubmit={handleBuscar}>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className={labelClass}>Origen</label>
                                    <select
                                        value={busqueda.id_origen}
                                        onChange={e => setField('id_origen', e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="">Todos los origenes</option>
                                        {rutas.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.codigo} — {r.ciudad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Destino</label>
                                    <select
                                        value={busqueda.id_destino}
                                        onChange={e => setField('id_destino', e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="">Todos los destinos</option>
                                        {rutas.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.codigo} — {r.ciudad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className={labelClass}>Fecha</label>
                                <input
                                    type="date"
                                    value={busqueda.fecha}
                                    min={hoy}
                                    onChange={e => setField('fecha', e.target.value)}
                                    className={selectClass}
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={buscando}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                            >
                                <Search size={15} />
                                {buscando ? 'Buscando...' : 'Buscar vuelos'}
                            </button>
                        </form>

                        {/* Resultados */}
                        {buscado && (
                            <div className="mt-5">
                                <div className="border-t border-gray-100 pt-4">

                                    {resultados.length === 0 ? (
                                        <div className="flex flex-col items-center py-6 text-center">
                                            <CalendarDays size={28} className="text-gray-200 mb-2" />
                                            <p className="text-sm text-gray-400 font-medium">No se encontraron vuelos</p>
                                            <p className="text-xs text-gray-300 mt-1">Intenta con otra fecha u origen</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <p className="text-xs text-gray-400 mb-1">
                                                {resultados.length} vuelo{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
                                            </p>
                                            {resultados.map(v => (
                                                <div
                                                    key={v.id}
                                                    onClick={() => navigate('/reservas/nueva/' + v.id)}
                                                    className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
                                                >
                                                    {/* Fila 1: vuelo + ruta + fecha + badge */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2 py-1 rounded-md shrink-0">
                                                            {v.num_vuelo}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
                                                                    <span className="font-mono">{v.ruta_origen?.codigo}</span>
                                                                    <span className="text-xs text-gray-400 font-normal">{v.ruta_origen?.ciudad}</span>
                                                                    <ArrowRight size={11} className="text-gray-300 shrink-0 mx-0.5" />
                                                                    <span className="font-mono">{v.ruta_destino?.codigo}</span>
                                                                    <span className="text-xs text-gray-400 font-normal">{v.ruta_destino?.ciudad}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                                                                    <CalendarDays size={10} className="text-gray-300" />
                                                                    <span>
                                                                        {new Date(v.fecha_vuelo + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                                                                    </span>
                                                                    <Clock size={10} className="text-gray-300" />
                                                                    <span className="font-mono">{v.hora_salida}</span>
                                                                </div>
                                                            </div>

                                                            <BadgeEstado estado={v.estado} />
                                                        </div>
                                                        <BotonSecundario
                                                            type="button"
                                                            onClick={() => navigate('/reservas/nueva/' + v.id)}
                                                            texto={v.yaReservo ? 'Reservado' : 'Reservar'}
                                                            disabled={v.yaReservo ? true : false}
                                                        />
                                                    </div>  
                                                    <BarraAsientos asientos={v.asientos} />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    )
}

export default Inicio
