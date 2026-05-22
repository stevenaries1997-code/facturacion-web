import { Link } from 'react-router-dom'

import { useEffect, useState } from 'react'

import MainLayout from '../layouts/MainLayout'

import { db } from '../firebase/config'

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore'

function Historial() {

  const [facturas, setFacturas] = useState([])

  // OBTENER FACTURAS

  const obtenerFacturas = async () => {

    try {

      const querySnapshot = await getDocs(
        collection(db, 'facturas')
      )

      const listaFacturas = []

      querySnapshot.forEach((documento) => {

        listaFacturas.push({

          id: documento.id,

          ...documento.data()

        })
      })

      setFacturas(listaFacturas)

    } catch (error) {

      console.log(error)

    }
  }

  // ELIMINAR FACTURA

  const eliminarFactura = async (id) => {

    const confirmar = window.confirm(
      '¿Eliminar factura?'
    )

    if (!confirmar) return

    try {

      await deleteDoc(
        doc(db, 'facturas', id)
      )

      // RECARGAR FACTURAS

      obtenerFacturas()

    } catch (error) {

      console.log(error)

    }
  }

  // CARGAR FACTURAS

  useEffect(() => {

    obtenerFacturas()

  }, [])

  return (

    <MainLayout>

      <h1 className="text-4xl font-bold mb-8">

        Historial Facturas

      </h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-900 text-white">

            <tr>

                <th className="p-4 text-left">
  Factura
                </th>

                <th className="p-4 text-left">
                Cliente
                </th>

              <th className="p-4 text-left">
                Fecha
              </th>

              <th className="p-4 text-left">
                Productos
              </th>

              <th className="p-4 text-left">
                Total
              </th>

              <th className="p-4 text-left">
                Acción
              </th>

            </tr>

          </thead>

          <tbody>

            {facturas.map((factura) => (

              <tr
                key={factura.id}
                className="border-b hover:bg-gray-100"
              >

                {/* FECHA */}

                <td className="p-4">
                    <td className="p-4 font-bold">
                    {factura.numeroFactura}
                    </td>

                    <td className="p-4">
                    {factura.cliente}
                    </td>
                  {
                    factura.fecha?.seconds
                      ? new Date(
                          factura.fecha.seconds * 1000
                        ).toLocaleString()
                      : 'Sin fecha'
                  }

                </td>

                {/* PRODUCTOS */}

                <td className="p-4">

                  {factura.productos.length}

                </td>

                {/* TOTAL */}

                <td className="p-4 font-bold text-green-600">

                  $

                  {Number(factura.total).toLocaleString(
                    'es-CO'
                  )}

                </td>

                {/* BOTONES */}

             <td className="p-4 flex gap-2">

            <Link
                to={`/factura/${factura.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
                Ver
            </Link>

            <Link
                to={`/editar-factura/${factura.id}`}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
                Editar
            </Link>

            <button
                onClick={() =>
                eliminarFactura(factura.id)
                }
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
                Eliminar
            </button>

            </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </MainLayout>
  )
}

export default Historial