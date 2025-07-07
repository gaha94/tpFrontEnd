'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { Menu, X, LogOut } from 'lucide-react'

export default function VendedorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { label: 'Ventas del día', href: '/vendedor/ventas-dia' },
    { label: 'Consulta por zona', href: '/vendedor/consulta-zona' },
    // { label: 'Consulta por cliente', href: '/vendedor/consulta-cliente' },
  ]

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-screen w-full md:w-64 bg-white shadow-lg p-6 transition-transform transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 flex flex-col`}
      >
        <div className="flex justify-between items-center mb-6 md:block">
          <h2 className="text-xl font-bold text-blue-600">TomaPedidos</h2>
          <button
            className="md:hidden text-gray-600"
            title='Cerrar menú'
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded hover:bg-blue-100 transition ${
                pathname === item.href ? 'bg-blue-500 text-white' : 'text-gray-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Botón cerrar sesión */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 px-3 py-2 hover:bg-red-100 rounded transition w-full"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col h-screen overflow-auto">
        {/* Topbar móvil */}
        <div className="md:hidden bg-white p-4 shadow flex items-center justify-between">
          <button title='Abrir menú' onClick={() => setSidebarOpen(true)}>
            <Menu size={24} className="text-gray-800" />
          </button>
          <span className="text-lg font-bold text-blue-600">TomaPedidos</span>
          <div className="w-6" />
        </div>

        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
