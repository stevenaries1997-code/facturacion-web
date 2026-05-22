import { useEffect, useState } from 'react'

import MainLayout from '../layouts/MainLayout'

import {
  FaDollarSign,
  FaFileInvoiceDollar,
  FaBoxOpen,
  FaChartLine,
  FaHistory
} from 'react-icons/fa'

import { db } from '../firebase/config'

import {
  collection,
  getDocs
} from 'firebase/firestore'

function Dashboard() {

  const [facturas, setFacturas] = useState([])

  const [totalVentas, setTotalVentas] = useState(0)

  const [cantidadFacturas, setCantidadFacturas] = useState(0)

  const [cantidadProductos, setCantidadProductos] = useState(0)

  const obtenerFacturas = async () => {

    try {

      const querySnapshot = await getDocs(
        collection(db, 'facturas')
      )

      const listaFacturas = []

      let ventas = 0

      let productos = 0

      querySnapshot.forEach((doc) => {

        const data = doc.data()

        listaFacturas.push({

          id: doc.id,

          ...data

        })

        ventas += Number(data.total || 0)

        productos += data.productos?.length || 0

      })

      setFacturas(listaFacturas)

      setTotalVentas(ventas)

      setCantidadFacturas(listaFacturas.length)

      setCantidadProductos(productos)

    } catch (error) {

      console.log(error)

    }
  }

  useEffect(() => {

    obtenerFacturas()

  }, [])

  return (

    <MainLayout>

      {/* El MainLayout ya aplica p-8 lg:p-10, no agregar padding extra aquí */}

      <div className="min-h-full">

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">

          <div>

            <h1 className="text-3xl font-black tracking-tight text-[#0f172a]">
              Dashboard
            </h1>

            <p className="text-slate-500 mt-1 text-sm">
              Bienvenido al sistema de facturación LICOEXPRESS
            </p>

          </div>

          <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">

            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>

            <span className="text-slate-700 text-sm font-semibold">
              Sistema Operativo
            </span>

          </div>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          {/* VENTAS */}

          <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-slate-200">

            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <FaDollarSign className="text-emerald-500 text-xl" />
            </div>

            <div className="min-w-0">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[1.5px]">
                Ventas Totales
              </p>
              <h2 className="text-2xl font-black text-[#0f172a] mt-0.5 truncate">
                ${Number(totalVentas).toLocaleString('es-CO')}
              </h2>
            </div>

          </div>

          {/* FACTURAS */}

          <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-slate-200">

            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <FaFileInvoiceDollar className="text-indigo-500 text-xl" />
            </div>

            <div className="min-w-0">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[1.5px]">
                Facturas
              </p>
              <h2 className="text-2xl font-black text-[#0f172a] mt-0.5">
                {cantidadFacturas}
              </h2>
            </div>

          </div>

          {/* PRODUCTOS */}

          <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-slate-200">

            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <FaBoxOpen className="text-purple-500 text-xl" />
            </div>

            <div className="min-w-0">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[1.5px]">
                Productos Vendidos
              </p>
              <h2 className="text-2xl font-black text-[#0f172a] mt-0.5">
                {cantidadProductos}
              </h2>
            </div>

          </div>

          {/* CRECIMIENTO */}

          <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-slate-200">

            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <FaChartLine className="text-orange-400 text-xl" />
            </div>

            <div className="min-w-0">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[1.5px]">
                Crecimiento
              </p>
              <h2 className="text-2xl font-black text-[#0f172a] mt-0.5">
                100%
              </h2>
            </div>

          </div>

        </div>

        {/* SECCIONES */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* ACTIVIDAD */}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">

            <div className="px-6 pt-6 pb-4">

              <h2 className="text-lg font-black text-[#0f172a]">
                Actividad Reciente
              </h2>

              <p className="text-slate-400 mt-0.5 text-xs">
                Últimas facturas registradas
              </p>

            </div>

            <div className="flex-1 px-6">

              {facturas.length === 0 ? (

                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <p className="font-bold text-slate-600 text-sm">
                    No hay actividad reciente
                  </p>
                  <p className="text-slate-400 mt-1 text-xs">
                    Aquí aparecerán las últimas facturas generadas
                  </p>
                </div>

              ) : (

                facturas.slice(0, 5).map((factura) => (

                  <div
                    key={factura.id}
                    className="flex justify-between items-center py-3.5 border-b border-slate-100 last:border-0 gap-4"
                  >

                    <div className="min-w-0">
                      <p className="font-bold text-[#0f172a] text-sm truncate">
                        {factura.numeroFactura || 'Sin número'}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5 truncate">
                        {factura.cliente || 'Cliente no registrado'}
                      </p>
                    </div>

                    <p className="font-bold text-emerald-500 text-sm tabular-nums shrink-0">
                      ${Number(factura.total).toLocaleString('es-CO')}
                    </p>

                  </div>

                ))

              )}

            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-center">

              <button className="flex items-center gap-2 text-indigo-500 text-sm font-semibold hover:text-indigo-700 transition-colors">
                <FaHistory className="text-xs" />
                Ver todas las facturas
              </button>

            </div>

          </div>

          {/* RESUMEN */}

          <div className="bg-[#0f1f3d] rounded-xl text-white flex flex-col shadow-sm">

            <div className="px-6 pt-6 pb-3">

              <h2 className="text-lg font-black text-white">
                Resumen General
              </h2>

            </div>

            <div className="flex-1 px-6 divide-y divide-white/10">

              <div className="flex justify-between items-center py-4">
                <span className="text-slate-300 text-sm">
                  Facturas emitidas
                </span>
                <span className="font-black text-white text-base tabular-nums">
                  {cantidadFacturas}
                </span>
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="text-slate-300 text-sm">
                  Productos vendidos
                </span>
                <span className="font-black text-white text-base tabular-nums">
                  {cantidadProductos}
                </span>
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="text-slate-300 text-sm">
                  Ventas totales
                </span>
                <span className="font-black text-emerald-400 text-base tabular-nums">
                  ${Number(totalVentas).toLocaleString('es-CO')}
                </span>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-[11px] font-medium">
                  Powered by
                </p>
                <p className="text-blue-400 font-black text-base mt-0.5">
                  PSO Digital
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                <FaChartLine className="text-white text-sm" />
              </div>

            </div>

          </div>

        </div>

      </div>

    </MainLayout>
  )
}

export default Dashboard
