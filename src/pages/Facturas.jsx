import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { db } from '../firebase/config'
import {
  FaPrint,
  FaEdit,
  FaSave,
  FaTrash
} from 'react-icons/fa'

function Facturas() {
  const [facturas, setFacturas] = useState([])
  const [facturasAgrupadas, setFacturasAgrupadas] = useState({})
  const [facturaEditando, setFacturaEditando] = useState(null)
  const [productosDB, setProductosDB] = useState([])

  const { fecha: fechaUrl } = useParams()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const idBuscado = queryParams.get('id')

  const paddingBoton = "px-4 py-2"
  const textoBoton = "text-xs font-semibold"

  useEffect(() => {
    const obtenerProductosBD = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'))
        const listaProductos = []
        querySnapshot.forEach((doc) => {
          listaProductos.push({
            id: doc.id,
            ...doc.data()
          })
        })
        setProductosDB(listaProductos)
      } catch (error) {
        console.log("Error al traer productos de Firebase:", error)
      }
    }

    obtenerProductosBD()
  }, [])

  useEffect(() => {
    cargarFacturas()
  }, [fechaUrl])

  const cargarFacturas = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'facturas'))
      const datos = snapshot.docs.map((docu) => {
        const data = docu.data()
        let fechaFormateada = 'Sin fecha'

        if (data.fecha?.seconds) {
          const fecha = new Date(data.fecha.seconds * 1000)
          fechaFormateada = fecha.toLocaleDateString('es-CO')
        }

        return {
          id: docu.id,
          ...data,
          fechaFormateada
        }
      })

      setFacturas(datos)
      agruparFacturas(datos)
    } catch (error) {
      console.log(error)
    }
  }

  const agruparFacturas = (facturasList) => {
    const grupos = {}
    facturasList.forEach((factura) => {
      const fecha = factura.fechaFormateada || 'Sin fecha'
      if (!grupos[fecha]) {
        grupos[fecha] = []
      }
      grupos[fecha].push(factura)
    })
    setFacturasAgrupadas(grupos)
  }

  const imprimirFactura = (factura) => {
    const ventana = window.open('', '_blank', 'width=900,height=700')
    ventana.document.write(`
      <html>
        <head>
          <title>Factura ${factura.numeroFactura}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
            .contenedor { width: 100%; }
            table { width: 100%; border-collapse: collapse; }
            .header td { border: 1px solid #e2e8f0; }
            .titulo { width: 170px; background: #0c1829; color: #f8fafc; font-weight: bold; text-align: center; padding: 10px; font-size: 14px; letter-spacing: 0.05em; }
            .valor { text-align: center; font-weight: bold; padding: 8px; color: #1e293b; }
            .numero { font-size: 28px; color: #1b75ff; }
            .fecha { font-size: 20px; }
            .cliente { font-size: 26px; color: #0c1829; }
            .cedi { font-size: 20px; }
            .productos th { background: #0c1829; color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; font-size: 12px; letter-spacing: 0.05em; }
            .productos td { border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; color: #334155; }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="contenedor">
            <table class="header">
              <tr><td class="titulo">FACTURA</td><td class="valor numero">${factura.numeroFactura}</td></tr>
              <tr><td class="titulo">FECHA</td><td class="valor fecha">${factura.fechaFormateada}</td></tr>
              <tr><td class="titulo">CLIENTE</td><td class="valor cliente">${factura.cliente}</td></tr>
              <tr><td class="titulo">CEDI</td><td class="valor cedi">${factura.cedi || 'ARROYOHONDO'}</td></tr>
            </table>
            <table class="productos" style="margin-top: 20px;">
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>DESCRIPCIÓN</th>
                  <th>CANTIDAD CAJAS</th>
                </tr>
              </thead>
              <tbody>
                ${factura.productos.map(p => `
                  <tr>
                    <td class="center" style="font-weight: 500;">${p.codigo}</td>
                    <td>${p.descripcion}</td>
                    <td class="right bold" style="color: #0c1829; font-size: 13px;">${p.cajas} </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `)
    ventana.document.close()
    ventana.focus()
    ventana.print()
  }

  const activarEdicion = (factura) => {
    const clave = prompt('Ingrese clave de autorización')
    if (clave !== '1234') {
      alert('Clave incorrecta')
      return
    }
    setFacturaEditando(factura.id)
  }

  const actualizarFactura = (facturaId, campo, valor) => {
    const nuevasFacturas = facturas.map((factura) => {
      if (factura.id === facturaId) {
        return { ...factura, [campo]: valor }
      }
      return factura
    })
    setFacturas(nuevasFacturas)
    agruparFacturas(nuevasFacturas)
  }

  const cambiarProducto = (facturaId, indexProducto, campo, valor) => {
    const nuevasFacturas = facturas.map((factura) => {
      if (factura.id === facturaId) {
        const productosUpdated = [...factura.productos]
        
        productosUpdated[indexProducto][campo] = valor

        if (campo === 'descripcion') {
          const productoEncontrado = productosDB.find(
            (p) => p.descripcion.toLowerCase() === valor.toLowerCase()
          )

          if (productoEncontrado) {
            productosUpdated[indexProducto].codigo = productoEncontrado.codigo
            productosUpdated[indexProducto].unidades = productoEncontrado.unidadesCaja || productoEncontrado.unidades || 0
          }
        }

        const cajas = Number(productosUpdated[indexProducto].cajas || 0)
        const precioVenta = Number(productosUpdated[indexProducto].precioVenta || 0)
        const unidadesSueltas = Number(productosUpdated[indexProducto].unidades || 0)

        if (cajas > 0) {
          productosUpdated[indexProducto].totalUnidades = cajas * unidadesSueltas
          productosUpdated[indexProducto].precioUnitario = unidadesSueltas > 0 ? precioVenta / unidadesSueltas : 0
          productosUpdated[indexProducto].precioTotal = cajas * precioVenta
        } else {
          productosUpdated[indexProducto].totalUnidades = unidadesSueltas
          productosUpdated[indexProducto].precioUnitario = precioVenta
          productosUpdated[indexProducto].precioTotal = unidadesSueltas * precioVenta
        }

        const nuevoSubtotal = productosUpdated.reduce((acc, p) => acc + Number(p.precioTotal || 0), 0)
        const nuevoTotalFinal = nuevoSubtotal - Number(factura.notaCredito || 0)

        return { 
          ...factura, 
          productos: productosUpdated, 
          total: nuevoSubtotal, 
          totalFinal: nuevoTotalFinal 
        }
      }
      return factura
    })
    setFacturas(nuevasFacturas)
    agruparFacturas(nuevasFacturas)
  }

  const cambiarNotaCredito = (facturaId, valorNota) => {
    const nuevasFacturas = facturas.map((factura) => {
      if (factura.id === facturaId) {
        const total = Number(factura.total || 0)
        const totalFinal = total - valorNota
        return { ...factura, notaCredito: valorNota, totalFinal: totalFinal }
      }
      return factura
    })
    setFacturas(nuevasFacturas)
    agruparFacturas(nuevasFacturas)
  }

  const guardarCambios = async (factura) => {
    try {
      await updateDoc(doc(db, 'facturas', factura.id), {
        cliente: factura.cliente,
        cedi: factura.cedi,
        nota: factura.nota,
        notaCredito: Number(factura.notaCredito) || 0,
        totalFinal: Number(factura.totalFinal) || factura.total,
        productos: factura.productos,
        total: factura.total
      })
      alert('Factura actualizada correctamente')
      setFacturaEditando(null)
      cargarFacturas()
    } catch (error) {
      console.log(error)
      alert('Error actualizando factura')
    }
  }

  const eliminarFactura = async (facturaId) => {
    const clave = prompt('Ingrese clave para eliminar factura')
    if (clave !== '1234') {
      alert('Clave incorrecta')
      return
    }
    const confirmar = window.confirm('¿Seguro desea eliminar esta factura?')
    if (!confirmar) return

    try {
      await deleteDoc(doc(db, 'facturas', facturaId))
      alert('Factura eliminada')
      cargarFacturas()
    } catch (error) {
      console.log(error)
      alert('Error al eliminar la factura')
    }
  }

  const fechaFormateadaBuscada = fechaUrl ? fechaUrl.replace(/-/g, '/') : '';
  const fechasDisponibles = Object.keys(facturasAgrupadas)
  
  fechasDisponibles.sort((a, b) => {
    const [diaA, mesA, anioA] = a.split('/')
    const [diaB, mesB, anioB] = b.split('/')
    return new Date(anioB, mesB - 1, diaB) - new Date(anioA, mesA - 1, diaA)
  })

  const fechaFinal = fechaFormateadaBuscada || fechasDisponibles[0] || ''
  
  // LÓGICA PARA ELEGIR QUÉ MOSTRAR: Si hay ID en URL, mostrar esa, si no, agrupar por fecha
  let facturasDelDia = [];
  if (idBuscado) {
    facturasDelDia = facturas.filter(f => f.id === idBuscado);
  } else {
    facturasDelDia = facturasAgrupadas[fechaFinal] || [];
  }

  return (
    <MainLayout>
      <div className="w-full min-h-screen bg-[#0c1829]/5 p-2">
        
        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0c1829] tracking-tight">
              {idBuscado ? 'Visualizando Factura' : 'Historial de Facturación'}
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              {idBuscado ? 'Modo de vista única' : `Viendo registros del día: `} 
              <span className="text-[#1b75ff] font-bold">{idBuscado ? '' : (fechaFinal || 'Cargando...')}</span>
            </p>
          </div>
          {!idBuscado && (
            <div className="bg-[#0c1829] px-5 py-3 rounded-xl text-white flex items-center gap-4 shadow-md">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Facturado:</span>
              <span className="text-lg font-black text-[#00b4ff]">
                ${facturasDelDia.reduce((acc, f) => acc + Number(f.totalFinal ?? f.total ?? 0), 0).toLocaleString('es-CO')}
              </span>
            </div>
          )}
        </div>

        {/* CONTENEDOR DE FACTURAS */}
        <div className="space-y-8 w-full">
          {facturasDelDia.length === 0 ? (
            <div className="text-center bg-white p-12 rounded-2xl border border-slate-200 text-slate-400 font-semibold shadow-sm">
              {idBuscado ? 'Factura no encontrada.' : 'No hay facturas registradas para mostrar en este día.'}
            </div>
          ) : (
            facturasDelDia.map((factura) => (
              <div key={factura.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                
                {/* HEADER DE INFORMACIÓN GENERAL */}
                <div className="bg-slate-50 p-5 border-b border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
                    
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Factura</span>
                      <span className="text-xl font-black text-[#1b75ff]">{factura.numeroFactura}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</span>
                      <span className="text-sm font-bold text-slate-700">{factura.fechaFormateada}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Cliente</span>
                      {facturaEditando === factura.id ? (
                        <input
                          type="text"
                          value={factura.cliente || ''}
                          onChange={(e) => actualizarFactura(factura.id, 'cliente', e.target.value)}
                          className="w-full text-center text-base font-bold text-[#0c1829] bg-blue-50/50 border border-blue-200 rounded-lg p-1 focus:ring-2 focus:ring-[#1b75ff]/20 outline-none transition-all"
                        />
                      ) : (
                        <span className="text-base font-extrabold text-[#0c1829] text-center truncate uppercase">{factura.cliente}</span>
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Cedi</span>
                      {facturaEditando === factura.id ? (
                        <input
                          type="text"
                          value={factura.cedi || ''}
                          onChange={(e) => actualizarFactura(factura.id, 'cedi', e.target.value)}
                          className="w-full text-center text-sm bg-blue-50/50 border border-blue-200 rounded-lg p-1 focus:ring-2 focus:ring-[#1b75ff]/20 outline-none transition-all"
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-600 text-center uppercase">{factura.cedi || 'ARROYOHONDO'}</span>
                      )}
                    </div>

                  </div>
                </div>

                {/* BOTONES ACCIONES */}
                <div className="px-5 py-3 border-b border-slate-200 flex gap-3 bg-white">
                  {facturaEditando === factura.id ? (
                    <button onClick={() => guardarCambios(factura)} className={`bg-[#00b4ff] hover:bg-[#009edc] text-white rounded-xl flex items-center gap-2 uppercase tracking-wider shadow-sm transition-all ${paddingBoton} ${textoBoton}`}>
                      <FaSave /> Guardar
                    </button>
                  ) : (
                    <button onClick={() => activarEdicion(factura)} className={`bg-[#1b75ff] hover:bg-[#155ed2] text-white rounded-xl flex items-center gap-2 uppercase tracking-wider shadow-sm transition-all ${paddingBoton} ${textoBoton}`}>
                      <FaEdit /> Editar
                    </button>
                  )}

                  <button onClick={() => imprimirFactura(factura)} className={`bg-slate-800 hover:bg-slate-900 text-white rounded-xl flex items-center gap-2 uppercase tracking-wider shadow-sm transition-all ${paddingBoton} ${textoBoton}`}>
                    <FaPrint /> Imprimir
                  </button>

                  <button onClick={() => eliminarFactura(factura.id)} className={`bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-2 uppercase tracking-wider shadow-sm transition-all ml-auto ${paddingBoton} ${textoBoton}`}>
                    <FaTrash /> Eliminar
                  </button>
                </div>

                {/* TABLA DE PRODUCTOS */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse text-left">
                    <thead>
                      <tr className="bg-[#0c1829] text-white text-[11px] font-bold uppercase tracking-wider text-center">
                        <th className="py-3 px-4 border-b border-slate-800">Código</th>
                        <th className="py-3 px-4 border-b border-slate-800 text-left w-1/3">Descripción</th>
                        <th className="py-3 px-4 border-b border-slate-800">Cajas</th>
                        <th className="py-3 px-4 border-b border-slate-800">Unidades</th>
                        <th className="py-3 px-4 border-b border-slate-800">Precio Venta</th>
                        <th className="py-3 px-4 border-b border-slate-800">Unitario</th>
                        <th className="py-3 px-4 border-b border-slate-800">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {factura.productos.map((producto, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors text-center">
                          <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/50">{producto.codigo}</td>
                          
                          <td className="py-3 px-4 font-medium text-slate-800 text-left">
                            {facturaEditando === factura.id ? (
                              <>
                                <input
                                  type="text"
                                  list={`lista-productos-${factura.id}-${index}`}
                                  value={producto.descripcion || ''}
                                  onChange={(e) => cambiarProducto(factura.id, index, 'descripcion', e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 bg-blue-50/30 focus:outline-none focus:border-[#1b75ff] font-medium text-slate-800"
                                />
                                <datalist id={`lista-productos-${factura.id}-${index}`}>
                                  {productosDB.map((prod) => (
                                    <option key={prod.codigo} value={prod.descripcion} />
                                  ))}
                                </datalist>
                              </>
                            ) : (
                              <span className="whitespace-nowrap">{producto.descripcion}</span>
                            )}
                          </td>
                          
                          <td className="py-3 px-4">
                            {facturaEditando === factura.id ? (
                              <input
                                type="number"
                                value={producto.cajas}
                                onChange={(e) => cambiarProducto(factura.id, index, 'cajas', e.target.value)}
                                className="w-20 border border-slate-300 rounded px-2 py-1 text-center bg-blue-50/30 focus:outline-none focus:border-[#1b75ff]"
                              />
                            ) : (
                              <span className="font-bold text-slate-800">{producto.cajas}</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {facturaEditando === factura.id ? (
                              <input
                                type="number"
                                value={producto.unidades || ''}
                                onChange={(e) => cambiarProducto(factura.id, index, 'unidades', e.target.value)}
                                className="w-20 border border-slate-300 rounded px-2 py-1 text-center bg-blue-50/30 focus:outline-none focus:border-[#1b75ff] text-slate-700 font-semibold"
                              />
                            ) : (
                              <span className="font-medium text-slate-600">{producto.totalUnidades}</span>
                            )}
                          </td>
                          
                          <td className="py-3 px-4">
                            {facturaEditando === factura.id ? (
                              <input
                                type="number"
                                value={producto.precioVenta}
                                onChange={(e) => cambiarProducto(factura.id, index, 'precioVenta', e.target.value)}
                                className="w-24 border border-slate-300 rounded px-2 py-1 text-center bg-blue-50/30 focus:outline-none focus:border-[#1b75ff]"
                              />
                            ) : (
                              <span className="text-slate-600 font-medium">${Number(producto.precioVenta).toLocaleString('es-CO')}</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-slate-500 font-medium">
                            ${Math.round(producto.precioUnitario || 0).toLocaleString('es-CO')}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#1b75ff] bg-blue-50/10">
                            ${Number(producto.precioTotal || 0).toLocaleString('es-CO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* FOOTER TOTALES */}
                <div className="flex flex-col lg:flex-row border-t border-slate-200">
                  
                  {/* Notas Internas */}
                  <div className="flex-1 p-5 bg-slate-50/30 border-b lg:border-b-0 lg:border-r border-slate-200">
                    <h2 className="font-bold text-xs tracking-wider uppercase text-[#0c1829] mb-3">Notas Internas</h2>
                    {facturaEditando === factura.id ? (
                      <textarea
                        value={factura.nota || ''}
                        onChange={(e) => actualizarFactura(factura.id, 'nota', e.target.value)}
                        className="w-full h-32 border border-slate-200 rounded-xl p-3 resize-none outline-none bg-white focus:ring-2 focus:ring-[#1b75ff]/20 text-sm shadow-inner"
                      />
                    ) : (
                      <div className="w-full h-32 border border-slate-200 rounded-xl p-3 text-sm bg-white text-slate-600 shadow-sm overflow-y-auto">
                        {factura.nota || 'Sin notas registradas.'}
                      </div>
                    )}
                  </div>

                  {/* Resumen Monetario */}
                  <div className="w-full lg:w-[350px] bg-slate-50 divide-y divide-slate-200">
                    
                    <div className="flex justify-between items-center p-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal</span>
                      <span className="font-bold text-slate-700 text-base">
                        ${Number(factura.total || 0).toLocaleString('es-CO')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nota Crédito</span>
                      <div>
                        {facturaEditando === factura.id ? (
                          <input
                            type="number"
                            value={factura.notaCredito ?? 0}
                            onChange={(e) => cambiarNotaCredito(factura.id, Number(e.target.value))}
                            className="w-28 border border-slate-300 rounded px-2 py-1 text-right bg-white focus:outline-none focus:border-[#1b75ff] text-sm font-bold text-rose-500"
                          />
                        ) : (
                          <span className="font-bold text-rose-500 text-base">
                            -${Number(factura.notaCredito || 0).toLocaleString('es-CO')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-[#0c1829] text-white">
                      <span className="text-xs font-black text-[#00b4ff] uppercase tracking-wider">Total Neto</span>
                      <span className="font-black text-lg text-[#00b4ff]">
                        ${Number(factura.totalFinal ?? factura.total ?? 0).toLocaleString('es-CO')}
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default Facturas;