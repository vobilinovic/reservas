import { BotonSecundario, BotonDanger } from './ui/Button'
import { Trash } from 'lucide-react'

export default function ModalEliminar({ data, onConfirmar, onCancelar, eliminando, tipo }) {
    console.log(data)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Fondo oscuro */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onCancelar}
            />

            {/* Tarjeta del modal */}
            <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">

                {/* Icono */}
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                    <Trash size={22} className="text-red-600" />
                </div>

                <h3 className="text-center text-base font-bold text-gray-800 mb-1">
                    {tipo === 'ruta' ? '¿Esta seguro de eliminar la ruta?' : 
                    tipo === 'aeronave' ? '¿Esta seguro de eliminar la aeronave?' : 
                    tipo === 'usuario' ? '¿Esta seguro de eliminar el usuario?' :
                    tipo === 'rol' ? '¿Esta seguro de eliminar el rol?' :
                    ''}
                </h3>
                <p className="text-center text-sm font-semibold text-blue-900 mb-5">
                    {tipo === 'ruta' ? data.ciudad :
                    tipo === 'aeronave' ? data.matricula : 
                    tipo === 'usuario' ? data.nombre :
                    tipo === 'rol' ? data.nombre :
                    ''}
                    {tipo === 'ruta' ? 
                    <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold">
                        {data.codigo}
                    </span>
                    : ''}
                </p>
                <p className="text-center text-xs text-gray-400 mb-6">
                    Esta accion no se puede deshacer.
                </p>

                <div className="flex gap-3">
                    <BotonSecundario
                        type="button"
                        onClick={onCancelar}
                        disabled={eliminando}
                        texto="Cancelar"
                        clase={'w-full'}
                    />
                    <BotonDanger
                        type="button"
                        onClick={onConfirmar}
                        disabled={eliminando}
                        texto={eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                        clase={'w-full'}
                    />
                </div>

            </div>
        </div>
    )
}