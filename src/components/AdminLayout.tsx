'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, LayoutDashboard, Box, Users, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin/dashboard' },
    { label: 'Productos', icon: <Box size={20} />, href: '/admin/productos' },
    { label: 'Usuarios', icon: <Users size={20} />, href: '/admin/roles' }
  ]

  useEffect(() => {
    if (isMobile) setCollapsed(true)
  }, [isMobile])

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && <span className="font-bold text-lg">Admin</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 hover:text-black transition ml-auto"
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="mt-4">
          {navItems.map(({ label, icon, href }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors ${
                pathname.startsWith(href) ? 'bg-gray-200 font-semibold' : ''
              }`}
            >
              {icon}
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t mb-2">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-600 hover:underline text-sm"
          >
            <LogOut size={20} />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Contenido sin margin */}
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  )
}
