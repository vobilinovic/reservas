import { getUsuario } from '../../services/auth'

function Reservas() {
  const usuario = getUsuario()

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Reservas
      </h2>
      <p className="text-gray-500">Módulo en construcción.</p>
    </div>
  )
}

export default Reservas
