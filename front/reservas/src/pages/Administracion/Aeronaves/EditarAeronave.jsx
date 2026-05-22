import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAeronave, actualizarAeronave } from '../../../services/aeronaves'
import { BotonPrimario, BotonSecundario } from '../../../components/ui/Button'
import toast, { Toaster } from 'react-hot-toast'
import { Plane } from 'lucide-react'
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/* ---- Previsualización de cabina ---- */
function PreviewCabina({ filas, columnas_config, pasillo_despues_de, filas_emergencia }) {
    const cols = columnas_config
        ? columnas_config.split(',').map(c => c.trim()).filter(Boolean)
        : []
    const emergencia = filas_emergencia
        ? filas_emergencia.split(',').map(f => parseInt(f.trim())).filter(n => !isNaN(n))
        : []
    const nFilas = parseInt(filas) || 0

    if (cols.length === 0 || nFilas === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm text-center leading-relaxed">
                Ingresa filas y columnas<br />para ver la previsualización
            </div>
        )
    }

    const rowsToShow = Math.min(nFilas)

    const renderFila = (rowNum) =>
        cols.flatMap((col, j) => {
            const isEmergencia = emergencia.includes(rowNum)
            const elements = []
            if (j > 0 && cols[j - 1] === pasillo_despues_de) {
                elements.push(<div key={`aisle-${rowNum}-${j}`} className="w-2 flex-shrink-0" />)
            }
            elements.push(
                <div key={`seat-${rowNum}-${col}`}
                    className={`w-4 h-4 flex-shrink-0 rounded-sm border ${
                        isEmergencia
                            ? 'bg-red-50 border-red-400'
                            : 'bg-blue-100 border-blue-900'
                    }`}
                />
            )
            return elements
        })

    return (
        <div className="overflow-y-auto max-h-72">
            {/* Cabecera de columnas */}
            <div className="flex gap-1 mb-1.5 pl-6">
                {cols.flatMap((col, j) => {
                    const els = []
                    if (j > 0 && cols[j - 1] === pasillo_despues_de) {
                        els.push(<div key={`ah-${j}`} className="w-2" />)
                    }
                    els.push(
                        <div key={`h-${col}`}
                            className="w-4 text-center text-xs font-bold font-mono text-gray-400">
                            {col}
                        </div>
                    )
                    return els
                })}
            </div>

            {/* Filas */}
            {Array.from({ length: rowsToShow }, (_, i) => {
                const rowNum = i + 1
                return (
                    <div key={rowNum} className="flex items-center gap-1 mb-0.5">
                        <span className="w-5 text-right mr-0.5 text-xs text-gray-400 font-mono">
                            {rowNum}
                        </span>
                        {renderFila(rowNum)}
                    </div>
                )
            })}

            
        </div>
    )
}

/* ---- Página principal ---- */
function EditarAeronave() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)
    const [cargando, setCargando] = useState(true)
    const [form, setForm]       = useState({
        id: id,
        tipo: '', 
        matricula: '', 
        filas: '', 
        columnas: '',
        columnas_config: '',
        pasillo_despues_de: '', 
        filas_emergencia: '', 
        estado: true,
    })

    useEffect(() => {
        async function datosAeronave() {
            try {
                const aeronave = await getAeronave(id)
                setForm({
                    id: aeronave.id,
                    tipo: aeronave.tipo,
                    matricula: aeronave.matricula,
                    filas: aeronave.filas,
                    columnas: aeronave.columnas,
                    columnas_config: aeronave.columnas_config,
                    pasillo_despues_de: aeronave.pasillo_despues_de,
                    filas_emergencia: aeronave.filas_emergencia,
                    estado: aeronave.estado,
                })
            } catch (err) {
                setError(err.message)
            } finally {
                setCargando(false)
            }
        }
        datosAeronave()
    }, [id])

    useEffect(() => {
        const n = parseInt(form.columnas)
        if (n > 0 && n <= 26) {
            const config = Array.from({ length: n }, (_, i) => LETRAS[i]).join(',')
            setForm(prev => ({ ...prev, columnas_config: config, pasillo_despues_de: '' }))
        }
    }, [form.columnas])

    const columnasOpciones = form.columnas_config
        ? form.columnas_config.split(',').map(c => c.trim()).filter(Boolean)
        : []

    function set(name, value) {
        setForm(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await actualizarAeronave({
                id: form.id,
                ...form,
                filas:    parseInt(form.filas),
                columnas: parseInt(form.columnas),
            })
            toast.success('Aeronave actualizada correctamente')
            setTimeout(() => {
                navigate('/admin/aeronaves')
            }, 2000)
        } catch (err) {
            setError(err.message)
            toast.error(err.message)
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
                    <h2 className="text-2xl font-bold text-blue-900 flex gap-2"><Plane/> Editar Aeronave</h2>
                    <p className="text-gray-400 text-sm mt-1">Modifica los datos de la aeronave.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/aeronaves')}
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
                            Identificación
                        </h3>

                        <div className="grid grid-cols-8 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="tipo">Tipo</label>
                                <select id="tipo" value={form.tipo}
                                    onChange={e => set('tipo', e.target.value)}
                                    className={inputClass}>
                                    <option value="">Seleccionar…</option>
                                    <option value="RJ85">RJ85</option>
                                    <option value="RJ100">RJ100</option>
                                </select>
                            </div>

                            <div className="col-span-3">
                                <label className={labelClass} htmlFor="matricula">Matrícula</label>
                                <input id="matricula" type="text" placeholder="CC-AJS"
                                    value={form.matricula}
                                    onChange={e => set('matricula', e.target.value.toUpperCase())}
                                    className={inputClass} />
                            </div>
                        </div>

                        {/* Sección Distribución */}
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                            Distribución de Cabina
                        </h3>

                        <div className="grid grid-cols-8 gap-4 mb-4">
                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="filas">Filas</label>
                                <input id="filas" type="number" placeholder="24"
                                    value={form.filas}
                                    onChange={e => set('filas', e.target.value)}
                                    className={inputClass} />
                            </div>

                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="columnas">Columnas</label>
                                <input id="columnas" type="number" placeholder="6"
                                    value={form.columnas}
                                    onChange={e => set('columnas', e.target.value)}
                                    className={inputClass} />
                            </div>

                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="config">
                                    Config. columnas
                                    <span className="font-normal text-gray-400 ml-1 text-xs">(auto)</span>
                                </label>
                                <input id="config" type="text" placeholder="A,B,C,D,E,F"
                                    value={form.columnas_config}
                                    onChange={e => set('columnas_config', e.target.value.toUpperCase())}
                                    className={inputClass} />
                            </div>

                            <div className="col-span-2">
                                <label className={labelClass} htmlFor="pasillo">Pasillo después de</label>
                                <select id="pasillo" value={form.pasillo_despues_de}
                                    onChange={e => set('pasillo_despues_de', e.target.value)}
                                    disabled={columnasOpciones.length === 0}
                                    className={inputClass}>
                                    <option value="">–</option>
                                    {columnasOpciones.slice(0, -1).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-8 gap-4 mb-4">
                            <div className="col-span-4">
                                <label className={labelClass} htmlFor="emergencia">
                                    Filas de emergencia
                                    <span className="font-normal text-gray-400 ml-1 text-xs">(opcional)</span>
                                </label>
                                <input id="emergencia" type="text" placeholder="9,10"
                                    value={form.filas_emergencia}
                                    onChange={e => set('filas_emergencia', e.target.value)}
                                    className={inputClass} />
                                <p className="text-xs text-gray-400 mt-1">Separar con coma. Ej: 9,10</p>
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

                    {/* ── Panel previsualización ── */}
                    <div className="w-64 flex-shrink-0 bg-white rounded-lg shadow-sm p-5 text-center">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                            Previsualización
                        </p>
                        <PreviewCabina
                            filas={form.filas}
                            columnas_config={form.columnas_config}
                            pasillo_despues_de={form.pasillo_despues_de}
                            filas_emergencia={form.filas_emergencia}
                        />
                        {form.columnas_config && form.filas && (
                            <div className="flex gap-3 mt-3 flex-wrap">
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <div className="w-3.5 h-3.5 rounded-sm bg-blue-100 border border-blue-900" />
                                    Normal
                                </div>
                                {form.filas_emergencia && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <div className="w-3.5 h-3.5 rounded-sm bg-red-50 border border-red-400" />
                                        Emergencia
                                    </div>
                                )}
                            </div>
                        )}
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
                        texto={loading ? 'Guardando…' : 'Guardar Aeronave'}
                        disabled={loading}
                    />
                    <BotonSecundario
                        type="button"
                        onClick={() => navigate('/admin/aeronaves')}
                        texto="Cancelar"
                    />
                </div>
            </form>
           <Toaster/>
        </div>
        
    )
}

export default EditarAeronave;
