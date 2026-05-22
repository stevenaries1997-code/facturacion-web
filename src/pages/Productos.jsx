import { useEffect, useState, useRef } from 'react'
import MainLayout from '../layouts/MainLayout'
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore'
import { db } from '../firebase/config'
import * as XLSX from 'xlsx'
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaSearch, 
  FaFileExcel,
  FaBoxOpen,
  FaSpinner,
  FaBan
} from 'react-icons/fa'

const CONTRASENA_SEGURA = "admin123"

function Productos() {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [importando, setImportando] = useState(false)
  const [vaciando, setVaciando] = useState(false)
  const fileInputRef = useRef(null)

  // Estados para el Formulario Superior Desplegable
  const [editandoId, setEditandoId] = useState(null)
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [formProducto, setFormProducto] = useState({
    codigo: '',
    descripcion: '',
    unidadesCaja: 1
  })

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      setCargando(true)
      const snapshot = await getDocs(collection(db, 'productos'))
      const lista = snapshot.docs.map(docu => ({
        id: docu.id,
        ...docu.data()
      }))
      lista.sort((a, b) => (a.descripcion || '').localeCompare(b.descripcion || ''))
      setProductos(lista)
    } catch (error) {
      console.error("Error al leer el catálogo: ", error)
    } finally {
      setCargando(false)
    }
  }

  const manejarImportacionExcel = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImportando(true)
    const reader = new FileReader()

    reader.onload = async (evt) => {
      try {
        const data = evt.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        
        const filas = XLSX.utils.sheet_to_json(sheet)

        if (filas.length === 0) {
          alert("El archivo Excel no contiene filas de datos.")
          setImportando(false)
          return
        }

        if (!window.confirm(`¿Deseas importar ${filas.length} artículos al catálogo de referencias para facturación?`)) {
          setImportando(false)
          return
        }

        const batch = writeBatch(db)
        const productosRef = collection(db, 'productos')

        filas.forEach((fila) => {
          const keys = Object.keys(fila)
          
          let codigoObtenido = null
          let descripcionObtenida = null
          let unidadesObtenidas = null

          const encontrarPorTexto = (llavesPosibles) => {
            const llaveEncontrada = keys.find(k => {
              const llaveLimpia = k.toLowerCase().replace(/["']/g, '').replace(/[\r\n]+/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').trim()
              return llavesPosibles.some(lp => llaveLimpia.includes(lp))
            })
            return llaveEncontrada ? fila[llaveEncontrada] : null
          }

          codigoObtenido = encontrarPorTexto(['codigo', 'cod'])
          descripcionObtenida = encontrarPorTexto(['articulo', 'descripcion', 'producto'])
          unidadesObtenidas = encontrarPorTexto(['cantidad', 'cant', 'unidades', 'caja'])

          if (!codigoObtenido && keys[0]) codigoObtenido = fila[keys[0]]
          if (!descripcionObtenida && keys[1]) descripcionObtenida = fila[keys[1]]
          if (!unidadesObtenidas && keys[2]) unidadesObtenidas = fila[keys[2]]

          let undsFinales = 1
          if (unidadesObtenidas !== null && unidadesObtenidas !== undefined) {
            const parsed = Number(unidadesObtenidas)
            if (!isNaN(parsed)) {
              undsFinales = parsed
            }
          }

          const descString = descripcionObtenida ? String(descripcionObtenida).trim() : ''
          if (descString === 'ARTÍCULO' || descString === '' || descString.includes('LISTADO')) {
            return 
          }

          const nuevoDocRef = doc(productosRef)
          batch.set(nuevoDocRef, {
            codigo: codigoObtenido !== null && codigoObtenido !== undefined ? String(codigoObtenido).trim() : '',
            descripcion: descString.toUpperCase(),
            unidadesCaja: undsFinales
          })
        })

        await batch.commit()
        alert("¡Sincronización Exitosa! Catálogo actualizado correctamente.")
        cargarProductos()
      } catch (error) {
        console.error("Error al procesar Excel: ", error)
        alert("Hubo un problema al procesar el archivo.")
      } finally {
        setImportando(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }

    reader.readAsBinaryString(file)
  }

  const vaciarCatalogoCompleto = async () => {
    if (productos.length === 0) {
      alert("El catálogo ya se encuentra completamente vacío.")
      return
    }

    const password = prompt("⚠️ ¡ADVERTENCIA CRÍTICA! Vas a borrar TODOS los productos de la base de datos.\n\nPor favor, introduce la contraseña de administrador para continuar:")
    if (password === null) return 

    if (password !== CONTRASENA_SEGURA) {
      alert("❌ Contraseña incorrecta. Acción cancelada por seguridad.")
      return
    }

    if (!window.confirm("¿Estás absolutamente seguro? Esta acción eliminará permanentemente todos los artículos y no se puede deshacer.")) {
      return
    }

    try {
      setVaciando(true)
      const batch = writeBatch(db)
      productos.forEach((prod) => {
        const docRef = doc(db, 'productos', prod.id)
        batch.delete(docRef)
      })

      await batch.commit()
      alert("¡Base de datos limpia! Se eliminaron todos los artículos de referencia.")
      cargarProductos()
    } catch (error) {
      console.error("Error al vaciar catálogo: ", error)
      alert("Ocurrió un error al intentar vaciar la base de datos.")
    } finally {
      setVaciando(false)
    }
  }

  const guardarProducto = async (e) => {
    e.preventDefault()
    try {
      const dataGuardar = {
        codigo: formProducto.codigo.trim(),
        descripcion: formProducto.descripcion.toUpperCase().trim(),
        unidadesCaja: Number(formProducto.unidadesCaja)
      }

      if (editandoId) {
        await updateDoc(doc(db, 'productos', editandoId), dataGuardar)
        alert('Producto actualizado con éxito')
      } else {
        await addDoc(collection(db, 'productos'), dataGuardar)
        alert('Producto añadido con éxito')
      }

      setFormularioAbierto(false)
      resetFormulario()
      cargarProductos()
    } catch (error) {
      console.error("Error al guardar el artículo: ", error)
      alert("Ocurrió un error al intentar guardar el producto.")
    }
  }

  const abrirEditar = (prod) => {
    setEditandoId(prod.id)
    setFormProducto({
      codigo: prod.codigo,
      descripcion: prod.descripcion,
      unidadesCaja: prod.unidadesCaja
    })
    setFormularioAbierto(true)
    window.scrollTo({ top: 0, behavior: 'smooth' }) // Sube la pantalla suavemente hacia el formulario
  }

  const eliminarProducto = async (id, nombre) => {
    if (!window.confirm(`¿Quitar "${nombre}" del catálogo de referencias?`)) return
    try {
      await deleteDoc(doc(db, 'productos', id))
      cargarProductos()
    } catch (error) {
      console.error("Error al eliminar del catálogo: ", error)
    }
  }

  const resetFormulario = () => {
    setEditandoId(null)
    setFormProducto({ codigo: '', descripcion: '', unidadesCaja: 1 })
    setFormularioAbierto(false)
  }

  const productosFiltrados = productos.filter(prod => 
    (prod.descripcion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (prod.codigo || '').toString().includes(busqueda)
  )

  return (
    <MainLayout>
      <div className="space-y-6 animate-fadeIn">
        
        {/* PANEL SUPERIOR DE CONTROLES */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <FaBoxOpen className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Maestro de Productos</h2>
              <p className="text-sm text-slate-500">Catálogo de referencias para la búsqueda y lectura en facturación</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={vaciarCatalogoCompleto}
              disabled={vaciando || cargando}
              className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              {vaciando ? (
                <>
                  <FaSpinner className="animate-spin" /> Borrando...
                </>
              ) : (
                <>
                  <FaBan /> Vaciar Catálogo
                </>
              )}
            </button>

            <input 
              type="file"
              ref={fileInputRef}
              onChange={manejarImportacionExcel}
              accept=".xlsx, .xls"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importando}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              {importando ? (
                <>
                  <FaSpinner className="animate-spin" /> Importando data...
                </>
              ) : (
                <>
                  <FaFileExcel /> Importar desde Excel
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (formularioAbierto && editandoId) resetFormulario();
                setFormularioAbierto(!formularioAbierto);
              }}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-blue-500/20 active:scale-95"
            >
              {formularioAbierto ? <FaTimes /> : <FaPlus />} 
              {formularioAbierto ? 'Cerrar Panel' : 'Añadir Producto Manual'}
            </button>
          </div>
        </div>

        {/* --- FORMULARIO SUPERIOR INSTANTÁNEO (UBICADO AQUÍ ARRIBA) --- */}
        {formularioAbierto && (
          <div className="bg-white border-2 border-blue-500/20 p-6 rounded-2xl shadow-md animate-fadeIn transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
                {editandoId ? '📝 Modificar Referencia Existente' : '✨ Registro de Producto Manual'}
              </h3>
              <button onClick={resetFormulario} className="text-slate-400 hover:text-slate-600 p-1">
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Código de Referencia / Marcación</label>
                <input
                  type="text"
                  required
                  disabled={editandoId !== null}
                  value={formProducto.codigo}
                  onChange={(e) => setFormProducto({ ...formProducto, codigo: e.target.value })}
                  placeholder="Ej: 50"
                  className="w-full bg-slate-50 border border-slate-200 disabled:bg-slate-100 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Descripción del Artículo</label>
                <input
                  type="text"
                  required
                  value={formProducto.descripcion}
                  onChange={(e) => setFormProducto({ ...formProducto, descripcion: e.target.value })}
                  placeholder="Ej: AGUA CRISTAL PET 600 ML"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Unidades por Caja</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formProducto.unidadesCaja}
                  onChange={(e) => setFormProducto({ ...formProducto, unidadesCaja: e.target.value })}
                  placeholder="1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-blue-600 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={resetFormulario}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00b4ff] hover:bg-[#009edc] font-bold text-sm text-white flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <FaSave /> {editandoId ? 'Guardar Cambios' : 'Confirmar Guardado'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FILTRO BUSCADOR */}
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Buscar por artículo o código de marcación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-800 font-medium shadow-sm transition-all"
          />
        </div>

        {/* TABLA PRINCIPAL DE REFERENCIAS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 w-32">Código</th>
                  <th className="px-6 py-4">Descripción del Artículo</th>
                  <th className="px-6 py-4 text-center w-48">Unidades por Caja</th>
                  <th className="px-6 py-4 text-center w-32">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-[14px]">
                {cargando ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 font-medium text-slate-400">
                      Sincronizando maestro de artículos...
                    </td>
                  </tr>
                ) : productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 font-medium text-slate-400">
                      No hay artículos en el catálogo base. ¡Importa un Excel o crea uno manual!
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900 bg-slate-50/40 group-hover:bg-transparent">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600 border border-slate-200">
                          {prod.codigo || '---'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold tracking-wide text-slate-800 uppercase">
                        {prod.descripcion}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-blue-600">
                        {prod.unidadesCaja} unds
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirEditar(prod)}
                            title="Editar"
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors active:scale-90"
                          >
                            <FaEdit className="text-base" />
                          </button>
                          <button
                            onClick={() => eliminarProducto(prod.id, prod.descripcion)}
                            title="Eliminar"
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors active:scale-90"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-right">
            <span className="text-xs font-bold text-slate-500">
              Total referencias en pantalla: {productosFiltrados.length} de {productos.length}
            </span>
          </div>
        </div>

      </div>
    </MainLayout>
  )
}

export default Productos;