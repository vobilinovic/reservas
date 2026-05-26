import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BotonPrimario } from '../../components/ui/Button'
import { getAeronavesSelect } from '../../services/aeronaves'
import { listarRutas } from '../../services/rutas'
import { crearVuelo } from '../../services/vuelos'
import { Plane, CalendarClock, Route, Clock, CornerDownLeft, Check } from 'lucide-react'
import { Breadcrumb } from '../../components/ui/Breadcrumb'

function CargaMasiva() {
    const navigate = useNavigate()
    const [aeronaves, setAeronaves] = useState([])
    const [rutas, setRutas]         = useState([])
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)
    const [retorno, setRetorno]   = useState(false)
    const [pasos, setPasos]      = useState(1) //paso 1: crear, paso 2: confirmar
    const [creados, setCreados]  = useState(0)
    const [form, setForm]       = useState({
        frecuencia:           [],
        num_vuelo:            '',
        id_aeronave:          '',
        id_origen:            '',
        id_destino:           '',
        fecha_inicio:         new Date().toISOString().split('T')[0],
        fecha_fin:            new Date().toISOString().split('T')[0],
        hora_salida:          '',
        hora_llegada:         '',
        cupo:                  80,
        estado:               'programado',
        // retorno
        num_vuelo_retorno:     '',
        hora_salida_retorno:   '',
        hora_llegada_retorno:  '',
        dias_offset_retorno:   0,
        cupo_retorno: 80,
    })

    function set(name, value) {
        setForm(prev => ({ ...prev, [name]: value }))
    }

    useEffect(() => {
        getAeronavesSelect()
            .then(data => setAeronaves(Array.isArray(data) ? data : []))
            .catch(err => setError('Error al cargar aeronaves: ' + err.message))
        listarRutas()
            .then(data => setRutas(Array.isArray(data) ? data.filter(r => r.estado) : []))
            .catch(() => {})
    }, [])

    async function handleSubmit() {
        setError('')
        setLoading(true)
        const vuelos = generarVuelos()
        try {
            await Promise.all(vuelos.map(v => crearVuelo({
                num_vuelo:    v.num_vuelo,
                id_aeronave:  parseInt(form.id_aeronave),
                id_origen:    parseInt(v.origen?.id),
                id_destino:   parseInt(v.destino?.id),
                fecha_vuelo:  v.fecha,
                hora_salida:  v.hora_salida,
                hora_llegada: v.hora_llegada || null,
                estado:       form.estado,
                cupo:         v.tipo === 'retorno' ? parseInt(form.cupo_retorno) : parseInt(form.cupo),
            })))
            setCreados(vuelos.length)
            setPasos(3)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full p-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-blue-900"
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1"

    // Genera la lista de vuelos a partir del rango + días seleccionados
    function generarVuelos() {
        const DIA_MAP = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 0 }
        const diasNums    = form.frecuencia.map(d => DIA_MAP[d])
        const origenRuta  = rutas.find(r => String(r.id) === String(form.id_origen))
        const destinoRuta = rutas.find(r => String(r.id) === String(form.id_destino))

        const lista   = []
        const inicio  = new Date(form.fecha_inicio + 'T12:00:00')
        const fin     = new Date(form.fecha_fin    + 'T12:00:00')

        for (let cursor = new Date(inicio); cursor <= fin; cursor.setDate(cursor.getDate() + 1)) {
            if (!diasNums.includes(cursor.getDay())) continue
            const fecha = cursor.toISOString().split('T')[0]

            lista.push({
                fecha,
                num_vuelo:   form.num_vuelo,
                origen:      origenRuta,
                destino:     destinoRuta,
                hora_salida: form.hora_salida,
                hora_llegada: form.hora_llegada,
                tipo: 'ida',
            })

            if (retorno && form.num_vuelo_retorno) {
                const dRetorno = new Date(cursor)
                dRetorno.setDate(dRetorno.getDate() + Number(form.dias_offset_retorno))
                const fechaRetorno = dRetorno.toISOString().split('T')[0]
                lista.push({
                    fecha:        fechaRetorno,
                    num_vuelo:    form.num_vuelo_retorno,
                    origen:       destinoRuta, //se invierten origen y destino
                    destino:      origenRuta,
                    hora_salida:  form.hora_salida_retorno,
                    hora_llegada: form.hora_llegada_retorno,
                    tipo: 'retorno',
                })
            }
        }
        return lista
    }

    const STEPS = [
        { n: 1, label: 'Crear vuelos' },
        { n: 2, label: 'Confirmación'         },
        { n: 3, label: 'Vuelos creados'   },
    ]

    return (
        <div className="p-8">

            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 flex gap-2"><Plane/> Carga Masiva</h2>
                    <p className="text-gray-400 text-sm mt-1">Completa los datos para cargar múltiples vuelos.</p>
                </div>
                <Breadcrumb items={[{ texto: 'Administración', href: '/admin' }, { texto: 'Vuelos', href: '/admin/vuelos' }, { texto: 'Carga Masiva' }]} />
            </div>
            {/* Stepper */}
            <div className="flex items-center w-full mb-6">
                {STEPS.map((step, i) => {
                    const completado = pasos > step.n
                    const activo     = pasos === step.n
                    return (
                        <div key={step.n} className="flex items-center flex-1 last:flex-none">
                            <div className="flex items-center gap-2 shrink-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                    completado || activo ? 'bg-blue-900 shadow-sm' : 'bg-white border-2 border-gray-200'
                                }`}>
                                    {completado
                                        ? <Check size={13} className="text-white" />
                                        : <span className={`text-xs font-bold ${activo ? 'text-white' : 'text-gray-400'}`}>{step.n}</span>
                                    }
                                </div>
                                <span className={`text-sm whitespace-nowrap transition-all duration-300 ${
                                    activo     ? 'font-semibold text-blue-900' :
                                    completado ? 'font-medium text-blue-900'   :
                                                'font-normal text-gray-400'
                                }`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`h-px flex-1 mx-3 transition-all duration-300 ${
                                    pasos > step.n ? 'bg-blue-900' : 'bg-gray-200'
                                }`} />
                            )}
                        </div>
                    )
                })}
            </div>
            {pasos === 1 && (
            <form onSubmit={handleSubmit}>
                <div className="flex gap-6 items-start">

                    <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
                        {/* Frecuencia */}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1">
                            <CalendarClock size={16} className="text-gray-300" /> Frecuencia
                        </h3>
                        <div className="grid grid-cols-8 gap-4 mb-6">
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="fecha_inicio">Fecha Inicio</label>
                                <input
                                    id="fecha_inicio"
                                    type="date"
                                    value={form.fecha_inicio}
                                    onChange={e => set('fecha_inicio', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="fecha_fin">Fecha Término</label>
                                <input
                                    id="fecha_fin"
                                    type="date"
                                    value={form.fecha_fin}
                                    min={form.fecha_inicio}
                                    onChange={e => set('fecha_fin', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div className="col-span-6">
                                <label className={labelClass}>Días</label>
                                <div className="flex flex-wrap gap-8 align-center mt-3">
                                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => (
                                        <label key={dia} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.frecuencia.includes(dia)}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        set('frecuencia', [...form.frecuencia, dia])
                                                    } else {
                                                        set('frecuencia', form.frecuencia.filter(d => d !== dia))
                                                    }
                                                }}
                                                className="w-4 h-4 accent-blue-900 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-700">{dia}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                        </div>

                        {/* Identificación */}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1">
                            <Plane size={16} className="text-gray-300" /> Identificación del Vuelo
                        </h3>
                        <div className="grid grid-cols-8 gap-4 mb-6">
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="num_vuelo">N° Vuelo</label>
                                <input
                                    id="num_vuelo"
                                    type="text"
                                    placeholder="DAP542"
                                    value={form.num_vuelo}
                                    onChange={e => set('num_vuelo', e.target.value.toUpperCase())}
                                    className={inputClass}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="id_aeronave">Aeronave</label>
                                <select
                                    id="id_aeronave"
                                    value={form.id_aeronave}
                                    onChange={e => set('id_aeronave', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Seleccionar…</option>
                                    {aeronaves.map(a => (
                                        <option key={a.id} value={a.id}>{a.matricula} — {a.tipo}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="estado">Estado</label>
                                <select
                                    id="estado"
                                    value={form.estado}
                                    onChange={e => set('estado', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="programado">Programado</option>
                                    <option value="embarcando">Embarcando</option>
                                    <option value="en_vuelo">En vuelo</option>
                                    <option value="aterrizado">Aterrizado</option>
                                    <option value="demorado">Demorado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="cupo">Cupo Pasajeros</label>
                                <input
                                    id="cupo"
                                    type="number"
                                    placeholder="80"
                                    value={form.cupo}
                                    onChange={e => set('cupo', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Ruta */}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1">
                            <Route size={16} className="text-gray-300" /> Ruta
                        </h3>
                        <div className="grid grid-cols-8 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="id_origen">Origen</label>
                                <select
                                    id="id_origen"
                                    value={form.id_origen}
                                    onChange={e => set('id_origen', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Seleccionar…</option>
                                    {rutas.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.codigo} — {r.ciudad}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="id_destino">Destino</label>
                                <select
                                    id="id_destino"
                                    value={form.id_destino}
                                    onChange={e => set('id_destino', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Seleccionar…</option>
                                    {rutas.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.codigo} — {r.ciudad}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Horario */}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1">
                            <Clock size={16} className="text-gray-300"/>Horario
                        </h3>
                        <div className="grid grid-cols-8 gap-4 mb-6">
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="hora_salida">Hora Salida</label>
                                <input
                                    id="hora_salida"
                                    type="time"
                                    value={form.hora_salida}
                                    onChange={e => set('hora_salida', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="hora_llegada">
                                    Hora Llegada
                                    <span className="font-normal text-gray-400 ml-1 text-xs">(opcional)</span>
                                </label>
                                <input
                                    id="hora_llegada"
                                    type="time"
                                    value={form.hora_llegada}
                                    onChange={e => set('hora_llegada', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        {/* Retorno */}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1">
                            <CornerDownLeft size={16} className="text-gray-300"/>Retorno
                        </h3>
                        <div className="grid grid-cols-8 gap-4">
                            <div className="col-span-1">
                                <div className="flex flex-wrap gap-2 align-center">
                                    <input
                                        type="checkbox"
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setRetorno(true)
                                            } else {
                                                setRetorno(false)
                                            }
                                        }}
                                        className="w-4 h-4 accent-blue-900 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700">Incluir Retorno</span>
                                </div>
                            </div>
                            {retorno && (
                                <>
                                <div className="col-span-1">
                                    <label className={labelClass} htmlFor="dias_offset_retorno">Días después</label>
                                    <select
                                        id="dias_offset_retorno"
                                        value={form.dias_offset_retorno}
                                        onChange={e => set('dias_offset_retorno', e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value={0}>Mismo día</option>
                                        <option value={1}>1 día después</option>
                                        <option value={2}>2 días después</option>
                                        <option value={3}>3 días después</option>
                                        <option value={4}>4 días después</option>
                                        <option value={5}>5 días después</option>
                                        <option value={6}>6 días después</option>
                                        <option value={7}>7 días después</option>
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className={labelClass} htmlFor="num_vuelo_retorno">N° Vuelo de Retorno</label>
                                    <input
                                        id="num_vuelo_retorno"
                                        type="text"
                                        placeholder="DAP543"
                                        value={form.num_vuelo_retorno}
                                        onChange={e => set('num_vuelo_retorno', e.target.value.toUpperCase())}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className={labelClass} htmlFor="hora_salida_retorno">Hora Salida</label>
                                    <input
                                        id="hora_salida_retorno"
                                        type="time"
                                        value={form.hora_salida_retorno}
                                        onChange={e => set('hora_salida_retorno', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className={labelClass} htmlFor="hora_llegada_retorno">
                                        Hora Llegada
                                        <span className="font-normal text-gray-400 ml-1 text-xs">(opcional)</span>
                                    </label>
                                    <input
                                        id="hora_llegada_retorno"
                                        type="time"
                                        value={form.hora_llegada_retorno}
                                        onChange={e => set('hora_llegada_retorno', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className={labelClass} htmlFor="cupo_retorno">Cupo Pasajeros</label>
                                    <input
                                        id="cupo_retorno"
                                        type="number"
                                        placeholder="80"
                                        value={form.cupo_retorno}
                                        onChange={e => set('cupo_retorno', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>

                                </>
                            )}
                        </div>         
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 mt-5">
                    <BotonPrimario
                        tipo="submit"
                        texto={'Siguiente'}
                        disabled={loading}
                        onClick={() => setPasos(2)}
                    />
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
            )}
            {pasos === 2 && (() => {
                const vuelos = generarVuelos()
                return (
                <div className="bg-white rounded-xl shadow-sm">

                    {/* Encabezado */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-800">Se crearán los siguientes vuelos</h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Revisa el listado antes de confirmar
                            </p>
                        </div>
                        <span className="bg-blue-50 text-blue-900 text-sm font-bold px-3 py-1 rounded-full">
                            {vuelos.length} vuelo{vuelos.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {vuelos.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-center text-gray-400">
                            <Plane size={32} className="mb-3 text-gray-200" />
                            <p className="text-sm font-medium">Sin vuelos para generar</p>
                            <p className="text-xs text-gray-300 mt-1">Revisa el rango de fechas y los días seleccionados</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">N° Vuelo</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Fecha</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ruta</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Salida</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Llegada</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vuelos.map((v, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3">
                                                <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md text-xs">
                                                    {v.num_vuelo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-700">
                                                {new Date(v.fecha + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="font-mono font-bold text-gray-800">{v.origen?.codigo}</span>
                                                <span className="text-gray-300 mx-1.5">→</span>
                                                <span className="font-mono font-bold text-gray-800">{v.destino?.codigo}</span>
                                            </td>
                                            <td className="px-6 py-3 font-mono text-gray-700">{v.hora_salida || '—'}</td>
                                            <td className="px-6 py-3 font-mono text-gray-400">{v.hora_llegada || '—'}</td>
                                            <td className="px-6 py-3">
                                                {v.tipo === 'retorno'
                                                    ? <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Retorno</span>
                                                    : <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">Ida</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                        <BotonPrimario
                            tipo="button"
                            texto={loading ? 'Creando...' : `Crear ${vuelos.length} vuelo${vuelos.length !== 1 ? 's' : ''}`}
                            disabled={loading || vuelos.length === 0}
                            onClick={handleSubmit}
                        />
                        <button
                            type="button"
                            onClick={() => setPasos(1)}
                            className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            ← Volver
                        </button>
                    </div>

                </div>
                )
            })()}

            {pasos === 3 && (
                <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-20 text-center px-8">
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
                        <Check size={28} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        ¡Vuelos creados exitosamente!
                    </h3>
                    <p className="text-gray-400 text-sm mb-8">
                        Se crearon <span className="font-bold text-blue-900">{creados} vuelo{creados !== 1 ? 's' : ''}</span> correctamente.
                    </p>
                    <div className="flex gap-3">
                        <BotonPrimario
                            tipo="button"
                            texto="Ver vuelos"
                            onClick={() => navigate('/vuelos')}
                        />
                        <button
                            type="button"
                            onClick={() => { setPasos(1); setCreados(0) }}
                            className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Nueva carga
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CargaMasiva
