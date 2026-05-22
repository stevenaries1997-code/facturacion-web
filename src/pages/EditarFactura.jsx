import {
  useEffect,
  useState
} from 'react'

import {
  useNavigate,
  useParams
} from 'react-router-dom'

import MainLayout from '../layouts/MainLayout'

import { db } from '../firebase/config'

import {
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore'

function EditarFactura() {

  const { id } = useParams()

  const navigate = useNavigate()

  const [factura, setFactura] = useState(null)

  // OBTENER FACTURA

  const obtenerFactura = async () => {

    try {

      const docRef = doc(
        db,
        'facturas',
        id
      )

      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {

        setFactura(docSnap.data())

      }

    } catch (error) {

      console.log(error)

    }
  }

  useEffect(() => {

    obtenerFactura()

  }, [])

  // EDITAR PRODUCTO

  const editarProducto = (
    index,
    campo,
    valor
  ) => {

    const nuevosProductos = [
      ...factura.productos
    ]

    nuevosProductos[index][campo] = valor

    // RECALCULAR

    const cajas = Number(
      nuevosProductos[index].cajas || 0
    )

    const unidades = Number(
      nuevosProductos[index].unidades || 0
    )

    const precio = Number(
      nuevosProductos[index].precio || 0
    )

    let totalUnidades = 0

    let subtotal = 0

    if (cajas > 0) {

      totalUnidades =
        cajas * unidades

      subtotal =
        cajas * precio

    } else {

      totalUnidades = unidades

      subtotal =
        unidades * precio
    }

    nuevosProductos[index].totalUnidades =
      totalUnidades

    nuevosProductos[index].subtotal =
      subtotal

    // TOTAL FACTURA

    const nuevoTotal =
      nuevosProductos.reduce(
        (acc, producto) =>
          acc + producto.subtotal,
        0
      )

    setFactura({

      ...factura,

      productos: nuevosProductos,

      total: nuevoTotal
    })
  }

  // GUARDAR

  const guardarCambios = async () => {

    try {

      const docRef = doc(
        db,
        'facturas',
        id
      )

      await updateDoc(docRef, {
        productos: factura.productos,
        total: factura.total
      })

      alert('Factura actualizada')

      navigate('/historial')

    } catch (error) {

      console.log(error)

    }
  }

  if (!factura) {

    return (
      <MainLayout>
        <p>Cargando...</p>
      </MainLayout>
    )
  }

  return (

    <MainLayout>

      <h1 className="text-4xl font-bold mb-8">
        Editar Factura
      </h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-900 text-white">

            <tr>

              <th className="p-4 text-left">
                Producto
              </th>

              <th className="p-4 text-left">
                Cajas
              </th>

              <th className="p-4 text-left">
                Unidades
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

            {factura.productos.map(
              (producto, index) => (

                <tr
                  key={index}
                  className="border-b"
                >

                  <td className="p-4">
                    {producto.descripcion}
                  </td>

                  <td className="p-4">

                    <input
                      type="number"
                      value={producto.cajas}
                      onChange={(e) =>
                        editarProducto(
                          index,
                          'cajas',
                          e.target.value
                        )
                      }
                      className="border p-2 rounded w-24"
                    />

                  </td>

                  <td className="p-4">

                    <input
                      type="number"
                      value={producto.unidades}
                      onChange={(e) =>
                        editarProducto(
                          index,
                          'unidades',
                          e.target.value
                        )
                      }
                      className="border p-2 rounded w-24"
                    />

                  </td>

                  <td className="p-4">

                    <input
                      type="number"
                      value={producto.precio}
                      onChange={(e) =>
                        editarProducto(
                          index,
                          'precio',
                          e.target.value
                        )
                      }
                      className="border p-2 rounded w-32"
                    />

                  </td>

                  <td className="p-4 font-bold text-green-600">

                    $

                    {Number(
                      producto.subtotal
                    ).toLocaleString('es-CO')}

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

      <div className="flex justify-end mt-8">

        <div className="bg-white p-6 rounded-2xl shadow w-80">

          <h2 className="text-2xl font-bold mb-4">
            Total
          </h2>

          <p className="text-4xl font-bold text-green-600">

            $

            {Number(
              factura.total
            ).toLocaleString('es-CO')}

          </p>

          <button
            onClick={guardarCambios}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
          >
            Guardar Cambios
          </button>

        </div>

      </div>

    </MainLayout>
  )
}

export default EditarFactura