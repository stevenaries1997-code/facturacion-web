import MainLayout from '../layouts/MainLayout'

function Facturacion() {

  const productos = [
    {
      codigo: '001',
      descripcion: 'AGUILA LIGHT',
      cantidad: 10,
      precio: 2500,
      total: 25000
    },

    {
      codigo: '002',
      descripcion: 'POKER',
      cantidad: 5,
      precio: 3000,
      total: 15000
    }
  ]

  return (
    <MainLayout>

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Facturación
        </h1>

        <div className="flex gap-4">

          <button className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700">
            Guardar Factura
          </button>

          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
            Nuevo Cliente
          </button>

          <button className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700">
            Finalizar Día
          </button>

        </div>

      </div>

      {/* TABLA */}

      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-900 text-white">

            <tr>

              <th className="p-4 text-left">
                Código
              </th>

              <th className="p-4 text-left">
                Descripción
              </th>

              <th className="p-4 text-left">
                Cantidad
              </th>

              <th className="p-4 text-left">
                Precio
              </th>

              <th className="p-4 text-left">
                Total
              </th>

            </tr>

          </thead>

          <tbody>

            {productos.map((producto, index) => (

              <tr
                key={index}
                className="border-b hover:bg-gray-100"
              >

                <td className="p-4">
                  {producto.codigo}
                </td>

                <td className="p-4">
                  {producto.descripcion}
                </td>

                <td className="p-4">
                  {producto.cantidad}
                </td>

                <td className="p-4">
                  ${producto.precio}
                </td>

                <td className="p-4 font-bold text-green-600">
                  ${producto.total}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* TOTAL */}

      <div className="flex justify-end mt-8">

        <div className="bg-white p-6 rounded-2xl shadow w-80">

          <h2 className="text-2xl font-bold mb-4">
            Total Factura
          </h2>

          <p className="text-4xl font-bold text-green-600">
            $40.000
          </p>

        </div>

      </div>

    </MainLayout>
  )
}

export default Facturacion