'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getVentasPendientes } from '@/services/ventaService'
import { VentaPendiente } from '@/types/venta'

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

type MetodoPago = 'efectivo' | 'tarjeta' | 'yape'

export default function CajaPage() {
  const { logout } = useAuth()
  const [ventasPendientes, setVentasPendientes] = useState<VentaPendiente[]>([])

  const [pedidoId, setPedidoId] = useState('')
  const [pedido, setPedido] = useState<PedidoItem[] | null>(null)
  const [tipoComprobante, setTipoComprobante] = useState<'boleta' | 'factura'>('boleta')
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo')
  const [cliente, setCliente] = useState({ dni: '', ruc: '', nombre: '' })

  const buscarPedido = () => {
  const datos = localStorage.getItem(pedidoId)
  if (!datos) {
    alert('Pedido no encontrado.')
    setPedido(null)
    return
  }

  try {
    const parsed = JSON.parse(datos)
    if (Array.isArray(parsed.productos)) {
      const productosConPrecioNumerico = parsed.productos.map((item: PedidoItem) => ({
        ...item,
        producto: {
          ...item.producto,
          precio: Number(item.producto.precio),
        },
      }))
      setPedido(productosConPrecioNumerico)
    } else {
      alert('El formato del pedido no es válido.')
      setPedido(null)
    }
  } catch (error) {
    console.error('Error al parsear el pedido:', error)
    alert('Error al leer el pedido.')
    setPedido(null)
  }
}

useEffect(() => {
  const cargarPendientes = async () => {
    try {
      const data = await getVentasPendientes()
      setVentasPendientes(data) // ✅ ahora sí matchea con el tipo
    } catch (err) {
      console.error('Error al cargar ventas pendientes:', err)
    }
  }

  cargarPendientes()
}, [])

  const total = pedido?.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0) || 0

  const finalizarVenta = () => {
    alert(`Venta registrada\nComprobante: ${tipoComprobante.toUpperCase()}\nPago: ${metodoPago}\nTotal: S/ ${total.toFixed(2)}`)
    localStorage.removeItem(pedidoId)
    setPedido(null)
    setPedidoId('')
  }

  return (
    <ProtectedRoute allowedRoles={['caja']}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Caja</h1>

        {/* Buscar venta */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={pedidoId}
            onChange={(e) => setPedidoId(e.target.value)}
            placeholder="Número de venta"
            className="border px-3 py-2 rounded w-full"
          />
          <button onClick={buscarPedido} className="bg-blue-600 text-white px-4 rounded">
            Buscar
          </button>
        </div>

        {ventasPendientes.length > 0 && (
  <div className="mt-6">
    <h2 className="text-lg font-semibold mb-2">Ventas Pendientes</h2>
    <table className="w-full text-sm border">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-2 py-1">N° Venta</th>
          <th className="border px-2 py-1">Cliente</th>
          <th className="border px-2 py-1">Monto</th>
          <th className="border px-2 py-1">Contacto</th>
          <th className="border px-2 py-1">Acción</th>
        </tr>
      </thead>
      <tbody>
        {ventasPendientes.map((venta) => (
          <tr key={venta.id}>
            <td className="border px-2 py-1">{venta.numero_venta}</td>
            <td className="border px-2 py-1">{venta.nombre}</td>
            <td className="border px-2 py-1">S/ {venta.total.toFixed(2)}</td>
            <td className="border px-2 py-1">{venta.telefono}</td>
            <td className="border px-2 py-1">
              <button
                onClick={() => setPedidoId(venta.id.toString())}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Seleccionar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


        {pedido && (
          <>
            <div className="border-t pt-4 mb-4">
              <h2 className="text-lg font-semibold mb-2">Detalle del pedido</h2>
              <ul>
                {pedido.map(({ producto, cantidad }) => (
                  <li key={producto.id} className="mb-1">
                    {producto.nombre} - S/ {producto.precio} x {cantidad}
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-bold">Total: S/ {total.toFixed(2)}</p>
            </div>

            {/* Comprobante */}
            <div className="mb-4">
              <h3 className="font-semibold">Tipo de comprobante:</h3>
              <label className="mr-4">
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

            {/* Datos del cliente */}
            <div className="mb-4">
              <h3 className="font-semibold">Datos del cliente:</h3>
              {tipoComprobante === 'boleta' ? (
                <input
                  type="text"
                  placeholder="DNI"
                  value={cliente.dni}
                  onChange={(e) => setCliente({ ...cliente, dni: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                />
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="RUC"
                    value={cliente.ruc}
                    onChange={(e) => setCliente({ ...cliente, ruc: e.target.value })}
                    className="border px-3 py-2 rounded w-full mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Razón social"
                    value={cliente.nombre}
                    onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                    className="border px-3 py-2 rounded w-full"
                  />
                </>
              )}
            </div>

            {/* Método de pago */}
            <div className="mb-4">
              <h3 className="font-semibold">Método de pago:</h3>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                title="Método de pago"
                className="border px-3 py-2 rounded w-full"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="yape">Yape / Plin</option>
              </select>
            </div>
            {/* Vista previa del comprobante */}
<div className="border rounded-md p-4 bg-white shadow mb-6">
  <h3 className="text-lg font-semibold mb-2 text-center">
    Vista previa - {tipoComprobante === 'boleta' ? 'Boleta de venta' : 'Factura'}
  </h3>

  <div className="text-sm mb-4">
    <p><strong>Cliente:</strong> {tipoComprobante === 'boleta' ? `DNI: ${cliente.dni}` : `RUC: ${cliente.ruc} - ${cliente.nombre}`}</p>
    <p><strong>Comprobante:</strong> {tipoComprobante.toUpperCase()}</p>
    <p><strong>Método de pago:</strong> {metodoPago}</p>
    <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
  </div>

  <table className="w-full text-sm border">
    <thead>
      <tr className="bg-gray-100 text-left">
        <th className="border px-2 py-1">Producto</th>
        <th className="border px-2 py-1">Cantidad</th>
        <th className="border px-2 py-1">P. Unitario</th>
        <th className="border px-2 py-1">Total</th>
      </tr>
    </thead>
    <tbody>
      {pedido.map(({ producto, cantidad }) => (
        <tr key={producto.id}>
          <td className="border px-2 py-1">{producto.nombre}</td>
          <td className="border px-2 py-1">{cantidad}</td>
          <td className="border px-2 py-1">S/ {producto.precio.toFixed(2)}</td>
          <td className="border px-2 py-1">S/ {(producto.precio * cantidad).toFixed(2)}</td>
        </tr>
      ))}
    </tbody>
  </table>

  <div className="text-right font-bold mt-3">
    Total: S/ {total.toFixed(2)}
  </div>
</div>
            <button
              onClick={finalizarVenta}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Confirmar y generar comprobante
            </button>
            localStorage.removeItem(pedidoId)
          </>
        )}

        <button onClick={logout} className="mt-6 text-red-600 underline block">
          Cerrar sesión
        </button>
      </div>
    </ProtectedRoute>
  )
}
