import Sidebar from './Sidebar'

function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}

export default Layout
