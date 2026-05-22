import jsPDF from 'jspdf'

import autoTable from 'jspdf-autotable'

import {
  useEffect,
  useState
} from 'react'

import {
  useParams
} from 'react-router-dom'

import MainLayout from '../layouts/MainLayout'

import { db } from '../firebase/config'

import {
  doc,
  getDoc
} from 'firebase/firestore'

function DetalleFactura() {

  const { id } = useParams()

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

  // DESCARGAR PDF

  const descargarPDF = () => {

    const documento = new jsPDF()

    // TITULO

    documento.setFontSize(22)

    documento.text(
      'FACTURA',
      14,
      20
    )
    documento.text(
  `Factura: ${factura.numeroFactura}`,
  14,
  30
)

documento.text(
  `Cliente: ${factura.cliente}`,
  14,
  38
)

    // FECHA

    documento.setFontSize(12)

    documento.text(

      `Fecha: ${
        factura.fecha?.seconds
          ? new Date(
              factura.fecha.seconds * 1000
            ).toLocaleString()
          : ''
      }`,

      14,

      30
    )

    // TABLA

    autoTable(documento, {

      startY: 50,

      head: [[
        'Código',
        'Producto',
        'Cajas',
        'Unidades',
        'Precio',
        'Total'
      ]],

      body: factura.productos.map(
        (producto) => [

          producto.codigo,

          producto.descripcion,

          producto.cajas || 0,

          producto.totalUnidades,

          `$${Number(
            producto.precio
          ).toLocaleString('es-CO')}`,

          `$${Number(
            producto.subtotal
          ).toLocaleString('es-CO')}`
        ]
      )

    })

    // TOTAL

    documento.setFontSize(18)

    documento.text(

      `TOTAL: $${Number(
        factura.total
      ).toLocaleString('es-CO')}`,

      14,

      documento.lastAutoTable.finalY + 20
    )

    // DESCARGAR

    documento.save('factura.pdf')
  }

  // IMPRIMIR

  const imprimirFactura = () => {

    window.print()

  }

  if (!factura) {

    return (

      <MainLayout>

        <p>Cargando factura...</p>

      </MainLayout>
    )
  }

  return (

    <MainLayout>

      <h1 className="text-4xl font-bold mb-6">

        Detalle Factura

      </h1>

      {/* BOTONES */}

      <div className="flex gap-4 mb-6">

        <button
          onClick={descargarPDF}
          className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700"
        >
          Descargar PDF
        </button>

        <button
          onClick={imprimirFactura}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
        >
          Imprimir
        </button>

      </div>

      {/* INFO */}

      <div className="bg-white p-6 rounded-2xl shadow mb-8">
    <p className="mb-2">

  <strong>Factura:</strong>

  {factura.numeroFactura}

            </p>

            <p className="mb-2">

            <strong>Cliente:</strong>

            {factura.cliente}

            </p>
        <p className="mb-2">

          <strong>Fecha:</strong>

          {

            factura.fecha?.seconds
              ? new Date(
                  factura.fecha.seconds * 1000
                ).toLocaleString()
              : 'Sin fecha'

          }

        </p>

        <p>

          <strong>Total:</strong>

          $

          {Number(factura.total).toLocaleString(
            'es-CO'
          )}

        </p>

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
                    {producto.codigo}
                  </td>

                  <td className="p-4">
                    {producto.descripcion}
                  </td>

                  <td className="p-4">
                    {producto.cajas || 0}
                  </td>

                  <td className="p-4">
                    {producto.totalUnidades}
                  </td>

                  <td className="p-4">

                    $

                    {Number(
                      producto.precio
                    ).toLocaleString('es-CO')}

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

    </MainLayout>
  )
}

export default DetalleFactura