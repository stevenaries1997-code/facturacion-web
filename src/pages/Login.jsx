function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96">
        <h1 className="text-3xl font-bold text-center mb-6">
          LICOEXPRESS
        </h1>

        <input
          type="text"
          placeholder="Usuario"
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
          Ingresar
        </button>
      </div>
    </div>
  )
}

export default Login