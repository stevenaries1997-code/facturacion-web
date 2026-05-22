import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Facturacion from '../pages/Facturacion'
import Productos from '../pages/Productos'
import Historial from '../pages/Historial'
import DetalleFactura from '../pages/DetalleFactura'
import EditarFactura from '../pages/EditarFactura'
import ProtectedRoute from './ProtectedRoute'
import Facturas from '../pages/Facturas'
import ConsultarFacturas from '../pages/ConsultarFacturas'
// Importamos el componente de Backup
import Backup from '../pages/Backup'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* FACTURACION */}
        <Route
          path="/facturacion"
          element={
            <ProtectedRoute>
              <Facturacion />
            </ProtectedRoute>
          }
        />

        {/* CONSULTAR FACTURAS */}
        <Route
          path="/consultar-facturas"
          element={
            <ProtectedRoute>
              <ConsultarFacturas />
            </ProtectedRoute>
          }
        />

        {/* PRODUCTOS */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          }
        />

        {/* FACTURAS GENERAL */}
        <Route
          path="/facturas"
          element={
            <ProtectedRoute>
              <Facturas />
            </ProtectedRoute>
          }
        />

        {/* RUTA CON PARÁMETRO DE FECHA */}
        <Route
          path="/facturas/:fecha"
          element={
            <ProtectedRoute>
              <Facturas />
            </ProtectedRoute>
          }
        />

        {/* HISTORIAL */}
        <Route
          path="/historial"
          element={
            <ProtectedRoute>
              <Historial />
            </ProtectedRoute>
          }
        />

        {/* COPIA DE SEGURIDAD (BACKUP) */}
        <Route
          path="/backup"
          element={
            <ProtectedRoute>
              <Backup />
            </ProtectedRoute>
          }
        />

        {/* DETALLE FACTURA */}
        <Route
          path="/factura/:id"
          element={
            <ProtectedRoute>
              <DetalleFactura />
            </ProtectedRoute>
          }
        />

        {/* EDITAR FACTURA */}
        <Route
          path="/editar-factura/:id"
          element={
            <ProtectedRoute>
              <EditarFactura />
            </ProtectedRoute>
          }
        />

        {/* RUTA NO EXISTE - REDIRECCIÓN DE CONTROL */}
        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter