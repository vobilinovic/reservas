import { getUsuario } from '../../services/auth'
import { BotonPrimario } from '../../components/ui/Button'
import { Plus } from 'lucide-react'

function MisReservas() {
  const usuario = getUsuario()

  return (
    <div className="p-8">

        {/* Encabezado */}
        <div className="flex items-start justify-between mb-6">
            <div>
                <h2 className="text-2xl font-bold text-blue-900">Mis Reservas</h2>
                <p className="text-gray-400 text-sm mt-1">Gestionar sus reservas para realizar solicitudes especiales o generar su Boarding Pass.</p>
            </div>
            <BotonPrimario
                icono = {<Plus />}
                texto="Ingresar Reserva"
                onClick={() => navigate('/admin/aeronaves/nueva')}
            />
        </div>
    </div>

  )
}

export default MisReservas
