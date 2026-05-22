import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { usuario, loading } = useContext(AuthContext)

  // Si Firebase está verificando, esperamos (podrías poner un spinner aquí)
  if (loading) {
    return <div>Cargando...</div>
  }

  // Solo si la carga terminó y no hay usuario, mandamos al login
  if (!usuario) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute