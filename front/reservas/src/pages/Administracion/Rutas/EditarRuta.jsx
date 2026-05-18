import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRuta, actualizarRuta } from '../../../services/rutas'
import { BotonPrimario, BotonSecundario } from '../../../components/ui/Button'

function EditarRuta() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [error, setError]       = useState('')
    const [loading, setLoading]   = useState(false)
    const [cargando, setCargando] = useState(true)
    const [form, setForm]         = useState({
        ciudad:      '',
        region:      '',
        codigo:      '',
        descripcion: '',
        estado:      true,
    })

    // Al montar el componente, cargamos los datos actuales de la ruta
    useEffect(() => {
        async function cargar() {
            try {
                const ruta = await getRuta(id)
                setForm({
                    ciudad:      ruta.ciudad,
                    region:      ruta.region,
                    codigo:      ruta.codigo,
                    descripcion: ruta.descripcion ?? '',
                    estado:      ruta.estado,
                })
            } catch (err) {
                setError(err.message)
            } finally {
                setCargando(false)
            }
        }
        cargar()
    }, [id])

    function set(name, value) {
        setForm(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await actualizarRuta(id, form)
            navigate('/admin/rutas')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full p-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-blue-900"
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1"

    if (cargando) {
        return (
            <div className="p-8 text-sm text-gray-400">Cargando ruta...</div>
        )
    }

    return (
        <div className="p-8">

            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Editar Ruta</h2>
                    <p className="text-gray-400 text-sm mt-1">Modifica los datos de la ruta.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/rutas')}
                    className="text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium"
                >
                    &larr; Volver
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex gap-6 items-start">

                    {/* Tarjeta del formulario */}
                    <div className="flex-1 bg-white rounded-lg shadow-sm p-6">

                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                            Informacion
                        </h3>

                        <div className="grid grid-cols-8 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="ciudad">Ciudad</label>
                                <input id="ciudad" type="text" placeholder="Ej: Santiago"
                                    value={form.ciudad}
                                    onChange={e => set('ciudad', e.target.value)}
                                    className={inputClass} />
                            </div>

                            <div className="col-span-3">
                                <label className={labelClass} htmlFor="region">Region</label>
                                <input id="region" type="text" placeholder="Ej: Metropolitana"
                                    value={form.region}
                                    onChange={e => set('region', e.target.value)}
                                    className={inputClass} />
                            </div>

                            <div className="col-span-3">
                                <label className={labelClass} htmlFor="codigo">Codigo</label>
                                <input id="codigo" type="text" placeholder="Ej: SCL"
                                    value={form.codigo}
                                    onChange={e => set('codigo', e.target.value)}
                                    className={inputClass} />
                            </div>

                            <div className="col-span-8">
                                <label className={labelClass} htmlFor="descripcion">Descripcion
                                    <span className="font-normal text-gray-400 ml-1 text-xs">(opcional)</span>
                                </label>
                                <input id="descripcion" type="text" placeholder="Ej: Aeropuerto Internacional Comodoro Arturo Merino Benitez"
                                    value={form.descripcion}
                                    onChange={e => set('descripcion', e.target.value)}
                                    className={inputClass} />
                            </div>
                        </div>

                        {/* Estado */}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                            Estado
                        </h3>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => set('estado', true)}
                                className={`px-4 rounded-lg text-sm font-semibold border transition-colors ${
                                    form.estado
                                        ? 'bg-green-100 text-green-800 border-green-800'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-green-800'
                                }`}
                            >
                                Activo
                            </button>
                            <button
                                type="button"
                                onClick={() => set('estado', false)}
                                className={`px-4 rounded-lg text-sm font-semibold border transition-colors ${
                                    !form.estado
                                        ? 'bg-red-100 text-red-600 border-red-600'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-red-400'
                                }`}
                            >
                                Inactivo
                            </button>
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
                        texto={loading ? 'Guardando...' : 'Guardar Cambios'}
                        disabled={loading}
                    />
                    <BotonSecundario
                        type="button"
                        onClick={() => navigate('/admin/rutas')}
                        texto="Cancelar"
                    />
                </div>
            </form>
        </div>
    )
}

export default EditarRuta
