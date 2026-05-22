import logo from '../assets/logo/logoDAP.png';
import img from '../assets/LT101.jpg';
import { useState } from 'react';
import { login, saveSession, recuperarPassword, resetearPassword } from '../services/auth';
import { useNavigate } from 'react-router-dom'
import { BotonPrimario, BotonSecundario } from '../components/ui/Button'
import { limpiarRut } from '../utils/helpers';
import toast, { Toaster } from 'react-hot-toast'

function Login() {
  const navigate = useNavigate();
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  //si dio click en recuperar, recuperar = true
  const [recuperar, setRecuperar] = useState(false);
  const [correo, setCorreo] = useState("");
  // "enviando codigo"
  const [loadingCodigo, setLoadingCodigo] = useState(false);
  // pasos de recuperacion
  const [paso, setPaso] = useState(0);
  // codigo ingresado por el usuario
  const [codigo, setCodigo] = useState("");
  // token dado por el back
  const [token, setToken] = useState("");
  // nueva contraseña
  const [passwordNew, setPasswordNew] = useState("");
  // confirmacion de nueva contraseña
  const [passwordConfirm, setPasswordConfirm] = useState("");

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

  async function enviarCodigo(e){
    e.preventDefault();
    setError("");
    setLoadingCodigo(true);
    
    try{
      const data = await recuperarPassword(correo);
      setToken(data.token)
      toast.success("Código de recuperación enviado");
    }catch(err){
      setError(err.message);
    }finally{
      setLoadingCodigo(false);
      //setRecuperar(false);
      setPaso(2);
    }
  }

  async function compararCodigo(e){
    e.preventDefault();
    if(token === codigo){
      setPaso(3);
      setError("")
    }else{
      setError("Código de recuperación incorrecto");
    }
  }

  async function compararPass(e){
    if (passwordNew !== passwordConfirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (passwordNew.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setError("")
    try{
      console.log('correo:', correo)
      console.log('token:', token)
      console.log('passwordNew:', passwordNew)
      console.log('passwordConfirm:', passwordConfirm)
      const data = await resetearPassword(correo, token, passwordNew, passwordConfirm);
      toast.success("Contraseña actualizada correctamente");
    }catch(err){
      setError(err.message);
    }finally{
      setRecuperar(false);
      setPaso(0);
      setCodigo("");
      setToken("");
      setPasswordNew("");
      setPasswordConfirm("");
      setCorreo("");
    }
   
  }

  return (
  <>
  <div className="min-h-screen flex items-center justify-center ">
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-10 w-full max-w-md shadow-2xl">
      <img src={logo} alt="logo" className="w-36 mx-auto mb-6" />
      <h1 className="text-center text-blue-900 text-2xl font-bold mb-1">
        Bienvenido
      </h1>
      <p className="text-center text-blue-900 text-sm mb-8">Sistema de Reservas</p>
      {!recuperar ? (
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-blue-900 text-sm mb-1 block">RUT<span className="font-normal text-gray-400 ml-1 text-xs">Sin puntos y con guión</span></label>
          <input
            className="w-full p-3 rounded-lg border border-gray-100 text-blue-900 placeholder-gray-300 focus:outline-none focus:border-blue-900"
            type="text"
            placeholder="12345678-9"
            onChange={(e) => setRut(limpiarRut(e.target.value))}
            value={limpiarRut(rut)}
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
        <BotonPrimario
          onClick={handleSubmit}
          texto = {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
        />
        <BotonSecundario
          onClick={() => { setRecuperar(true); setPaso(1) }}
          texto = {"Recuperar Contraseña"}
        />
      </div>
      ) : paso === 1 ? ( //paso 1: se ingresa el correo
      <div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-blue-900 text-sm mb-1 block">Ingrese su correo electrónico</label>
            <input
              className="w-full p-3 rounded-lg border border-gray-100 text-blue-900 placeholder-gray-300 focus:outline-none focus:border-blue-900"
              type="text"
              placeholder="correo@ejemplo.cl"
              onChange={(e) => setCorreo(e.target.value)}
              value = {correo}
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <BotonPrimario
            onClick={(e) => enviarCodigo(e)}
            texto = {loadingCodigo ? "Enviando..." : "Enviar Código"}
            disabled={loadingCodigo}
          />
          <BotonSecundario
            onClick={() => { setRecuperar(false); setPaso(0); setCodigo(""); setToken(""); setPasswordNew(""); setCorreo("") }}
            texto = {"Regresar"}
          />
        </div>
      </div>
      ) : paso === 2 ? ( //paso 2: se ingresa el codigo recibido
        <div>
          <div className="flex flex-col gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-800">
              Revise su bandeja de entrada — le enviamos un código de recuperación a <span className="font-semibold">{correo}</span>.
            </div>
            <div>
              <label className="text-blue-900 text-sm mb-1 block">Ingrese código de recuperación</label>
              <input
                className="w-full p-3 rounded-lg border border-gray-100 text-blue-900 placeholder-gray-300 focus:outline-none focus:border-blue-900"
                type="text"
                onChange={(e) => setCodigo(e.target.value)}
                value = {codigo}
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <BotonPrimario
              onClick={(e) => compararCodigo(e)}
              texto = {"Continuar"}
            />
            <BotonSecundario
              onClick={() => { setRecuperar(false); setPaso(0); setCodigo(""); setToken(""); setPasswordNew(""); setCorreo("") }}
              texto = {"Regresar"}
            />
          </div>
        </div>

      ) : paso === 3 ?( //paso 3: se ingresa la nueva contraseña
        <div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-blue-900 text-sm mb-1 block">Ingrese nueva contraseña</label>
              <input
                className="w-full p-3 rounded-lg border border-gray-100 text-blue-900 placeholder-gray-300 focus:outline-none focus:border-blue-900"
                type="password"
                placeholder="••••••••"
                onChange={(e) => setPasswordNew(e.target.value)}
                value = {passwordNew}
              />
            </div>
            <div>
              <label className="text-blue-900 text-sm mb-1 block">Repita contraseña</label>
              <input
                className="w-full p-3 rounded-lg border border-gray-100 text-blue-900 placeholder-gray-300 focus:outline-none focus:border-blue-900"
                type="password"
                placeholder="••••••••"
                onChange={(e) => setPasswordConfirm(e.target.value)}
                value = {passwordConfirm}
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <BotonPrimario
              onClick={(e) => compararPass(e)}
              texto = {"Continuar"}
            />
            <BotonSecundario
              onClick={() => { setRecuperar(false); setPaso(0); setCodigo(""); setToken(""); setPasswordNew(""); setCorreo("") }}
              texto = {"Regresar"}
            />
          </div>
        </div>
      ) : (
        <div>

        </div>
      )}
    
    </div>
  </div>
  <Toaster/>
</>
);
}

export default Login;
