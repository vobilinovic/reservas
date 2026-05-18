import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearRuta } from '../../../services/rutas'
import { BotonPrimario } from '../../../components/ui/Button'


function NuevaRuta() {
    const navigate = useNavigate()
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)
    const [form, setForm]       = useState(
        {
            ciudad: '',
            region: '',
            codigo: '',
            descripcion: '',
            estado: true,
        }
    )

    function set(name, value) {
        setForm(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await crearRuta({
                ...form
            })
            navigate('/admin/rutas')
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
                    <h2 className="text-2xl font-bold text-blue-900">Ingresar Ruta</h2>
                    <p className="text-gray-400 text-sm mt-1">Completa los datos de la nueva ruta.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/rutas')}
                    className="text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium"
                >
                    ← Volver
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex gap-6 items-start">

                    {/* Tarjeta del formulario */}
                    <div className="flex-1 bg-white rounded-lg shadow-sm p-6">

                        {/* Sección Identificación */}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                            Información
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
                                <label className={labelClass} htmlFor="region">Región</label>
                                <input id="region" type="text" placeholder="Ej: Metropolitana"
                                    value={form.region}
                                    onChange={e => set('region', e.target.value)}
                                    className={inputClass} />
                            </div>

                            <div className="col-span-3">
                                <label className={labelClass} htmlFor="codigo">Código</label>
                                <input id="codigo" type="text" placeholder="Ej: SCL"
                                    value={form.codigo}
                                    onChange={e => set('codigo', e.target.value)}
                                    className={inputClass} />
                            </div>

                            <div className="col-span-8">
                                <label className={labelClass} htmlFor="descripcion">Descripción
                                    <span className="font-normal text-gray-400 ml-1 text-xs">(opcional)</span>
                                </label>
                                <input id="descripcion" type="text" placeholder="Ej: Aeropuerto Internacional Comodoro Arturo Merino Benítez"
                                    value={form.descripcion}
                                    onChange={e => set('descripcion', e.target.value)}
                                    className={inputClass} />
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
                        texto={loading ? 'Guardando…' : 'Guardar Ruta'}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => navigate('/admin/rutas')}
                        className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    )
}

export default NuevaRuta;
