import { useEffect, useState } from 'react' 
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FaChartBar,
  FaFileInvoiceDollar,
  FaBoxOpen,
  FaHistory,
  FaSignOutAlt,
  FaChevronDown, 
  FaFolder,
  FaSearch,
  FaDatabase,
  FaLock
} from 'react-icons/fa'
import { signOut } from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { collection, getDocs } from 'firebase/firestore'

function MainLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [facturasOpen, setFacturasOpen] = useState(false)
  const [historialFechas, setHistorialFechas] = useState([])
  const [bloqueado, setBloqueado] = useState(false)

  // LOGICA DE BLOQUEO POR TIEMPO
  useEffect(() => {
    const verificarBackup = () => {
      const ultimaCopia = localStorage.getItem('ultimaCopiaSeguridad')
      const ahora = new Date().getTime()
      const dosDiasEnMs = 2 * 24 * 60 * 60 * 1000

      // Si no hay copia guardada O pasaron más de 48 horas
      if (!ultimaCopia || (ahora - new Date(ultimaCopia).getTime()) > dosDiasEnMs) {
        // Bloqueamos acceso si no está en la ruta de backup
        if (location.pathname !== '/backup') {
          setBloqueado(true)
        } else {
          setBloqueado(false)
        }
      } else {
        setBloqueado(false)
      }
    }
    verificarBackup()
  }, [location.pathname])

  const cargarHistorialFechas = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'facturas'))
      const grupos = {}

      snapshot.docs.forEach((docu) => {
        const data = docu.data()
        let fechaFormateada = 'Sin fecha'

        if (data.fecha?.seconds) {
          const fecha = new Date(data.fecha.seconds * 1000)
          fechaFormateada = fecha.toLocaleDateString('es-CO')
        }

        const totalNeto = Number(data.totalFinal ?? data.total ?? 0)

        if (!grupos[fechaFormateada]) {
          grupos[fechaFormateada] = {
            fecha: fechaFormateada,
            totalFacturas: 0,
            totalDinero: 0
          }
        }

        grupos[fechaFormateada].totalFacturas += 1
        grupos[fechaFormateada].totalDinero += totalNeto
      })

      const listaOrdenada = Object.values(grupos).sort((a, b) => {
        const [diaA, mesA, anioA] = a.fecha.split('/')
        const [diaB, mesB, anioB] = b.fecha.split('/')
        return new Date(anioB, mesB - 1, diaB) - new Date(anioA, mesA - 1, diaA)
      })

      setHistorialFechas(listaOrdenada)
    } catch (error) {
      console.log('Error al cargar historial en el sidebar:', error)
    }
  }

  useEffect(() => {
    cargarHistorialFechas()
  }, [location.pathname])

  const cerrarSesion = async () => {
    try {
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  const menuPrincipal = [
    {
      nombre: 'Dashboard',
      ruta: '/dashboard',
      icono: <FaChartBar />,
      emoji: '📊'
    },
    {
      nombre: 'Facturación',
      ruta: '/facturacion',
      icono: <FaFileInvoiceDollar />,
      emoji: '💳'
    },
    {
      nombre: 'Consultar Facturas',
      ruta: '/consultar-facturas',
      icono: <FaSearch />,
      emoji: '🔍'
    },
    {
      nombre: 'Productos',
      ruta: '/productos',
      icono: <FaBoxOpen />,
      emoji: '📦'
    },
    {
      nombre: 'Copia de Seguridad',
      ruta: '/backup',
      icono: <FaDatabase />,
      emoji: '💾'
    }
  ]

  // RENDERIZADO SI EL SISTEMA ESTA BLOQUEADO
  if (bloqueado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 text-center shadow-2xl border border-white/10">
          <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaLock size={32} />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Sistema Bloqueado</h1>
          <p className="text-slate-400 mb-8">
            Han pasado más de 48 horas desde tu última copia de seguridad. Por normativa, debes realizar el backup para continuar operando.
          </p>
          <Link 
            to="/backup"
            className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all"
          >
            Ir a Copia de Seguridad
          </Link>
        </div>
      </div>
    )
  }

  // RENDERIZADO NORMAL
  return (
    <div className="min-h-screen bg-slate-100 flex overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.45)] border-r border-white/10">
        
        {/* EFECTOS */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-cyan-400/10 rounded-full blur-3xl"></div>

        {/* LOGO */}
        <div className="relative px-6 py-8 border-b border-white/10 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full group-hover:bg-cyan-400/30 transition-all duration-500"></div>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWEOpuUVI7MdP6F4bFWIGUq_VxAyKJXjrtPA&s"
                alt="Logo"
                className="relative w-24 h-24 rounded-full border-4 border-blue-500/80 shadow-2xl object-cover hover:scale-105 transition-all duration-500"
              />
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-5 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              LICOEXPRESS
            </h1>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-[220px]">
              Sistema de Pre-Facturación
            </p>
          </div>
        </div>

        {/* MENU */}
        
          
          {/* SECCION: PRINCIPAL */}
          <div>
            <div className="px-4 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Principal</div>
            {menuPrincipal.filter(i => i.nombre === 'Dashboard').map((item) => (
              <Link key={item.ruta} to={item.ruta} className={`group relative overflow-hidden flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 font-semibold text-[15px] border ${location.pathname === item.ruta ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white border-blue-400/30 shadow-2xl shadow-blue-900/40 scale-[1.02]' : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.08] hover:border-blue-400/20 hover:text-white hover:translate-x-1'}`}>
                <div className={`relative flex items-center justify-center w-11 h-11 rounded-xl ${location.pathname === item.ruta ? 'bg-white/15' : 'bg-white/5'}`}>
                  <span className="text-base">{item.icono}</span>
                </div>
                <span>{item.nombre}</span>
              </Link>
            ))}
          </div>

          {/* SECCION: OPERACIONES */}
          <div>
            <div className="px-4 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operaciones</div>
            {menuPrincipal.filter(i => i.nombre === 'Facturación' || i.nombre === 'Consultar Facturas').map((item) => (
              <Link key={item.ruta} to={item.ruta} className={`group relative overflow-hidden flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 font-semibold text-[15px] border mb-2 ${location.pathname === item.ruta ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white border-blue-400/30 shadow-2xl shadow-blue-900/40 scale-[1.02]' : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.08] hover:border-blue-400/20 hover:text-white hover:translate-x-1'}`}>
                <div className={`relative flex items-center justify-center w-11 h-11 rounded-xl ${location.pathname === item.ruta ? 'bg-white/15' : 'bg-white/5'}`}>
                  <span className="text-base">{item.icono}</span>
                </div>
                <span>{item.nombre}</span>
              </Link>
            ))}
          </div>

          {/* SECCION: ADMINISTRACION */}
          <div>
            <div className="px-4 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Administración</div>
            {menuPrincipal.filter(i => i.nombre === 'Productos' || i.nombre === 'Copia de Seguridad').map((item) => (
              <Link key={item.ruta} to={item.ruta} className={`group relative overflow-hidden flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 font-semibold text-[15px] border mb-2 ${location.pathname === item.ruta ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white border-blue-400/30 shadow-2xl shadow-blue-900/40 scale-[1.02]' : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.08] hover:border-blue-400/20 hover:text-white hover:translate-x-1'}`}>
                <div className={`relative flex items-center justify-center w-11 h-11 rounded-xl ${location.pathname === item.ruta ? 'bg-white/15' : 'bg-white/5'}`}>
                  <span className="text-base">{item.icono}</span>
                </div>
                <span>{item.nombre}</span>
              </Link>
            ))}
          </div>

          {/* HISTORIAL */}
          <div>
            <div className="px-4 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Historial</div>
            <button
              type="button"
              onClick={() => setFacturasOpen(!facturasOpen)}
              className={`w-full group relative overflow-hidden flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 font-semibold text-[15px] border ${location.pathname.startsWith('/facturas') || facturasOpen ? 'bg-white/[0.06] border-blue-500/30 text-white shadow-lg' : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.08] hover:text-white'}`}
            >
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 group-hover:bg-blue-500/10">
                  <FaHistory className="text-base text-slate-300 group-hover:text-cyan-300" />
                </div>
                <div className="text-left flex flex-col">
                  <span className="font-bold tracking-wide">Facturas</span>
                </div>
              </div>
              <FaChevronDown className={`text-xs text-slate-400 transition-transform duration-300 mr-2 ${facturasOpen ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>
            
            <div className={`mt-2 pl-2 space-y-2 transition-all duration-300 overflow-hidden ${facturasOpen ? 'max-h-60 opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              {historialFechas.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">No hay registros</p>
              ) : (
                historialFechas.map((itemFech) => {
                  const fechaUrl = `/facturas/${itemFech.fecha.replace(/\//g, '-')}`;
                  const isActive = location.pathname === fechaUrl;
                  return (
                    <Link
                      key={itemFech.fecha}
                      to={fechaUrl}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-sm ${isActive ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400/40 shadow-md scale-[1.01]' : 'bg-slate-900/40 border-white/5 text-slate-300 hover:bg-white/5 hover:text-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <FaFolder className={`text-base ${isActive ? 'text-white' : 'text-blue-400'}`} />
                        <div className="flex flex-col">
                          <span className="font-bold">{itemFech.fecha}</span>
                          <span className="text-[11px] opacity-70">{itemFech.totalFacturas} facturas</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-white/10">
                          ${itemFech.totalDinero.toLocaleString('es-CO')}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        

        {/* FOOTER */}
        <div className="relative px-5 pb-5 mt-auto">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          <p className="text-slate-500 text-[9px] uppercase tracking-[0.25em] font-bold">
            Powered by
          </p>
          <h3 className="text-blue-400 font-black text-xl mt-2 tracking-wide mb-4">
            PSO Digital
          </h3>

          <button
            onClick={cerrarSesion}
            className="w-full relative overflow-hidden bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all duration-300 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 text-[15px] shadow-2xl hover:scale-[1.02] hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-all duration-300"></div>
            <FaSignOutAlt className="relative text-lg" />
            <span className="relative">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
        <div className="p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}

export default MainLayout;