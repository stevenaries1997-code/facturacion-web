import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Facturacion from '../pages/Facturacion'
import Productos from '../pages/Productos'
import Historial from '../pages/Historial'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/facturacion" element={<Facturacion />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/historial" element={<Historial />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter