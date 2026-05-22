import { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import { db } from '../firebase/config'
import {
  collection,
  addDoc,
  getDocs
} from 'firebase/firestore'

function Facturacion() {
  const [productos, setProductos] = useState([])
  const [cliente, setCliente] = useState('')
  const [cedi, setCedi] = useState('ARROYOHONDO')
  const [nota, setNota] = useState('')
  const [notaCredito, setNotaCredito] = useState('')
  const [numeroFactura, setNumeroFactura] = useState('')
  const [ultimaFactura, setUltimaFactura] = useState('')

  // NUEVO: Estado para almacenar los productos traídos desde Firebase
  const [productosDB, setProductosDB] = useState([])

  // NUEVO: useEffect para cargar los productos de la base de datos al iniciar
  useEffect(() => {
    const obtenerProductosBD = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'))
        const listaProductos = []
        querySnapshot.forEach((doc) => {
          // Guardamos los datos de cada producto
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

  // TRAER ULTIMA FACTURA
  useEffect(() => {
    const obtenerUltimaFactura = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(
            db,
            'facturas'
          )
        )

        let ultimoNumero = 0

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (
            data.numeroFactura
          ) {
            const numero = parseInt(
              data.numeroFactura.replace(
                'CLAH-',
                ''
              )
            )

            if (
              numero >
              ultimoNumero
            ) {
              ultimoNumero = numero
            }
          }
        })

        setUltimaFactura(
          `Última factura: CLAH-${ultimoNumero}`
        )

        setNumeroFactura(
          String(
            ultimoNumero + 1
          )
        )
      } catch (error) {
        console.log(error)
      }
    }

    obtenerUltimaFactura()
  }, [])

  const fechaActual = new Date().toLocaleDateString(
    'es-CO',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  )

  const [nuevoProducto, setNuevoProducto] = useState({
    codigo: '',
    descripcion: '',
    cajas: '',
    unidades: '',
    precioVenta: ''
  })

  // SELECCIONAR PRODUCTO (AHORA BUSCA EN EL ESTADO DE FIREBASE)
  const seleccionarProducto = (texto) => {
    setNuevoProducto({
      ...nuevoProducto,
      descripcion: texto
    })

    const productoEncontrado = productosDB.find(
      (producto) =>
        producto.descripcion.toLowerCase() ===
        texto.toLowerCase()
    )

    if (
      productoEncontrado
    ) {
      setNuevoProducto({
        codigo: productoEncontrado.codigo,
        descripcion: productoEncontrado.descripcion,
        cajas: '',
        unidades: productoEncontrado.unidadesCaja || '', // Asegúrate de que en Firebase se llame 'unidadesCaja'
        precioVenta: ''
      })
    }
  }

  // AGREGAR PRODUCTO
  const agregarProducto = () => {
    if (
      !nuevoProducto.codigo ||
      !nuevoProducto.descripcion ||
      !nuevoProducto.precioVenta
    ) {
      return
    }

    const cajas = Number(nuevoProducto.cajas || 0)
    const unidades = Number(nuevoProducto.unidades || 0)
    const precioVenta = Number(nuevoProducto.precioVenta)

    // LÓGICA CORREGIDA: Si hay cajas, multiplicamos cajas * precio. Si no, unidades * precio.
    const totalUnidades = cajas + unidades
    const precioUnitario = precioVenta
    const precioTotal = cajas > 0 ? (cajas * precioVenta) : (unidades * precioVenta)

    const producto = {
      ...nuevoProducto,
      cajas: cajas || 0,
      totalUnidades,
      precioUnitario,
      precioTotal
    }

    setProductos([
      ...productos,
      producto
    ])

    // LIMPIAR
    setNuevoProducto({
      codigo: '',
      descripcion: '',
      cajas: '',
      unidades: '',
      precioVenta: ''
    })
  }

  // SUBTOTAL
  const subtotal = productos.reduce(
    (acc, producto) =>
      acc +
      producto.precioTotal,
    0
  )

  // TOTAL FACTURA
  const totalFactura = subtotal - Number(notaCredito || 0)

  // GUARDAR FACTURA
  const guardarFactura = async () => {
    if (
      !cliente.trim()
    ) {
      alert(
        'Debes ingresar el nombre del cliente'
      )
      return
    }

    if (
      productos.length === 0
    ) {
      alert(
        'Debes agregar mínimo 1 producto'
      )
      return
    }

    try {
      await addDoc(
        collection(
          db,
          'facturas'
        ),
        {
          cliente,
          cedi,
          nota,
          notaCredito,
          numeroFactura:
            `CLAH-${numeroFactura}`,
          productos,
          total: totalFactura,
          subtotal,
          fecha: new Date()
        }
      )

      alert(
        'Factura guardada correctamente'
      )

      const siguienteNumero = Number(numeroFactura) + 1

      setUltimaFactura(
        `Última factura: CLAH-${numeroFactura}`
      )

      // LIMPIAR
      setCliente('')
      setCedi('ARROYOHONDO')
      setNota('')
      setNotaCredito('')
      setNumeroFactura(String(siguienteNumero))
      setProductos([])
    } catch (error) {
      console.log(error)
      alert(error.message)
    }
  }

  return (
    <MainLayout>
      <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-200">
        
        {/* HEADER */}
        <div className="border-b border-gray-300">
          
          {/* FACTURA */}
          <div className="grid grid-cols-12">
            <div className="bg-blue-950 text-white font-bold text-center py-2 border-r border-white text-lg">
              FACTURA
            </div>
            <div className="col-span-11 flex flex-col items-center justify-center py-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                  CLAH-
                </span>
                <input
                  type="text"
                  value={numeroFactura}
                  onChange={(e) => setNumeroFactura(e.target.value)}
                  className="text-3xl font-bold text-center outline-none w-32 border-b-2 border-gray-300"
                />
              </div>
              <span className="text-sm text-gray-500 mt-1">
                {ultimaFactura}
              </span>
            </div>
          </div>

          {/* FECHA */}
          <div className="grid grid-cols-12 border-t border-gray-300">
            <div className="bg-blue-950 text-white font-bold text-center py-2 border-r border-white text-lg">
              FECHA
            </div>
            <div className="col-span-11 text-center text-xl font-bold py-2">
              {fechaActual}
            </div>
          </div>

          {/* CLIENTE */}
          <div className="grid grid-cols-12 border-t border-gray-300">
            <div className="bg-blue-950 text-white font-bold text-center py-2 border-r border-white text-lg">
              CLIENTE
            </div>
            <div className="col-span-11 p-2">
              <input
                type="text"
                placeholder="Nombre cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full text-center text-xl font-bold outline-none"
              />
            </div>
          </div>

          {/* CEDI */}
          <div className="grid grid-cols-12 border-t border-gray-300">
            <div className="bg-blue-950 text-white font-bold text-center py-2 border-r border-white text-lg">
              CEDI
            </div>
            <div className="col-span-11 p-2">
              <input
                type="text"
                value={cedi}
                onChange={(e) => setCedi(e.target.value)}
                className="w-full text-center text-lg outline-none"
              />
            </div>
          </div>

        </div>

        {/* TABLA HEADER */}
        <div className="grid grid-cols-12 bg-blue-950 text-white font-bold text-center text-base">
          <div className="py-2 border-r border-white">
            CODIGO
          </div>
          <div className="col-span-4 py-2 border-r border-white">
            DESCRIPCION
          </div>
          <div className="py-2 border-r border-white">
            CANTIDAD CAJAS
          </div>
          <div className="py-2 border-r border-white">
            CANTIDAD UNIDAD
          </div>
          <div className="py-2 border-r border-white">
            PRECIO VENTA
          </div>
          <div className="py-2 border-r border-white">
            PRECIO UNITARIO
          </div>
          <div className="py-2">
            PRECIO TOTAL
          </div>
        </div>

        {/* INPUTS DE REGISTRO */}
        <div className="grid grid-cols-12 border-b border-gray-300 text-sm">
          <input
            type="text"
            placeholder="Código"
            value={nuevoProducto.codigo}
            readOnly
            className="p-2 border-r border-gray-300 bg-gray-100 text-center outline-none"
          />

          <div className="col-span-4 border-r border-gray-300">
            <input
              type="text"
              list="productos"
              placeholder="Buscar producto"
              value={nuevoProducto.descripcion}
              onChange={(e) => seleccionarProducto(e.target.value)}
              className="w-full p-2 outline-none"
            />
            <datalist id="productos">
              {productosDB.map((producto) => (
                <option
                  key={producto.codigo}
                  value={producto.descripcion}
                />
              ))}
            </datalist>
          </div>

          <input
            type="number"
            placeholder="Cajas"
            value={nuevoProducto.cajas}
            onChange={(e) =>
              setNuevoProducto({
                ...nuevoProducto,
                cajas: e.target.value
              })
            }
            className="p-2 border-r border-gray-300 text-center outline-none"
          />

          <input
            type="number"
            placeholder="Unidades"
            value={nuevoProducto.unidades}
            onChange={(e) =>
              setNuevoProducto({
                ...nuevoProducto,
                unidades: e.target.value
              })
            }
            className="p-2 border-r border-gray-300 text-center outline-none"
          />

          <input
            type="number"
            placeholder="Precio venta"
            value={nuevoProducto.precioVenta}
            onChange={(e) =>
              setNuevoProducto({
                ...nuevoProducto,
                precioVenta: e.target.value
              })
            }
            className="p-2 border-r border-gray-300 text-center outline-none"
          />

          {/* PRECIO UNITARIO PREVIEW */}
          <div className="p-2 border-r border-gray-300 text-center bg-gray-50">
            {nuevoProducto.precioVenta
              ? `$ ${Number(nuevoProducto.precioVenta).toLocaleString('es-CO')}`
              : '$ 0'}
          </div>

          {/* PRECIO TOTAL PREVIEW CORREGIDO */}
          <div className="p-2 text-center bg-gray-50">
            {nuevoProducto.precioVenta
              ? (() => {
                  const cjs = Number(nuevoProducto.cajas || 0)
                  const unis = Number(nuevoProducto.unidades || 0)
                  const pVenta = Number(nuevoProducto.precioVenta)
                  // LÓGICA CORREGIDA PARA PREVIEW
                  const totalPreview = cjs > 0 ? (cjs * pVenta) : (unis * pVenta)
                  return `$ ${totalPreview.toLocaleString('es-CO')}`
                })()
              : '$ 0'}
          </div>
        </div>

        {/* BOTONES */}
        <div className="p-4 border-b border-gray-300 flex gap-4">
          <button
            onClick={agregarProducto}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold text-sm"
          >
            Agregar Producto
          </button>
          <button
            onClick={guardarFactura}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-bold text-sm"
          >
            Guardar Factura
          </button>
        </div>

        {/* LISTADO DE ITEMS AGREGADOS */}
        {productos.map((producto, index) => (
          <div
            key={index}
            className="grid grid-cols-12 border-b border-gray-300 text-sm"
          >
            <div className="p-2 text-center bg-blue-50">
              {producto.codigo}
            </div>
            <div className="col-span-4 p-2 font-medium">
              {producto.descripcion}
            </div>
            <div className="p-2 text-center font-bold">
              {producto.cajas}
            </div>
            <div className="p-2 text-center">
              {producto.totalUnidades}
            </div>
            <div className="p-2 text-center">
              $ {Number(producto.precioVenta).toLocaleString('es-CO')}
            </div>
            <div className="p-2 text-center">
              $ {Math.round(producto.precioUnitario).toLocaleString('es-CO')}
            </div>
            <div className="p-2 text-center font-bold text-green-600">
              $ {Number(producto.precioTotal).toLocaleString('es-CO')}
            </div>
          </div>
        ))}

        {/* FOOTER */}
        <div className="grid grid-cols-12 min-h-[250px]">
          
          {/* NOTAS */}
          <div className="col-span-9 border-r border-gray-300 p-5">
            <h2 className="font-bold text-lg mb-3">
              NOTAS
            </h2>
            <textarea
              placeholder="Escribe una nota..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full h-40 border border-gray-300 rounded-xl p-4 resize-none outline-none text-sm"
            />
          </div>

          {/* TOTALES */}
          <div className="col-span-3">
            
            {/* SUBTOTAL */}
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="bg-blue-950 text-white font-bold p-3 text-sm">
                SUBTOTAL
              </div>
              <div className="p-3 text-right font-bold text-xl">
                $ {Number(subtotal).toLocaleString('es-CO')}
              </div>
            </div>

            {/* NOTA CREDITO */}
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="bg-blue-950 text-white font-bold p-3 text-sm">
                NOTA CRÉDITO
              </div>
              <div className="p-2">
                <input
                  type="number"
                  placeholder="0"
                  value={notaCredito}
                  onChange={(e) => setNotaCredito(e.target.value)}
                  className="w-full text-right text-lg font-bold outline-none"
                />
              </div>
            </div>

            {/* TOTAL */}
            <div className="grid grid-cols-2">
              <div className="bg-blue-950 text-white font-bold p-3 text-sm">
                VALOR FACTURA
              </div>
              <div className="p-3 text-right font-bold text-2xl text-green-600">
                $ {Number(totalFactura).toLocaleString('es-CO')}
              </div>
            </div>

          </div>

        </div>

      </div>
    </MainLayout>
  )
}

export default Facturacion;