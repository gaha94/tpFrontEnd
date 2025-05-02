'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

interface Producto {
  id: string
  nombre: string
  precio: number
  stock: number
}

export default function VendedorPage() {
  const [busqueda, setBusqueda] = useState('')
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedido, setPedido] = useState<{ producto: Producto; cantidad: number }[]>([])

  useEffect(() => {
    // Productos simulados cargados automáticamente
    setProductos([
      { id: '1', nombre: 'Cemento', precio: 32.5, stock: 100 },
      { id: '2', nombre: 'Clavo', precio: 0.5, stock: 1000 },
      { id: '3', nombre: 'Martillo', precio: 22.0, stock: 30 },
      { id: '4', nombre: 'Pintura Blanca', precio: 45.0, stock: 15 },
      { id: '5', nombre: 'Taladro', precio: 210.0, stock: 10 },
      { id: '6', nombre: 'Tornillo', precio: 0.2, stock: 5000 }
    ])
  }, [])

  const handleBuscar = () => {
    const resultados = productos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
    setProductos(resultados)
  }

  const agregarProducto = (producto: Producto) => {
    const yaExiste = pedido.find(item => item.producto.id === producto.id)
    if (!yaExiste) {
      setPedido([...pedido, { producto, cantidad: 1 }])
    }
  }

  const guardarPedido = (pedidoActualizado: typeof pedido) => {
    const pedidoId = Date.now().toString()
    const vendedor = user?.username || 'Desconocido'
    const fecha = new Date().toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  
    const total = pedidoActualizado.reduce(
      (acc, item) => acc + item.producto.precio * item.cantidad,
      0
    )
  
    const datosGuardados = {
      id: pedidoId,
      vendedor,
      fecha,
      productos: pedidoActualizado,
      total
    }
  
    localStorage.setItem(pedidoId, JSON.stringify(datosGuardados))
    navigator.clipboard.writeText(pedidoId)
    alert(`Pedido registrado. Número de venta: ${pedidoId} (copiado)`)
    setPedido([])
  }
  const cambiarCantidad = (id: string, nuevaCantidad: number) => {
    setPedido(pedido.map(item =>
      item.producto.id === id ? { ...item, cantidad: nuevaCantidad } : item
    ))
  }

  const eliminarProducto = (id: string) => {
    setPedido(pedido.filter(item => item.producto.id !== id))
  }

  const total = pedido.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  )

  const { logout, user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={['vendedor']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Ventas - Vendedor</h1>

        {/* Barra de búsqueda */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre"
            className="border px-4 py-2 rounded w-full"
          />
          <button
            onClick={handleBuscar}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Buscar
          </button>
        </div>

        {/* Resultados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {productos.map(producto => (
            <div key={producto.id} className="bg-white border rounded shadow p-4 flex flex-col justify-between">
              <div>
                <h2 className="font-semibold text-lg">{producto.nombre}</h2>
                <p className="text-sm text-gray-600">Precio: S/ {producto.precio.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Stock: {producto.stock}</p>
              </div>
              <button
                className="mt-4 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                onClick={() => agregarProducto(producto)}
              >
                Agregar al pedido
              </button>
            </div>
          ))}
        </div>

        {/* Pedido actual */}
        <div className="bg-white p-4 rounded shadow border">
          <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>

          {pedido.length === 0 ? (
            <p className="text-gray-500">No hay productos en el pedido.</p>
          ) : (
            <ul className="space-y-3">
              {pedido.map(({ producto, cantidad }) => (
                <li key={producto.id} className="flex justify-between items-center">
                  <span>{producto.nombre} - S/ {producto.precio} x {cantidad}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={producto.stock}
                      value={cantidad}
                      onChange={(e) =>
                        cambiarCantidad(producto.id, parseInt(e.target.value))
                      }
                      title='Cantidad del producto'
                      className="w-20 border px-2 py-1 rounded"
                    />
                    <button
                      onClick={() => eliminarProducto(producto.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {pedido.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <p className="font-bold text-lg">Total: S/ {total.toFixed(2)}</p>
              <button
                onClick={() => guardarPedido(pedido)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Confirmar pedido
              </button>
            </div>
          )}
        </div>

        <button onClick={logout} className="mt-8 text-red-600 underline">
          Cerrar sesión
        </button>
      </div>
    </ProtectedRoute>
  )
}
