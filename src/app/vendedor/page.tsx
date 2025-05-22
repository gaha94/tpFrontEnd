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
    const id = ventaEditandoId || Date.now().toString()
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
  
    localStorage.setItem(id, JSON.stringify(venta))
  
    // Reemplazar en la lista de ventasHoy
    setVentasHoy((prev) => {
      const actualizadas = prev.filter(v => v.id !== id)
      return [...actualizadas, venta]
    })
  
    alert(`Venta registrada. Número: ${id}`)
    setPedido([])
    setMostrarNuevaVenta(false)
    setVentaEditandoId(null)
  }  

  const total = pedido.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)

  return (
    <ProtectedRoute allowedRoles={['vendedor']}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            {mostrarNuevaVenta ? 'Nueva venta' : 'Ventas del día'}
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            Vendedor: <span className="font-semibold">{user?.nombre}</span>
          </p>
          <button
            onClick={() => {
              setMostrarNuevaVenta(!mostrarNuevaVenta)
              setPedido([])
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {mostrarNuevaVenta ? 'Volver al historial' : 'Nueva venta'}
          </button>
        </div>

        {!mostrarNuevaVenta ? (
          <div>
            {ventasHoy.length === 0 ? (
              <p>No hay ventas registradas hoy.</p>
            ) : (
            <div className="space-y-4">
              {ventasHoy.map((venta) => (
                <div key={venta.id} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition">
                  <p className="text-sm text-gray-500">N° {venta.id}</p>
                  <p><strong>Fecha:</strong> {venta.fecha}</p>  
                  <p className="text-lg font-bold text-gray-800">
                    Total: <span className="text-blue-600">S/ {venta.total.toFixed(2)}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <strong>Estado:</strong>
                    <span
                      className={`px-2 py-1 text-xs rounded font-semibold uppercase ${
                        venta.estado === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : venta.estado === 'aprobado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {venta.estado}
                    </span>
                  </p>
                  {venta.tipoComprobante && (
                    <p><strong>Comprobante:</strong> {venta.tipoComprobante}</p>
                  )}

                  {venta.tipoComprobante === 'boleta' && venta.cliente?.nombres && (
                    <>
                      <p><strong>Cliente:</strong> {venta.cliente.nombres}</p>
                      <p><strong>DNI:</strong> {venta.cliente.dni}</p>
                      <p><strong>Dirección:</strong> {venta.cliente.direccion}</p>
                    </>
                  )}

                  {venta.tipoComprobante === 'factura' && venta.cliente?.razonSocial && (
                    <>
                      <p><strong>Razón Social:</strong> {venta.cliente.razonSocial}</p>
                      <p><strong>RUC:</strong> {venta.cliente.ruc}</p>
                      <p><strong>Dirección:</strong> {venta.cliente.direccion}</p>
                    </>
                  )}

                  <p className="text-sm text-gray-600 mt-2">
                    Productos: {venta.productos.map(p => `${p.producto.nombre} x ${p.cantidad}`).join(', ')}
                  </p>

                  {venta.estado === 'pendiente' && (
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
                      }}
                      className="mt-2 text-blue-600 underline text-sm"
                    >
                      Modificar
                    </button>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
        ) :  (
          <>
            {/* Sección de búsqueda */}
            <div className="mb-6">
              <label htmlFor="buscar" className="block font-bold mb-2">Buscar producto</label>
              <input
                id="buscar"
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre"
                className="border px-3 py-2 rounded w-full"
                list="sugerencias"
              />
              <datalist id="sugerencias">
                {productos
                  .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                  .map(p => (
                    <option key={p.id} value={p.nombre} />
                  ))}
              </datalist>
              <button
                onClick={() => {
                  const producto = productos.find(p =>
                    p.nombre.toLowerCase() === busqueda.toLowerCase()
                  )
                  if (producto) {
                    agregarProducto(producto)
                    setBusqueda('')
                  } else {
                    alert('Producto no encontrado')
                  }
                }}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
              >
                Agregar
              </button>
            </div>

        
            {/* Resumen del pedido */}
            {pedido.length > 0 && (
  <div className="mb-6">
    <h2 className="text-lg font-bold mb-3">Productos agregados</h2>
    <table className="w-full text-sm border mb-3">
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
                className="text-red-600"
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
      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
    >
      Confirmar venta
    </button>
  </div>
)}

          </>
        ) } 
        
          {/* aquí mantienes la parte de historial */}
        

        <button onClick={logout} className="mt-6 text-red-600 underline block">
          Cerrar sesión
        </button>
      </div>
      {mostrarClienteModal && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4">Datos del cliente</h2>

      <div className="mb-4">
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
          onClick={() => setMostrarClienteModal(false)}
          className="border px-4 py-2 rounded"
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
          className="bg-blue-600 text-white px-4 py-2 rounded"
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
