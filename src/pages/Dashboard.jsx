import MainLayout from '../layouts/MainLayout'

function Dashboard() {
  return (
    <MainLayout>

      <h1 className="text-4xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold">
            Ventas del día
          </h2>

          <p className="text-3xl mt-4 font-bold text-green-600">
            $0
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold">
            Facturas
          </h2>

          <p className="text-3xl mt-4 font-bold text-blue-600">
            0
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold">
            Productos
          </h2>

          <p className="text-3xl mt-4 font-bold text-purple-600">
            0
          </p>
        </div>

      </div>

    </MainLayout>
  )
}

export default Dashboard