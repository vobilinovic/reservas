import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsuario } from '../../services/auth'
import { listarVuelos } from '../../services/vuelos'
import { CalendarDays, Plane, Ticket, ArrowRight, Clock, Search, Users, ChevronRight, Calendar, PlaneTakeoff, Ban } from 'lucide-react'
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

    const [vuelos, setVuelos] = useState([])
    const [vueloProximo, setVueloProximo] = useState([])

    const hoy = new Date().toISOString().split('T')[0]

    //para paginacion
    const [paginaActual, setPaginaActual] = useState(1)
    const porPagina = 3;
    const totalPaginas = Math.ceil(vuelos.length / porPagina);
    const vuelosPaginados = vuelos.slice((paginaActual - 1) * porPagina, paginaActual * porPagina)

    useEffect(() => {
        getVuelos()
    }, [])

    async function getVuelos(){
        try{
            const todos = await listarVuelos()
            const estadosActivos = ['programado', 'embarcando', 'en_vuelo', 'demorado']

            const filtrados = todos.filter(v => {
                if (v.fecha_vuelo < hoy) return false //para eliminar vuelos pasados
                return true
            }).sort((a, b) => {
                if (a.fecha_vuelo !== b.fecha_vuelo) return a.fecha_vuelo.localeCompare(b.fecha_vuelo)
                return a.hora_salida.localeCompare(b.hora_salida)
            }).slice(0, 15); //lista solo 15 vuelos próximos

            /*const filtradosConAsientos = await Promise.all(
                filtrados.map(async v => {
                    const asientos = await asientosDisponibles(v.id)
                    return { ...v, asientos } //copia el array v y le agrega asientos
                })
            )*/

            const proxVuelo = filtrados[0]; //el mas proximo es el primero
            setVueloProximo(proxVuelo)

            setVuelos(filtrados)
        }catch(err){
            console.log(err)
        }
    }

    return (
        <div className="p-8">

            {/* Encabezado */}
            <div className="mb-8">
                <p className="text-sm text-gray-400 mb-1">Bienvenido</p>
                <h2 className="text-2xl font-bold text-blue-900">{usuario?.nombre}</h2>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    <CalendarDays size={14}/>
                    {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col mb-5 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <PlaneTakeoff size={16} className="text-blue-900" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Próximo vuelo</h3>
                    </div>
                    {vueloProximo && (
                        <button
                            onClick={() => navigate('/vuelos/' + vueloProximo.id)}
                            className="text-xs text-blue-900 hover:underline font-medium flex items-center gap-1"
                        >
                            Ver detalle <ArrowRight size={12} />
                        </button>
                    )}
                </div>

                {/* Cuerpo */}
                {vueloProximo ? (
                    <div className="px-5 py-3 flex items-center gap-6">

                        {/* N° Vuelo */}
                        <div className="shrink-0">
                            <p className="text-xs text-gray-400 mb-0.5">N° Vuelo</p>
                            <span className="font-mono font-bold text-sm text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                                {vueloProximo.num_vuelo}
                            </span>
                        </div>

                        <div className="w-px h-8 bg-gray-100 shrink-0" />

                        {/* Matrícula */}
                        <div className="shrink-0">
                            <p className="text-xs text-gray-400 mb-0.5">Matrícula</p>
                            <span className="font-bold text-sm text-blue-900">
                                {vueloProximo.aeronave?.matricula}
                            </span>
                        </div>

                        <div className="w-px h-8 bg-gray-100 shrink-0" />

                        {/* Ruta */}
                        <div className="shrink-0">
                            <p className="text-xs text-gray-400 mb-1">Ruta</p>
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                                <span className="font-mono">{vueloProximo.ruta_origen?.codigo}</span>
                                <span className="text-xs text-gray-400 font-normal">{vueloProximo.ruta_origen?.ciudad}</span>
                                <ArrowRight size={12} className="text-gray-300 mx-0.5" />
                                <span className="font-mono">{vueloProximo.ruta_destino?.codigo}</span>
                                <span className="text-xs text-gray-400 font-normal">{vueloProximo.ruta_destino?.ciudad}</span>
                            </div>
                        </div>

                        <div className="w-px h-8 bg-gray-100 shrink-0" />

                        {/* Fecha */}
                        <div className="shrink-0">
                            <p className="text-xs text-gray-400 mb-1">Fecha</p>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <CalendarDays size={13} className="text-gray-400" />
                                <span>
                                    {new Date(vueloProximo.fecha_vuelo + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </span>
                                <Clock size={13} className="text-gray-400 ml-1" />
                                <span className="font-mono font-semibold">{vueloProximo.hora_salida} hrs</span>
                            </div>
                        </div>

                        <div className="w-px h-8 bg-gray-100 shrink-0" />

                        {/* Asientos */}
                        <div className="shrink-0">
                            <p className="text-xs text-gray-400 mb-1">Reservas</p>
                            <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                <Users size={14} className="text-gray-400" />
                                <span className="font-mono font-semibold">
                                    {vueloProximo.asientos?.ocupados ?? '—'}
                                    <span className="text-gray-400 font-normal"> / {vueloProximo.asientos?.capacidadAeronave ?? '—'}</span>
                                </span>
                            </div>
                        </div>

                        <div className="w-px h-8 bg-gray-100 shrink-0" />

                        {/*cancelaciones*/}
                        {/******************MODIFICAR*********************** */}
                        <div className="shrink-0">
                            <p className="text-xs text-gray-400 mb-1">Cancelaciones</p>
                            <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                <Ban size={14} className="text-gray-400" />
                                <span className="font-mono font-semibold">
                                    {vueloProximo.asientos?.ocupados ?? '—'}
                                </span>
                            </div>
                        </div>

                        <div className="ml-auto">
                            <BadgeEstado estado={vueloProximo.estado} />
                        </div>

                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-5 py-4 text-gray-400">
                        <CalendarDays size={16} className="text-gray-300" />
                        <p className="text-sm">No hay vuelos próximos programados</p>
                    </div>
                )}
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
                    
                    

                </div>

                {/* vuelos proximos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">

                    <div className="flex items-center gap-2 p-5 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Plane size={16} className="text-blue-900" />
                        </div>
                        <h3 className="font-semibold text-gray-800"> Vuelos programados</h3>
                        <p className="text-xs text-gray-400 mt-1">Vuelos disponibles para reservar.</p>
                    </div>

                    <div className="p-5">
                        <div>
                            <div>
                            {vuelos.length === 0 ? (
                                <div className="flex flex-col items-center py-6 text-center">
                                    <CalendarDays size={28} className="text-gray-200 mb-2" />
                                    <p className="text-sm text-gray-400 font-medium">No se encontraron vuelos próximos</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs text-gray-400 mb-1">
                                        {vuelos.length} vuelo{vuelos.length !== 1 ? 's' : ''} encontrado{vuelos.length !== 1 ? 's' : ''}
                                    </p>
                                    {vuelosPaginados.map(v => (
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
                                            {/*
                                            <BadgeEstado estado={v.estado} />
                                            */}
                                            </div>
                                                
                                        </div>  
                                        <BarraAsientos asientos={v.asientos} />
                                    </div>
                                    ))
                                    }
                                    <div className="flex justify-center">
                                        <div className="flex items-center gap-2">
                                            <BotonPrimario
                                                onClick={() => setPaginaActual(paginaActual - 1)}
                                                disabled={paginaActual === 1}
                                                texto="Anterior"
                                            />
                                            <span className="text-gray-400">
                                                {paginaActual} de {totalPaginas}
                                            </span>
                                            <BotonPrimario
                                                onClick={() => setPaginaActual(paginaActual + 1)}
                                                disabled={paginaActual === totalPaginas}
                                                texto="Siguiente"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                            )
                            }
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
    )
}

export default Inicio
