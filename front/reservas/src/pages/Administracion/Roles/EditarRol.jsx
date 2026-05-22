import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRol, actualizarRol } from '../../../services/roles'
import { BotonPrimario, BotonSecundario } from '../../../components/ui/Button'
import toast, { Toaster } from 'react-hot-toast'
import { listarRoles } from '../../../services/roles'
import { limpiarRut } from '../../../utils/helpers'
import { UserPen } from 'lucide-react'

function EditarRol() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)
    const [cargando, setCargando] = useState(true)
    const [form, setForm]       = useState(
        {
            id: id,
            nombre: '',
            tipo: '',
            nivel: ''
        }
    )

    function set(name, value) {
        setForm(prev => ({ ...prev, [name]: value }))
    }

    useEffect(() => {
        async function datos() {
            try{
                const rol = await getRol(id)
                setForm({
                    id: rol.id,
                    nombre: rol.nombre,
                    tipo: rol.tipo,
                    nivel: rol.nivel,
                })
            }catch(err){
                setError(err.message)
            }finally{
                setCargando(false)
            }
        }
    })


    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            await actualizarRol({
                ...form
            })
            toast.success('Rol actualizado correctamente')
            setTimeout(() => {
                navigate('/admin/roles')
            }, 2000)
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
                    <h2 className="text-2xl font-bold text-blue-900 flex gap-2"><UserPen/> Actualizar Rol</h2>
                    <p className="text-gray-400 text-sm mt-1">Modifica los datos del rol..</p>
                </div>
                <button
                    onClick={() => navigate('/admin/roles')}
                    className="text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium"
                >
                    ← Volver
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex gap-6 items-start">
                     {cargando ? (
                        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
                            <div className="flex-1 flex items-center justify-center py-20 gap-2 text-gray-400 text-sm">
                                <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-900 rounded-full animate-spin" />
                                Cargando datos ...
                            </div>
                        </div>
                    ) : form.nombre ? (
                    <>
                    {/* Tarjeta del formulario */}
                    <div className="flex-1 bg-white rounded-lg shadow-sm p-6">

                        <div className="grid grid-cols-8 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="nombre">Nombre</label>
                                <input id="rut" type="text" placeholder="Ej: Administrador"
                                    value={form.nombre}
                                    onChange={e => set('nombre', e.target.value)}
                                    className={inputClass} />
                            </div>

                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="tipo">Tipo</label>
                                <select
                                    id="tipo"
                                    value={form.tipo}
                                    onChange={e => set('tipo', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Seleccionar…</option>
                                    
                                    <option value="ejecutivo">Ejecutivo</option>
                                    <option value="no_ejecutivo">No ejecutivo</option>
                                    <option value="guardia">Guardia</option>
                                    <option value="dap">DAP</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="nivel">Nivel</label>
                                <select
                                    id="nivel"
                                    value={form.nivel}
                                    onChange={e => set('nivel', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Seleccionar…</option>
                                    
                                    <option value="1">Nivel 1</option>
                                    <option value="2">Nivel 2</option>
                                    <option value="3">Nivel 3</option>
                                    <option value="4">Nivel 4</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    </>
                    ) : (
                    <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
                        <p className="text-md text-gray-400 text-center">Sin datos</p>
                    </div>
                    )   }
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 mt-5">
                    <BotonPrimario
                        tipo="submit"
                        texto={loading ? 'Guardando...' : 'Guardar Rol'}
                        disabled={loading}
                    />
                    <BotonSecundario
                        type="button"
                        onClick={() => navigate('/admin/roles')}
                        texto="Cancelar"
                    />

                </div>
            </form>
            <Toaster />
        </div>
    )
}

export default EditarRol;
