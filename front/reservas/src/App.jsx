import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'

import InicioEjecutivo from './pages/Inicio/InicioEjecutivo'
import InicioAdmin from './pages/Inicio/InicioAdmin'

import Reservas from './pages/Reservas/Reservas'
import MisReservas from './pages/Reservas/MisReservas'
import NuevaReserva from './pages/Reservas/NuevaReserva'
import DetalleReserva from './pages/Reservas/DetalleReserva'
import ModificarReserva from './pages/Reservas/ModificarReserva'

import Aeronaves from './pages/Administracion/Aeronaves/Aeronaves'
import NuevaAeronave from './pages/Administracion/Aeronaves/NuevaAeronave'
import EditarAeronave from './pages/Administracion/Aeronaves/EditarAeronave'

import Vuelos from './pages/Vuelos/Vuelos'
import VuelosNuevo from './pages/Vuelos/NuevoVuelo'
import EditarVuelo from './pages/Vuelos/EditarVuelo'
import CargaMasiva from './pages/Vuelos/CargaMasiva'
import DetalleVuelo from './pages/Vuelos/DetalleVuelo'

import Rutas from './pages/Administracion/Rutas/Rutas'
import NuevaRuta from './pages/Administracion/Rutas/NuevaRuta'
import EditarRuta from './pages/Administracion/Rutas/EditarRuta'

import Usuarios from './pages/Administracion/Usuarios/Usuarios'
import NuevoUsuario from './pages/Administracion/Usuarios/NuevoUsuario'
import EditarUsuario from './pages/Administracion/Usuarios/EditarUsuario'

import Roles from './pages/Administracion/Roles/Roles'
import NuevoRol from './pages/Administracion/Roles/NuevoRol'
import EditarRol from './pages/Administracion/Roles/EditarRol'

import { getToken, getUsuario } from './services/auth'
import Layout from './components/Layout'
import Inicio from './pages/Inicio/InicioEjecutivo'

function ProtectedRoute({ minNivel, children }) {
  const token = getToken()
  const usuario = getUsuario()
  const rol = usuario?.rol_id
  const rol_nivel = usuario?.rol_nivel

  if (!token) {
    return <Navigate to="/" />
  }

  if (minNivel && rol_nivel < minNivel) {
    return <Navigate to="/inicio" />
  }

  return children
}

function InicioSegunRol({ usuario }) {
    // usuario.rol contiene el nombre del rol (ej: 'admin', 'operador', 'ejecutivo')
    if (usuario?.rol === 'admin')
        return <InicioAdmin />
    return <InicioEjecutivo />
}

function App() {
  const usuario = getUsuario()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/inicio"
          element={
            <ProtectedRoute minNivel = {1}>
              <Layout>
                <InicioSegunRol usuario={usuario} />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/*RESERVAS*/}
        <Route
          path="/reservas"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <Reservas />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute minNivel = {1}>
              <Layout>
                <MisReservas />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas/nueva/:id"
          element={
            <ProtectedRoute minNivel = {1}>
              <Layout>
                <NuevaReserva />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas/detalle/:id"
          element={
            <ProtectedRoute minNivel = {1}>
              <Layout>
                <DetalleReserva />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas/modificar/:id"
          element={
            <ProtectedRoute minNivel = {1}>
              <Layout>
                <ModificarReserva />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/*AERONAVES*/}
        <Route
          path="/admin/aeronaves"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <Aeronaves />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/aeronaves/nueva"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <NuevaAeronave />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/aeronaves/editar/:id"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <EditarAeronave />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/*VUELOS*/}
        <Route
          path="/admin/vuelos"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <Vuelos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vuelos/nuevo"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <VuelosNuevo />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vuelos/editar/:id"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <EditarVuelo />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vuelos/carga-masiva"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <CargaMasiva />
              </Layout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/admin/vuelos/detalle/:id"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <DetalleVuelo />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/*RUTAS*/}
        <Route
          path="/admin/rutas"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <Rutas />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rutas/nueva"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <NuevaRuta />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rutas/editar/:id"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <EditarRuta />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/*USUARIOS*/}
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <Usuarios />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios/nuevo"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <NuevoUsuario />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios/editar/:id"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <EditarUsuario />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/*ROLES*/}
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <Roles />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles/nuevo"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <NuevoRol />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles/editar/:id"
          element={
            <ProtectedRoute minNivel = {3}>
              <Layout>
                <EditarRol />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      
    </BrowserRouter>
  )
}

export default App