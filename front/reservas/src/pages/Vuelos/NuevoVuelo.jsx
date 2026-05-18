import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BotonPrimario } from '../../components/ui/Button'
import { getAeronavesSelect } from '../../services/aeronaves'
import { listarRutas } from '../../services/rutas'
import { crearVuelo } from '../../services/vuelos'

function NuevoVuelo() {
    const navigate = useNavigate()
    const [aeronaves, setAeronaves] = useState([])
    const [rutas, setRutas]         = useState([])
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)
    const [form, setForm]       = useState({
        num_vuelo:    '',
        id_aeronave:  '',
        id_origen:    '',
        id_destino:   '',
        fecha_vuelo:  new Date().toISOString().split('T')[0],
        hora_salida:  '',
        hora_llegada: '',
        estado:       'programado',
    })

    function set(name, value) {
        setForm(prev => ({ ...prev, [name]: value }))
    }

    useEffect(() => {
        getAeronavesSelect()
            .then(data => setAeronaves(Array.isArray(data) ? data : []))
            .catch(() => {})
        listarRutas()
            .then(data => setRutas(Array.isArray(data) ? data.filter(r => r.estado) : []))
            .catch(() => {})
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await crearVuelo({
                ...form,
                id_aeronave:  parseInt(form.id_aeronave),
                id_origen:    parseInt(form.id_origen),
                id_destino:   parseInt(form.id_destino),
                hora_llegada: form.hora_llegada || null,   // string vacío → null
            })
            navigate('/vuelos')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full p-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-blue-900"
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1"

    return (
        <div className="p-8">

            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Ingresar Vuelo</h2>
                    <p className="text-gray-400 text-sm mt-1">Completa los datos del nuevo vuelo programado.</p>
                </div>
                <button
                    onClick={() => navigate('/vuelos')}
                    className="text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium"
                >
                    ← Volver
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex gap-6 items-start">

                    <div className="flex-1 bg-white rounded-lg shadow-sm p-6">

                        {/* Identificación */}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                            Identificación del Vuelo
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
                        </div>

                        {/* Ruta */}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                            Ruta
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
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                            Horario
                        </h3>
                        <div className="grid grid-cols-8 gap-4">
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="fecha_vuelo">Fecha</label>
                                <input
                                    id="fecha_vuelo"
                                    type="date"
                                    value={form.fecha_vuelo}
                                    onChange={e => set('fecha_vuelo', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
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
                        texto={loading ? 'Guardando…' : 'Guardar Vuelo'}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => navigate('/vuelos')}
                        className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    )
}

export default NuevoVuelo
