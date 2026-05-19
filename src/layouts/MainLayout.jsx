import Sidebar from '../components/ui/Sidebar'

function MainLayout({ children }) {
  return (
    <div className="flex">

      <Sidebar />

      <main className="flex-1 p-8 bg-gray-100 min-h-screen">
        {children}
      </main>

    </div>
  )
}

export default MainLayout