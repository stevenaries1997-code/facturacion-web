import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')

  const iniciarSesion = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        correo,
        password
      )
      navigate('/dashboard')
    } catch (error) {
      console.log(error)
      alert('Correo o contraseña incorrectos')
    }
  }

  const loginGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(
        auth,
        provider
      )
      navigate('/dashboard')
    } catch (error) {
      console.log(error)
      alert('Error con Google')
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-6 py-10">
      {/* EFECTOS FONDO */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-float"></div>

      {/* CONTENIDO */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        
        {/* PANEL IZQUIERDO */}
        <div className="hidden lg:flex flex-col text-white animate-fadeIn">
          <div className="mb-6">
            <span className="bg-blue-500/20 border border-blue-400/30 text-blue-200 px-5 py-2 rounded-full text-sm font-bold tracking-wide animate-glow">
              ERP PREMIUM
            </span>
          </div>
          <h1 className="text-6xl font-black leading-tight">
            Plataforma Profesional de
            <span className="block text-blue-400 mt-2 animate-float">
              Facturación
            </span>
          </h1>
          <p className="text-slate-300 text-xl mt-8 leading-relaxed max-w-xl">
            Gestiona productos, facturas y operaciones empresariales
            con una experiencia moderna, elegante and eficiente.
          </p>

          <div className="grid grid-cols-2 gap-5 mt-12">
            <div className="glass-card rounded-3xl p-6 animate-fadeIn hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-2xl font-black mb-5 animate-glow">
                ✓
              </div>
              <h3 className="text-xl font-bold mb-3">
                Gestión Segura
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Sistema protegido con autenticación segura y acceso empresarial.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 animate-fadeIn hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center text-white text-2xl font-black mb-5 animate-glow">
                ★
              </div>
              <h3 className="text-xl font-bold mb-3">
                Experiencia Premium
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Interfaz moderna diseñada para productividad profesional.
              </p>
            </div>
          </div>
        </div>

        {/* LOGIN */}
        <div className="relative animate-fadeIn">
          {/* GLOW */}
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-3xl animate-glow"></div>

          {/* CARD */}
          <div className="relative glass-card rounded-3xl shadow-2xl p-10 md:p-14 flex flex-col items-center">
            
            {/* LOGO */}
            <div className="flex flex-col items-center justify-center text-center mb-12">
              <div className="relative animate-float">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl animate-glow"></div>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWEOpuUVI7MdP6F4bFWIGUq_VxAyKJXjrtPA&s"
                  alt="Logo"
                  className="relative w-32 h-32 rounded-full border-4 border-blue-400 shadow-2xl object-cover"
                />
              </div>
              <h1 className="text-5xl font-black text-white mt-7 tracking-tight">
                LICOEXPRESS
              </h1>
              <p className="text-slate-300 text-lg mt-4 leading-relaxed max-w-md">
                Sistema Profesional de Facturación y Prefacturación Empresarial
              </p>
            </div>

            {/* INPUT CORREO */}
            <div className="mb-5 w-full max-w-xs flex flex-col items-center">
              <label className="block text-slate-200 text-sm font-bold mb-3 tracking-wide text-center">
                CORREO ELECTRÓNICO
              </label>
              <input
                type="email"
                placeholder=""
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full h-7 bg-white/10 border border-white/20 rounded-2xl px-5 text-white placeholder-slate-400 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-xl hover:border-blue-400 text-center"
              />
            </div>

            {/* INPUT PASSWORD */}
            <div className="mb-7 w-full max-w-xs flex flex-col items-center">
              <label className="block text-slate-200 text-sm font-bold mb-3 tracking-wide text-center">
                CONTRASEÑA
              </label>
              <input
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-7 bg-white/10 border border-white/20 rounded-2xl px-5 text-white placeholder-slate-400 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-xl hover:border-blue-400 text-center"
              />
            </div>

            {/* BOTON LOGIN */}
            <button
              onClick={iniciarSesion}
              className="w-full max-w-xs bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 animate-gradient hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 text-white text-xl font-bold py-4 rounded-2xl shadow-2xl mb-5 hover:scale-[1.02] hover:-translate-y-1"
            >
              Iniciar Sesión
            </button>

            {/* DIVIDER */}
            <div className="flex items-center gap-4 my-6 w-full max-w-xs">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-slate-300 text-sm font-medium">
                o continuar con
              </span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* BOTON GOOGLE */}
            <button
              onClick={loginGoogle}
              className="w-full max-w-xs bg-white hover:bg-slate-100 transition-all duration-300 text-slate-800 text-lg font-bold py-4 rounded-2xl shadow-xl border border-white/70 hover:scale-[1.02] hover:-translate-y-1"
            >
              Continuar con Google
            </button>

            {/* FOOTER */}
            <div className="mt-10 text-center animate-fadeIn">
              <p className="text-slate-400 text-sm tracking-wide">
                Powered by
                <span className="text-blue-400 font-bold ml-2">
                  PSO Digital
                </span>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Login