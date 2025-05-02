'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Venta, Producto } from '@/types/venta'
import { Usuario } from '@/types/usuario'
import { PedidoItem } from '@/types/venta'

export default function DashboardPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  useEffect(() => {
    setVentas(JSON.parse(localStorage.getItem('ventas') || '[]'))
    setProductos(JSON.parse(localStorage.getItem('productos') || '[]'))
    setUsuarios(JSON.parse(localStorage.getItem('usuarios') || '[]'))
  }, [])

  // Calcular productos más vendidos
  const ranking: { [nombre: string]: number } = {}
  ventas.forEach((v) => {
    v.productos.forEach((item: PedidoItem) => {
      const nombre = item.producto.nombre
      ranking[nombre] = (ranking[nombre] || 0) + item.cantidad
    })
  })

  const rankingData = Object.entries(ranking).map(([name, value]) => ({ name, value }))

  return (
    <ProtectedRoute allowedRoles={['admin']}>

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Panel de administrador</h1>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm text-gray-500">Total de ventas</h3>
            <p className="text-2xl font-bold text-blue-600">{ventas.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm text-gray-500">Productos registrados</h3>
            <p className="text-2xl font-bold text-green-600">{productos.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm text-gray-500">Usuarios registrados</h3>
            <p className="text-2xl font-bold text-purple-600">{usuarios.length}</p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Productos más vendidos</h3>
          {rankingData.length === 0 ? (
            <p className="text-sm text-gray-500">No hay datos suficientes.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rankingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
