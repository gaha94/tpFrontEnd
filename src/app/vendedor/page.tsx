'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { fetchProductos } from '@/services/productService'

interface Producto {
  id: string
  nombre: string
  precio: number
  stock: number
}

interface PedidoItem {
  producto: Producto
  cantidad: number
}

interface Venta {
  id: string
  vendedor: string
  fecha: string
  productos: PedidoItem[]
  total: number
  tipoComprobante?: 'boleta' | 'factura'
  cliente?: {
    nombres?: string
    dni?: string
    direccion?: string
    ruc?: string
    razonSocial?: string
  }
  estado: 'pendiente' | 'aprobado' | 'cancelado'
}


export default function VendedorPage() {
  const { logout, user } = useAuth()
  const [ventasHoy, setVentasHoy] = useState<Venta[]>([])
  const [mostrarNuevaVenta, setMostrarNuevaVenta] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedido, setPedido] = useState<PedidoItem[]>([])
  const [mostrarClienteModal, setMostrarClienteModal] = useState(false)
  const [tipoComprobante, setTipoComprobante] = useState<'boleta' | 'factura'>('boleta')
  const [ventaEditandoId, setVentaEditandoId] = useState<string | null>(null)
  const [cliente, setCliente] = useState({
    nombres: '',
    dni: '',
    direccion: '',
    ruc: '',
    razonSocial: ''
  })


  useEffect(() => {
    // Simular carga de productos
    const cargarProductos = async () => {
      try{
        const data = await fetchProductos()
        setProductos(data);
      } catch (error) {
        console.error('Error al cargar productos:', error)
      }
    };
    cargarProductos()
    // Cargar ventas del día
    const hoy = new Date().toDateString()
    const todas = Object.keys(localStorage)
      .map((key) => {
        try {
          const venta = JSON.parse(localStorage.getItem(key) || '')
          return venta
        } catch {
          return null
        }
      })
      .filter((venta): venta is Venta => {
        if (!venta?.fecha) return false
        const fechaVenta = new Date(venta.fecha).toDateString()
        return fechaVenta === hoy
      })      

    setVentasHoy(todas)
  }, [])

  const agregarProducto = (producto: Producto) => {
    const existe = pedido.find((p) => p.producto.id === producto.id)
    if (!existe) {
      setPedido([...pedido, { producto, cantidad: 1 }])
    }
  }

  const cambiarCantidad = (id: string, nuevaCantidad: number) => {
    setPedido(pedido.map(item =>
      item.producto.id === id ? { ...item, cantidad: nuevaCantidad } : item
    ))
  }

  const eliminarProducto = (id: string) => {
    setPedido(pedido.filter(item => item.producto.id !== id))
  }

  const guardarPedido = () => {
    const id = ventaEditandoId || Date.now().toString()  // ✅ Usa el ID original si existe
    const fecha = new Date().toISOString()
    const total = pedido.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)

    const venta: Venta = {
      id,
      vendedor: user?.nombre || 'Desconocido',
      fecha,
      productos: pedido,
      total,
      tipoComprobante,
      cliente,
      estado: 'pendiente'
    }

    // 🔁 Sobrescribe en localStorage
    localStorage.setItem(id, JSON.stringify(venta))

    // 🔄 Reemplaza en ventasHoy
    setVentasHoy((prev) => {
      const actualizadas = prev.filter(v => v.id !== id)
      return [...actualizadas, venta]
    })

    alert(`Venta ${ventaEditandoId ? 'actualizada' : 'registrada'}. Número: ${id}`)
    setPedido([])
    setCliente({ nombres: '', dni: '', direccion: '', ruc: '', razonSocial: '' })
    setMostrarNuevaVenta(false)
    setVentaEditandoId(null) // ✅ Reinicia edición
  }

  const total = pedido.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)

  return (
    <ProtectedRoute allowedRoles={['vendedor']}>
      <div className="p-4 md:px-10 lg:px-20 xl:px-32 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
            {mostrarNuevaVenta ? 'Nueva venta' : 'Ventas del día'}
          </h1>
          <p className="text-2x1 text-gray-600 mb-2">
            Vendedor: <span className="font-semibold">{user?.nombre}</span>
          </p>
          <button
            onClick={() => {
              setMostrarNuevaVenta(!mostrarNuevaVenta)
              setPedido([])
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
          >
            {mostrarNuevaVenta ? 'Volver al historial' : 'Nueva venta'}
          </button>
        </div>

        {!mostrarNuevaVenta ? (
          <div>
            {ventasHoy.length === 0 ? (
              <p>No hay ventas registradas hoy.</p>
            ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border table-auto text-sm bg-white shadow rounded mb-6">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2">#</th>
                    <th className="border px-3 py-2">Comprobante</th>
                    <th className="border px-3 py-2">Cliente</th>
                    <th className="border px-3 py-2 text-right">Total (S/)</th>
                    <th className="border px-3 py-2 text-center">Estado</th>
                    <th className="border px-3 py-2 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasHoy.map((venta, index) => (
                    <tr key={venta.id} className="hover:bg-gray-50">
                      <td className="border px-3 py-2 text-center">{index + 1}</td>
                      <td className="border px-3 py-2">
                        {venta.tipoComprobante === 'boleta'
                          ? `B001-${venta.id}`
                          : venta.tipoComprobante === 'factura'
                          ? `F001-${venta.id}`
                          : `—`}
                      </td>
                      <td className="border px-3 py-2">
                        {venta.tipoComprobante === 'boleta'
                          ? venta.cliente?.nombres
                          : venta.cliente?.razonSocial || 'Cliente'}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        {venta.total.toFixed(2)}
                      </td>
                      <td className="border px-3 py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                            venta.estado === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : venta.estado === 'aprobado'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {venta.estado}
                        </span>
                      </td>
                      <td className="border px-3 py-2 text-center justify-around flex gap-1">
                        {venta.estado === 'pendiente' && (
                          <>
                            <button
                              onClick={() => {
                                setMostrarNuevaVenta(true)
                                setPedido(venta.productos)
                                setTipoComprobante(venta.tipoComprobante || 'boleta')
                                setCliente({
                                  nombres: venta.cliente?.nombres || '',
                                  dni: venta.cliente?.dni || '',
                                  direccion: venta.cliente?.direccion || '',
                                  ruc: venta.cliente?.ruc || '',
                                  razonSocial: venta.cliente?.razonSocial || ''
                                })
                                setVentaEditandoId(venta.id)
                              }}
                              title="Modificar"
                              className="text-blue-600 font-bold text-lg hover:scale-110 transition cursor-pointer mr-1.5"
                            >
                              Modificar
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('¿Estás seguro de eliminar esta venta?')) {
                                  localStorage.removeItem(venta.id)
                                  setVentasHoy((prev) => prev.filter(v => v.id !== venta.id))
                                }
                              }}
                              title="Eliminar"
                              className="text-red-600 font-bold text-lg hover:scale-110 transition cursor-pointer "
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-sm text-gray-500"> Total de ventas: {ventasHoy.length}</p>
              <p className="text-sm text-gray-500"> Total vendido: S/ {ventasHoy.reduce((acc, venta) => acc + venta.total, 0).toFixed(2)}</p>
            </div>
            )}
          </div>
        ) :  (
          <>
            {/* Sección de búsqueda */}
            <div className="relative w-full md:w-1/2 mx-auto">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto..."
                className="border border-gray-300 px-4 py-2 rounded w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              {/* Lista desplegable de sugerencias */}
              {busqueda && (
                <ul className="absolute left-0 right-0 z-20 bg-white border border-gray-300 rounded shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {productos
                    .filter(p =>
                      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
                    )
                    .map((p) => (
                      <li
                        key={p.id}
                        onClick={() => {
                          agregarProducto(p)
                          setBusqueda('')
                        }}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors duration-150"
                      >
                        {p.nombre}
                      </li>
                    ))}
                  {productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())).length === 0 && (
                    <li className="px-4 py-2 text-gray-400">Sin resultados</li>
                  )}
                </ul>
              )}
            </div>
            {/* Resumen del pedido */}
            {pedido.length > 0 && (
            <div className="overflow-x-auto">
              <h2 className="text-lg font-bold mb-3">Productos agregados</h2>
              <table className="min-w-full border table-auto text-sm bg-white shadow rounded mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Producto</th>
                    <th className="border px-2 py-1">P. Unitario</th>
                    <th className="border px-2 py-1">Cantidad</th>
                    <th className="border px-2 py-1">Subtotal</th>
                    <th className="border px-2 py-1">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.map(({ producto, cantidad }) => (
                    <tr key={producto.id}>
                      <td className="border px-2 py-1">{producto.nombre}</td>
                      <td className="border px-2 py-1">S/ {producto.precio.toFixed(2)}</td>
                      <td className="border px-2 py-1">
                        <input
                          type="number"
                          min={1}
                          title="Cantidad"
                          max={producto.stock}
                          value={cantidad}
                          onChange={(e) => cambiarCantidad(producto.id, parseInt(e.target.value))}
                          className="w-16 border px-2 rounded"
                        />
                      </td>
                      <td className="border px-2 py-1">S/ {(producto.precio * cantidad).toFixed(2)}</td>
                      <td className="border px-2 py-1">
                        <button
                          onClick={() => eliminarProducto(producto.id)}
                          className="text-red-600 rounded-2xl px-2 py-1 hover:bg-red-100 transition-all cursor-pointer"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-right font-bold text-lg">Total: S/ {total.toFixed(2)}</p>
              <button
                onClick={() => setMostrarClienteModal(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
              >
                Confirmar venta
              </button>
            </div>
          )}
          </>
        ) } 
          {/* aquí mantienes la parte de historial */}        
        {!mostrarNuevaVenta && (
          <button onClick={logout}
          className="mt-6 bg-red-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-700 transition">
            Cerrar sesión
          </button>
        )}
      </div>
      {mostrarClienteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow w-full max-w-lg">
          <h2 className="text-xl font-bold mb-4">Datos del cliente</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <label className="font-medium mr-4">Tipo de comprobante:</label>
            <label className="mr-2">
              <input
                type="radio"
                name="tipo"
                checked={tipoComprobante === 'boleta'}
                onChange={() => setTipoComprobante('boleta')}
              /> Boleta
            </label>
            <label>
              <input
                type="radio"
                name="tipo"
                checked={tipoComprobante === 'factura'}
                onChange={() => setTipoComprobante('factura')}
              /> Factura
            </label>
          </div>

          {tipoComprobante === 'boleta' ? (
            <>
              <input
                type="text"
                placeholder="Nombres completos"
                className="border rounded w-full px-3 py-2 mb-2"
                value={cliente.nombres}
                onChange={(e) => setCliente({ ...cliente, nombres: e.target.value })}
              />
              <input
                type="text"
                placeholder="DNI"
                className="border rounded w-full px-3 py-2 mb-2"
                value={cliente.dni}
                onChange={(e) => setCliente({ ...cliente, dni: e.target.value })}
              />
              <input
                type="text"
                placeholder="Dirección"
                className="border rounded w-full px-3 py-2 mb-2"
                value={cliente.direccion}
                onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
              />
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="RUC"
                className="border rounded w-full px-3 py-2 mb-2"
                value={cliente.ruc}
                onChange={(e) => setCliente({ ...cliente, ruc: e.target.value })}
              />
              <input
                type="text"
                placeholder="Razón social"
                className="border rounded w-full px-3 py-2 mb-2"
                value={cliente.razonSocial}
                onChange={(e) => setCliente({ ...cliente, razonSocial: e.target.value })}
              />
              <input
                type="text"
                placeholder="Dirección"
                className="border rounded w-full px-3 py-2 mb-2"
                value={cliente.direccion}
                onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
              />
            </>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setMostrarClienteModal(false)
                setCliente({ nombres: '', dni: '', direccion: '', ruc: '', razonSocial: '' })
              }}
              className="border px-4 py-2 rounded cursor-pointer hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                // Validación mínima
                if (tipoComprobante === 'boleta' && (!cliente.nombres || !cliente.dni)) {
                  alert('Completa todos los campos de boleta.')
                  return
                }
                if (tipoComprobante === 'factura' && (!cliente.ruc || !cliente.razonSocial)) {
                  alert('Completa todos los campos de factura.')
                  return
                }

                // Aquí guardas el pedido incluyendo cliente
                guardarPedido()
                setMostrarClienteModal(false)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
            >
              Confirmar venta
            </button>
          </div>
        </div>
      </div>
    )}

    </ProtectedRoute>
  )
}
