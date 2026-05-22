import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { db } from '../firebase/config'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { Search, Eye, Calendar, User, Filter, Receipt } from 'lucide-react'

function ConsultarFacturas() {
  const [facturas, setFacturas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const obtenerFacturas = async () => {
      try {
        const q = query(collection(db, 'facturas'), orderBy('fecha', 'desc'))
        const querySnapshot = await getDocs(q)
        const lista = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fechaStr: doc.data().fecha?.toDate ? doc.data().fecha.toDate().toLocaleDateString('es-CO') : 'N/A'
        }))
        setFacturas(lista)
      } catch (error) {
        console.error("Error al obtener facturas:", error)
      }
    }
    obtenerFacturas()
  }, [])

  const facturasFiltradas = facturas.filter((f) => {
    const coincideTexto = f.numeroFactura?.toLowerCase().includes(busqueda.toLowerCase()) || f.cliente?.toLowerCase().includes(busqueda.toLowerCase())
    let coincideFecha = true
    if (filtroFecha) {
      const fechaSel = new Date(filtroFecha)
      fechaSel.setMinutes(fechaSel.getMinutes() + fechaSel.getTimezoneOffset())
      coincideFecha = f.fechaStr === fechaSel.toLocaleDateString('es-CO')
    }
    return coincideTexto && coincideFecha
  })

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 p-6 md:p-8">
        {/* Encabezado */}
        <div className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Consultar Facturas
          </h1>
          <p className="text-slate-500 font-medium">Gestiona y visualiza el historial de tus ventas</p>
        </div>
        
        {/* Barra de Búsqueda y Filtros */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 mb-10">
          
          {/* Input Búsqueda */}
          <div className="md:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             
            </div>
            <input
              type="text"
              placeholder="🔎 Buscar por número de factura o cliente..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-none shadow-sm bg-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Input Fecha */}
          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              
            </div>
            <input
              type="date"
              
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-none shadow-sm bg-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-slate-400"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de Facturas */}
        <div className="max-w-6xl mx-auto">
          {facturasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {facturasFiltradas.map((factura) => (
                <div 
                  key={factura.id} 
                  className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <Receipt size={24} strokeWidth={2.5} />
                    </div>
                    <button 
                      onClick={() => navigate(`/facturas?id=${factura.id}`)}
                      className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors"
                    >
                      <Eye size={22} />
                    </button>
                  </div>
                  
                  <h3 className="font-bold text-slate-900 text-lg">Factura #{factura.numeroFactura}</h3>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <User size={16}/>
                      <span className="truncate">{factura.cliente}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar size={16}/>
                      <span>{factura.fechaStr}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-50 flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
                    <span className="text-xl font-black text-blue-900">
                      $ {Number(factura.total || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="text-slate-300" size={32} />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">No encontramos resultados</h3>
              <p className="text-slate-500">Intenta ajustar tu búsqueda o el filtro de fecha.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default ConsultarFacturas