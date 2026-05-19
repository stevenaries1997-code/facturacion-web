import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">

      <h1 className="text-2xl font-bold mb-10">
        LICOEXPRESS
      </h1>

      <nav className="flex flex-col gap-4">

        <Link
          to="/dashboard"
          className="hover:bg-gray-700 p-3 rounded-lg"
        >
          Dashboard
        </Link>

        <Link
          to="/facturacion"
          className="hover:bg-gray-700 p-3 rounded-lg"
        >
          Facturación
        </Link>

        <Link
          to="/productos"
          className="hover:bg-gray-700 p-3 rounded-lg"
        >
          Productos
        </Link>

        <Link
          to="/historial"
          className="hover:bg-gray-700 p-3 rounded-lg"
        >
          Historial
        </Link>

      </nav>

    </div>
  )
}

export default Sidebar