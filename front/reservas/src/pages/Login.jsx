import logo from '../assets/logo/logoDAP.png';
import img from '../assets/LT101.jpg';
import { useState } from 'react';
import { login, saveSession } from '../services/auth';
import { useNavigate } from 'react-router-dom'

function Login() {
    const navigate = useNavigate();
    const [rut, setRut] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e){
        e.preventDefault();
        setError("");
        setLoading(true);

        try{
        const data = await login(rut, password);
        saveSession(data);
        navigate('/inicio');
        }catch(err){
        setError(err.message);
        }finally{
        setLoading(false);
        }

    }

  return (
  <>
  <div className="min-h-screen flex items-center justify-center ">
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-10 w-full max-w-md shadow-2xl">
      <img src={logo} alt="logo" className="w-24 mx-auto mb-6" />
      <h1 className="text-center text-blue-900 text-2xl font-bold mb-1">
        Bienvenido
      </h1>
      <p className="text-center text-blue-900 text-sm mb-8">
        Sistema de Reservas — Aerovías DAP
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-blue-900 text-sm mb-1 block">Ingrese su RUT</label>
          <input
            className="w-full p-3 rounded-lg border border-gray-100 text-blue-900 placeholder-gray-300 focus:outline-none focus:border-blue-900"
            type="text"
            placeholder="12345678-9"
            onChange={(e) => setRut(e.target.value)}
          />
        </div>
        <div>
          <label className="text-blue-900 text-sm mb-1 block">Contraseña</label>
          <input
            className="w-full p-3 rounded-lg border border-gray-100 text-blue-900 placeholder-gray-300 focus:outline-none focus:border-blue-900"
            type="password"
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold p-3 rounded-lg mt-2 transition-colors"
        onClick={handleSubmit}>
          {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
        </button>
      </div>

    </div>
  </div>
</>
  )
}

export default Login;
