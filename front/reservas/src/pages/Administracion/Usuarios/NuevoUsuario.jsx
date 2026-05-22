import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearUsuario } from '../../../services/usuarios'
import { BotonPrimario, BotonSecundario } from '../../../components/ui/Button'
import toast, { Toaster } from 'react-hot-toast'
import { listarRoles } from '../../../services/roles'
import { limpiarRut } from '../../../utils/helpers'
import { UserPlus } from 'lucide-react'
import { mayusculas } from '../../../utils/helpers'

function NuevoUsuario() {
    const navigate = useNavigate()
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)
    const [roles, setRoles] = useState([])
    const [form, setForm]       = useState(
        {
            rut: '',
            nombre: '',
            primer_apellido: '',
            segundo_apellido: '',
            email: '',
            rol_id: 1,
            empresa: '',
            password: '',
            password_confirmation: '',
            cargo: '',
            activo: true,
            requiere_preferencia: false,
            asiento: '',
            ubicacion: '',

        }
    )

    function set(name, value) {
        setForm(prev => ({ ...prev, [name]: value }))
    }

    function handleRolChange(newRolId) {
        const nuevoRol = roles.find(r => String(r.id) === String(newRolId))
        const esPassenger = ['pasajero', 'ejecutivo'].includes(nuevoRol?.tipo?.toLowerCase())
        setForm(prev => ({
            ...prev,
            rol_id: newRolId,
            ...(!esPassenger && {
                requiere_preferencia: false,
                asiento: '',
                ubicacion: '',
            }),
        }))
    }

    function verContraseña() {
        form.password != form.password_confirmation ? setError('Las contraseñas no coinciden') : setError('')
    }

    useEffect(() => {
        listarRoles()
            .then(data => setRoles(Array.isArray(data) ? data : []))
            .catch(() => {})
    },[])

    async function handleSubmit(e) {
        e.preventDefault()
        if (form.password !== form.password_confirmation) {
            setError('Las contraseñas no coinciden')
            return
        }
        setLoading(true)
        try {
            await crearUsuario({
                ...form
            })
            toast.success('Usuario creado correctamente')
            setTimeout(() => {
                navigate('/admin/usuarios')
            }, 2000)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const rolSeleccionado = roles.find(r => String(r.id) === String(form.rol_id))
    const mostrarPreferencia = ['pasajero', 'ejecutivo'].includes(rolSeleccionado?.tipo?.toLowerCase())

    const inputClass = "w-full p-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-blue-900"
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1"

    return (
        <div className="p-8">

            {/* Encabezado */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 flex gap-2"><UserPlus/> Ingresar Usuario</h2>
                    <p className="text-gray-400 text-sm mt-1">Completa los datos del nuevo usuario.</p>
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

                        {/* Sección informacion personal*/}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                            Información personal
                        </h3>

                        <div className="grid grid-cols-8 gap-4 mb-6">
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="rut">Rut
                                    <span className="font-normal text-gray-400 ml-1 text-xs">Sin puntos y con guión</span>
                                </label>
                                
                                <input id="rut" type="text" placeholder="Ej: 11111111-1"
                                    value={limpiarRut(form.rut)}
                                    onChange={e => set('rut', limpiarRut(e.target.value))}
                                    className={inputClass} />
                            </div>

                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="nombre">Nombre</label>
                                <input id="nombre" type="text" placeholder="Ej: Juan"
                                    value={form.nombre}
                                    onChange={e => set('nombre', e.target.value)}
                                    className={inputClass} />
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="primer_apellido">Apellido Paterno</label>
                                <input id="primer_apellido" type="text" placeholder="Ej: Perez"
                                    value={form.primer_apellido}
                                    onChange={e => set('primer_apellido', e.target.value)}
                                    className={inputClass} />
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="segundo_apellido">Apellido Materno</label>
                                <input id="segundo_apellido" type="text" placeholder="Ej: Perez"
                                    value={form.segundo_apellido}
                                    onChange={e => set('segundo_apellido', e.target.value)}
                                    className={inputClass} />
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="email">Correo</label>
                                <input id="email" type="text" placeholder="Ej: juanperez@dap.cl"
                                    value={form.email}
                                    onChange={e => set('email', e.target.value)}
                                    className={inputClass} />
                            </div>
                        </div>
                        {/* Sección informacion personal*/}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                            Información laboral
                        </h3>

                        <div className="grid grid-cols-8 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="empresa">Empresa</label>
                                <input id="empresa" type="text" placeholder="Ej: Aerovías DAP"
                                    value={form.empresa}
                                    onChange={e => set('empresa', e.target.value)}
                                    className={inputClass} />
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="cargo">Cargo</label>
                                <input id="cargo" type="text" placeholder="Ej: Gerente"
                                    value={form.cargo}
                                    onChange={e => set('cargo', e.target.value)}
                                    className={inputClass} />
                            </div>

                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="rol">Rol</label>
                                <select
                                    id="rol"
                                    value={form.rol_id}
                                    onChange={e => handleRolChange(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Seleccionar…</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {mayusculas(r.nombre)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* preferencia asientos — solo para roles pasajero/ejecutivo */}
                        {mostrarPreferencia && (<>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                            Preferencia de Asientos
                        </h3>

                        <div className="grid grid-cols-8 gap-4 mb-6">
                            <div className="col-span-2">
                                <div className={`rounded-lg border p-4 transition-colors ${
                                    form.requiere_preferencia
                                        ? 'border-blue-900 bg-blue-50'
                                        : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                            form.requiere_preferencia
                                                ? 'bg-blue-900 border-blue-900'
                                                : 'bg-white border-gray-300'
                                        }`}>
                                            {form.requiere_preferencia && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={form.requiere_preferencia}
                                            onChange={e => set('requiere_preferencia', e.target.checked)}
                                            className="hidden"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Requiere preferencia de asiento</p>
                                            <p className="text-xs text-gray-400 mt-0.5">El sistema respetará la preferencia al asignar asientos</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            {/* si requiere preferencia se muestran los campos */}
                            {form.requiere_preferencia && (
                            <>
                                <div className="col-span-2">
                                    <label className={labelClass} htmlFor="asiento">Asiento asignado</label>
                                    <input id="asiento" type="text" placeholder="Ej: 1B"
                                        value={form.asiento}
                                        onChange={e => set('asiento', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelClass} htmlFor="ubicacion">Ubicación</label>
                                    <select
                                        id="ubicacion"
                                        value={form.ubicacion}
                                        onChange={e => set('ubicacion', e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Seleccionar…</option>
                                        <option value="ventana">Ventana</option>
                                        <option value="pasillo">Pasillo</option>
                                        <option value="medio">Medio</option>
                                    </select>
                                </div>
                            </>
                            )}
                        </div>
                        </>)}

                        {/* autenticación s*/}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                            Autenticación
                        </h3>

                        <div className="grid grid-cols-8 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="password">Nueva Contraseña</label>
                                <input id="password" type="password" placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => set('password', e.target.value)}
                                    className={inputClass} />
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="password_confirmation">Confirmar Contraseña</label>
                                <input id="password_confirmation" type="password" placeholder="••••••••"
                                    value={form.password_confirmation}
                                    onChange={e => set('password_confirmation', e.target.value)}
                                    onBlur={verContraseña}
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
                        texto={loading ? 'Ingresando...' : 'Ingresar Usuario'}
                        disabled={loading}
                    />
                    <BotonSecundario
                        type="button"
                        onClick={() => navigate('/admin/usuarios')}
                        texto="Cancelar"
                    />

                </div>
            </form>
            <Toaster />
        </div>
    )
}

export default NuevoUsuario;
