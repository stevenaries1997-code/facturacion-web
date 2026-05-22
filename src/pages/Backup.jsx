import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { db } from '../firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import { FaDatabase, FaFileExcel, FaSpinner } from 'react-icons/fa'
import * as XLSX from 'xlsx'

function Backup() {
  const [cargando, setCargando] = useState(false)

  const generarExcel = async () => {
    setCargando(true)
    try {
      const snapshot = await getDocs(collection(db, 'facturas'))
      
      const dataParaExcel = []

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        const productos = data.productos || []

        if (productos.length > 0) {
          productos.forEach((prod) => {
            dataParaExcel.push({
              "ID Factura": doc.id,
              "Número": data.numeroFactura || "S/N",
              "Fecha": data.fecha?.seconds ? new Date(data.fecha.seconds * 1000).toLocaleDateString('es-CO') : 'Sin fecha',
              "Cliente": data.cliente || 'Sin cliente',
              "CEDI": data.cedi || 'N/A',
              "Cod. Producto": prod.codigo || '',
              "Descripción": prod.descripcion || '',
              "Cajas": prod.cajas || 0,
              "Unidades": prod.totalUnidades || 0,
              "Precio Unit": prod.precio || 0,
              "Subtotal Item": prod.subtotal || 0,
              "Nota Crédito": data.notaCredito || 0,
              "Total Final Factura": data.totalFinal ?? data.total ?? 0,
              "Nota": data.nota || ''
            })
          })
        } else {
          dataParaExcel.push({
            "ID Factura": doc.id,
            "Número": data.numeroFactura || "S/N",
            "Fecha": data.fecha?.seconds ? new Date(data.fecha.seconds * 1000).toLocaleDateString('es-CO') : 'Sin fecha',
            "Cliente": data.cliente || 'Sin cliente',
            "Total Final Factura": data.totalFinal ?? data.total ?? 0,
            "Estado": "Sin productos registrados"
          })
        }
      })

      const worksheet = XLSX.utils.json_to_sheet(dataParaExcel)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas Detalladas")

      const fechaHoy = new Date().toISOString().split('T')[0]
      XLSX.writeFile(workbook, `Reporte_Completo_Facturas_${fechaHoy}.xlsx`)
      
      // MARCAR FECHA DE RESPALDO EXITOSO
      localStorage.setItem('ultimaCopiaSeguridad', new Date().toISOString())
      alert("Copia de seguridad realizada y fecha actualizada.")
      
    } catch (error) {
      console.error("Error al generar Excel:", error)
      alert("Hubo un error al generar el archivo.")
    } finally {
      setCargando(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaDatabase size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Copia de Seguridad</h1>
          <p className="text-slate-500 mb-8">
            Genera tu reporte obligatorio cada 2 días para mantener el sistema desbloqueado.
          </p>
          <button
            onClick={generarExcel}
            disabled={cargando}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all"
          >
            {cargando ? <><FaSpinner className="animate-spin" /> Procesando...</> : <><FaFileExcel /> Descargar Reporte y Desbloquear</>}
          </button>
        </div>
      </div>
    </MainLayout>
  )
}

export default Backup