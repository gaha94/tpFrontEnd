'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { fetchProductos  } from '@/services/productService'
import { createVentaService, getVentasDelVendedorHoy } from '@/services/ventaService'
import { getComprobantes } from '@/services/comprobanteService'
import { buscarClientesPorNombre } from '@/services/clienteService'
import { ClienteBuscado } from '@/types/cliente'


interface Producto {
  id: number
  nombre: string
  unidad: string
  stock?: number
  precio: number // precio actualmente seleccionado
  precio1: number
  precio2: number
  precio3: number
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
  tipoComprobante?: string
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
  const token = typeof window !== 'undefined'
  ? localStorage.getItem('token') || sessionStorage.getItem('token')
  : null
  const [ventasHoy, setVentasHoy] = useState<Venta[]>([])
  const [mostrarNuevaVenta, setMostrarNuevaVenta] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedido, setPedido] = useState<PedidoItem[]>([])
  const [mostrarClienteModal, setMostrarClienteModal] = useState(false)
  const [tipoComprobante, setTipoComprobante] = useState<string>('') // ya no 'boleta' o 'factura'
  const [ventaEditandoId, setVentaEditandoId] = useState<string | null>(null)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [sugerencias, setSugerencias] = useState<ClienteBuscado[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteBuscado | null>(null)
  const [cliente, setCliente] = useState({
    nombres: '',
    dni: '',
    direccion: '',
    ruc: '',
    razonSocial: ''
  })
  const [comprobantes, setComprobantes] = useState<{ listado: string; ctipdocu: string; cserdocu: string }[]>([])
  const [serieSeleccionada, setSerieSeleccionada] = useState<{ ctipdocu: string, cserdocu: string } | null>(null)
  const predictorRef = useRef<HTMLDivElement>(null)

  const [mostrarNuevoClienteModal, setMostrarNuevoClienteModal] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState({
    tipo_documento: '',
    documento: '',
    nombre: '',
    direccion: '',
    telefono: '',
    correo: '',
    nestrella: 1,
    cestrella: '',
    lat: '',
    long: '',
  })


  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusquedaCliente(valor);
    setClienteSeleccionado(null);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const tipo = tipoComprobante.split('/')[0]; // e.g., "01" de "01/F004"

    if (valor.length < 2 || !token || !tipoComprobante) {
      setSugerencias([]);
      return;
    }

    console.log('[DEBUG] Token actual:', token);
    console.log('[DEBUG] Tipo comprobante:', tipo);

    try {
      const resultados = await buscarClientesPorNombre(valor, tipo, token);
      setSugerencias(resultados);
    } catch (err) {
      console.error('Error buscando clientes:', err);
    }
  };

  const handleGuardarNuevoCliente = async () => {
    try {
      if (!nuevoCliente.documento || !nuevoCliente.nombre) {
        alert('Documento y nombre son obligatorios.')
        return
      }

      const res = await fetch('http://localhost:4001/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoCliente)
      })

      if (!res.ok) throw new Error('Error al registrar el cliente.')

      const data = await res.json()
      alert('Cliente registrado correctamente.')

      // Opcional: podrías setear como clienteSeleccionado al nuevo cliente aquí
      setMostrarNuevoClienteModal(false)
      setNuevoCliente({
        tipo_documento: 'RUC',
        documento: '',
        nombre: '',
        direccion: '',
        telefono: '',
        correo: '',  nestrella: 1,
        cestrella: '',
        lat: '',
        long: '',
          })
        } catch (err) {
          console.error('Error al guardar cliente:', err)
          alert('No se pudo registrar el cliente.')
        }
      }


  const seleccionarCliente = (cliente: ClienteBuscado) => {
    setClienteSeleccionado(cliente)
    setBusquedaCliente(cliente.cnomclie)
    setSugerencias([])
  }

    useEffect(() => {
      const cargarComprobantes = async () => {
        try {
          if (!token) return
          const data = await getComprobantes(token)
          console.log('[DEBUG] Comprobantes cargados:', data) // 👈 agrega esto
          setComprobantes(data)
        } catch (err) {
          console.error('Error al obtener comprobantes:', err)
        }
      }

      cargarComprobantes()
    }, [token])

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        if (!token) return

        console.log('[DEBUG] Token obtenido:', token)
        const data = await fetchProductos(token)

        // Agregar propiedad 'precio' inicial y asegurar los nombres
        const productosConPrecios = data.map((prod: any) => ({
          ...prod,
          precio1: prod.precio1,
          precio2: prod.precio2,
          precio3: prod.precio3,
          precio: prod.precio1 // Precio por defecto
        }))

        console.log('[DEBUG] Productos mapeados:', productosConPrecios)
        setProductos(productosConPrecios)
      } catch (error) {
        console.error('[ERROR] Error al cargar productos:', error)
      }
    }
    cargarProductos()
  }, [token])



  /* useEffect(() => {
    const cargarVentas = async () => {
      if (!token) return
      try {
        const data = await getVentasDelVendedorHoy(token)
        setVentasHoy(data)
      } catch (error) {
        console.error('Error al cargar ventas del vendedor:', error)
      }
    }
    cargarVentas()
  }, [token]) */

  useEffect(() => {
    setBusquedaCliente('')
    setClienteSeleccionado(null)
    setSugerencias([])
  }, [tipoComprobante])


  const agregarProducto = (producto: Producto) => {
    const existe = pedido.find((p) => p.producto.id === producto.id)
    if (!existe) {
      const productoConPrecio = {
        ...producto,
        precio: producto.precio1, // valor inicial
      }
      setPedido([...pedido, { producto: productoConPrecio, cantidad: 1 }])
    }
  }


  const cambiarCantidad = (id: number, nuevaCantidad: number) => {
    setPedido(pedido.map(item =>
      item.producto.id === Number(id) ? { ...item, cantidad: nuevaCantidad } : item
    ))
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        predictorRef.current &&
        !predictorRef.current.contains(event.target as Node)
      ) {
        setMostrarSugerencias(false)
      }
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMostrarSugerencias(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [])

  const cambiarPrecio = (productoId: number, nuevoPrecio: number) => {
    setPedido(prev =>
      prev.map(item =>
        item.producto.id === productoId
          ? { ...item, producto: { ...item.producto, precio: nuevoPrecio } }
          : item
      )
    )
  }


  const eliminarProducto = (id: number) => {
    setPedido(pedido.filter(item => item.producto.id !== Number(id)))
  }

const guardarPedido = async () => {
  if (!user) throw new Error('Usuario no autenticado')
    
  const id = ventaEditandoId || Date.now().toString()
  const fecha = new Date().toISOString()
  const total = pedido.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)

  const venta: Venta = {
    id,
    vendedor: user.nombre,
    fecha,
    productos: pedido,
    total,
    tipoComprobante,
    cliente,
    estado: 'pendiente'
  }
  if (!clienteSeleccionado?.ccodclie) {
  alert('Debes seleccionar un cliente válido.')
  return
}

  if (!serieSeleccionada?.ctipdocu || !serieSeleccionada?.cserdocu) {
    alert('Selecciona un comprobante válido.')
    return
  }

await createVentaService({
  clienteId: clienteSeleccionado?.ccodclie,
  serie: {
    ctipdocu: serieSeleccionada?.ctipdocu,
    cserdocu: serieSeleccionada?.cserdocu
  },
  detalle: pedido.map(item => ({
    productoId: item.producto.id.toString().padStart(10, "0"),
    ncanprod: item.cantidad,
    tipoPrecio:
      item.producto.precio === item.producto.precio1
        ? "1"
        : item.producto.precio === item.producto.precio2
        ? "2"
        : "3"
  }))
}, token!)


  // Actualiza ventas locales
  setVentasHoy((prev) => {
    const actualizadas = prev.filter(v => v.id !== id)
    return [...actualizadas, venta]
  })

  alert(`Venta ${ventaEditandoId ? 'actualizada' : 'registrada'}. Número: ${id}`)
  setPedido([])
  setCliente({ nombres: '', dni: '', direccion: '', ruc: '', razonSocial: '' })
  setMostrarNuevaVenta(false)
  setVentaEditandoId(null)
}


  const total = pedido.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)

  return (
    <ProtectedRoute>
      <div className="p-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 max-w-screen-xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
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
                    <p>Vista de ventas desactivada temporalmente.</p>
                  </div>
                ) : (
                  <>
                    {/* Sección de búsqueda */}
                    <div 
                    ref={predictorRef}
                    className="relative w-full sm:w-3/4 md:w-2/3 lg:w-1/2 mx-auto mb-4">
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => {
                        setBusqueda(e.target.value)
                        setMostrarSugerencias(true)
                      }}
                      placeholder="Buscar producto..."
                      className="border border-gray-300 px-4 py-2 rounded w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />

                    {/* Lista desplegable de sugerencias */}
                    {busqueda && mostrarSugerencias && (
                      <div className="absolute left-0 right-0 z-20 bg-white border border-gray-300 rounded shadow-lg mt-1">
                      {/* Botón de cerrar */}
                      <div className="flex justify-end px-2 py-1 border-b bg-gray-50">
                        <button
                          onClick={() => setMostrarSugerencias(false)}
                          className="text-sm text-gray-500 hover:text-red-600"
                          title="Cerrar sugerencias"
                        >
                          ✖
                        </button>
                      </div>
                      {/*Lista de sugerencias */}
                      <ul className="max-h-60 overflow-y-auto">
                      {productos
                        .filter(p => {
                          const coincide = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
                          return coincide
                        })
                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                        .map((p) => (
                          <li
                            key={p.id}
                            className="flex justify-between items-center px-4 py-2 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <span
                              onClick={() => {
                                agregarProducto(p)
                                setBusqueda('')
                                setMostrarSugerencias(false) // cerrar sugerencias al seleccionar
                              }}
                              className="cursor-pointer"
                            >
                              {p.nombre} <span className="text-gray-500 text-sm">({p.unidad || '—'})</span>
                            </span>

                            <button
                              title="Agregar producto sin cerrar búsqueda"
                              onClick={(e) => {
                                e.stopPropagation() // evitar que dispare el onClick del <span>
                                agregarProducto(p)
                                // no limpiamos búsqueda para permitir seguir seleccionando
                              }}
                              className="ml-4 text-green-600 font-bold text-xl hover:text-green-800 cursor-pointer"
                            >
                              ➕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    )}
                    </div>
                    {/* Resumen del pedido */}
                    {pedido.length > 0 && (
                      <>
                        <h2 className="text-lg font-bold mb-3">Productos agregados</h2>

                        {/* 🌐 Tabla para pantallas grandes */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="min-w-full border table-auto text-sm bg-white shadow rounded mb-6">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border px-2 py-1 text-xs">Producto</th>
                                <th className="border px-2 py-1">Unidad</th>
                                <th className="border px-2 py-1">Cantidad</th>
                                <th className="border px-2 py-1">P. Unit</th>
                                <th className="border px-2 py-1">Total</th>
                                <th className="border px-2 py-1">Acción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pedido.map(({ producto, cantidad }) => (
                                <tr key={producto.id}>
                                  <td className="border px-2 py-1 text-xs break-words">{producto.nombre}</td>
                                  <td className="border px-2 py-1">{producto.unidad || '—'}</td>
                                  <td className="border px-2 py-1">
                                    <input
                                      type="number"
                                      min={1}
                                      max={producto.stock}
                                      value={cantidad}
                                      onChange={(e) => cambiarCantidad(producto.id, parseInt(e.target.value))}
                                      className="w-16 border px-2 rounded"
                                    />
                                  </td>
                                  <td className="border px-2 py-1">
                                    <select
                                      title='Selecciona un precio'
                                      value={producto.precio}
                                      onChange={(e) => cambiarPrecio(producto.id, parseFloat(e.target.value))}
                                      className="border rounded px-2 py-1 text-sm"
                                    >
                                      <option value={producto.precio1}>S/ {producto.precio1.toFixed(2)} (P1)</option>
                                      <option value={producto.precio2}>S/ {producto.precio2.toFixed(2)} (P2)</option>
                                      <option value={producto.precio3}>S/ {producto.precio3.toFixed(2)} (P3)</option>
                                    </select>
                                  </td>
                                  <td className="border px-2 py-1">
                                    S/ {(producto.precio * cantidad).toFixed(2)}
                                  </td>
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
                        </div>

                        {/* 📱 Vista tipo tarjeta para móviles */}
                        <div className="md:hidden space-y-4 pb-28">
                          {pedido.map(({ producto, cantidad }) => (
                            <div key={producto.id} className="border p-3 rounded shadow-sm bg-white">
                              <p className="text-sm font-bold">{producto.nombre}</p>
                              <p className="text-xs text-gray-600">Unidad: {producto.unidad || '—'}</p>

                              <div className="flex items-center gap-2 mt-2">
                                <label className="text-sm">Cantidad:</label>
                                <input
                                  type="number"
                                  min={1}
                                  max={producto.stock}
                                  value={cantidad}
                                  onChange={(e) => cambiarCantidad(producto.id, parseInt(e.target.value))}
                                  className="w-20 border px-2 py-1 rounded"
                                />
                              </div>

                              <div className="mt-2">
                                <label className="text-sm">Precio unitario:</label>
                                <select
                                  value={producto.precio}
                                  onChange={(e) => cambiarPrecio(producto.id, parseFloat(e.target.value))}
                                  className="w-full border px-2 py-1 rounded text-sm mt-1"
                                >
                                  <option value={producto.precio1}>S/ {producto.precio1.toFixed(2)} (P1)</option>
                                  <option value={producto.precio2}>S/ {producto.precio2.toFixed(2)} (P2)</option>
                                  <option value={producto.precio3}>S/ {producto.precio3.toFixed(2)} (P3)</option>
                                </select>
                              </div>

                              <div className="mt-2 flex justify-between items-center">
                                <p className="text-sm font-semibold">
                                  Total: S/ {(producto.precio * cantidad).toFixed(2)}
                                </p>
                                <button
                                  onClick={() => eliminarProducto(producto.id)}
                                  className="text-red-600 text-sm px-2 py-1 hover:bg-red-100 rounded"
                                >
                                  Quitar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* ✅ Total + botón confirmación */}
                        <div className="hidden md:block mt-4">
                          <p className="text-right font-bold text-lg">Total: S/ {total.toFixed(2)}</p>
                          <button
                            onClick={() => setMostrarClienteModal(true)}
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                          >
                            Confirmar venta
                          </button>
                        </div>

                        {/* 📱 Botón fijo en móviles */}
                        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
                          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
                            <p className="font-semibold text-base text-gray-800">
                              Total: S/ {total.toFixed(2)}
                            </p>
                            <button
                              onClick={() => setMostrarClienteModal(true)}
                              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            >
                              Confirmar venta
                            </button>
                          </div>
                        </div>

                      </>
                    )}

                  </>
                ) } 
                  {/* aquí mantienes la parte de historial */}        
        {mostrarClienteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded shadow w-[90%] max-w-lg">
              <h2 className="text-xl font-bold mb-4">Datos del cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="mb-4">
                  <label className="block font-medium mb-1">Tipo de comprobante:</label>
                  <select
                    value={tipoComprobante}
                    onChange={(e) => {
                      const [ctipdocu, cserdocu] = e.target.value.split('/')
                      setTipoComprobante(e.target.value)
                      setSerieSeleccionada({
                        ctipdocu,
                        cserdocu
                      }) // <-- Nuevo estado, ver abajo
                      setClienteSeleccionado(null)
                      setBusquedaCliente('')
                      setSugerencias([])
                    }}
                    className="border rounded w-full px-3 py-2"
                  >
                    <option value="">Selecciona un comprobante</option>
                    {comprobantes.map((c) => (
                      <option key={c.ctipdocu + c.cserdocu} value={`${c.ctipdocu}/${c.cserdocu}`}>
                        {c.listado}
                      </option>
                    ))}
                  </select>

                </div>
              </div>

        <div className="relative">
          <input
            type="text"
            value={busquedaCliente}
            onChange={handleInputChange}
            placeholder="Escribe el nombre del cliente"
            className="border px-3 py-2 rounded w-full"
          />

          {!clienteSeleccionado && sugerencias.length > 0 && (
            <ul className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-10 max-h-48 overflow-auto">
              {sugerencias
              .sort((a, b) => a.cnomclie.localeCompare(b.cnomclie))
              .map((cliente) => (
                <li
                  key={cliente.ccodclie}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => seleccionarCliente(cliente)}
                >
                  {cliente.cnomclie}
                </li>
              ))}
            </ul>
          )}

          {clienteSeleccionado ? (
            <div className="mt-4 space-y-2">
              <input
                value={clienteSeleccionado.crucclie}
                readOnly
                className="border w-full px-3 py-2 rounded bg-gray-100"
                placeholder="RUC"
              />
              <input
                value={clienteSeleccionado.cdirclie}
                readOnly
                className="border w-full px-3 py-2 rounded bg-gray-100"
                placeholder="Dirección"
              />
              <input
                value={`★`.repeat(clienteSeleccionado.nestrella)}
                readOnly
                className="border w-full px-3 py-2 rounded bg-gray-100"
                placeholder="Estrellas"
              />
              <textarea
                value={clienteSeleccionado.cestrella}
                readOnly
                className="border w-full px-3 py-2 rounded bg-gray-100"
                placeholder="Comentarios"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${clienteSeleccionado.latitud || ''},${clienteSeleccionado.longitud || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 underline mt-1"
              >
                {clienteSeleccionado.latitud && clienteSeleccionado.longitud
                  ? 'Ver ubicación en Google Maps'
                  : 'Sin ubicación'}
              </a>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setClienteSeleccionado(null)
                    setBusquedaCliente('')
                    setSugerencias([])
                  }}
                  className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 text-sm"
                >
                  Limpiar selección
                </button>
                <button
                  onClick={() => {
                    setMostrarNuevoClienteModal(true)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Agregar cliente nuevo
                </button>
              </div>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="RUC"
                className="w-full text-sm px-3 py-2 border rounded"
                value={cliente.ruc}
                onChange={(e) => setCliente({ ...cliente, ruc: e.target.value })}
              />
              <input
                type="text"
                placeholder="Dirección"
                className="w-full text-sm px-3 py-2 border rounded"
                value={cliente.direccion}
                onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
              />
            </>
          )}
        </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setMostrarClienteModal(false)
                    setCliente({ nombres: '', dni: '', direccion: '', ruc: '', razonSocial: '' })
                  }}
                  className="w-full sm:w-auto border px-4 py-2 rounded cursor-pointer hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const tipo = tipoComprobante.split('/')[0]
                    if (tipo === '03' && (!cliente.nombres || !cliente.dni)) {
                      alert('Completa todos los campos para boleta.')
                      return
                    }
                    if (tipo === '01' && !clienteSeleccionado) {
                      alert('Debes seleccionar un cliente válido para factura.')
                      return
                    }
                    guardarPedido()
                    setMostrarClienteModal(false)
                  }}
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
                >
                  Confirmar venta
                </button>
              </div>
            </div>
          </div>
        )}
        {mostrarNuevoClienteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-[90%] max-w-lg">
              <h2 className="text-xl font-bold mb-4">Nuevo Cliente</h2>

              <div className="grid grid-cols-1 gap-3 mb-4">
                <select
                title='Selecciona el tipo de documento'
                  value={nuevoCliente.tipo_documento}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, tipo_documento: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="">Tipo de documento</option>
                  <option value="RUC">RUC</option>
                  <option value="DNI">DNI</option>
                </select>
                <input
                  type="text"
                  placeholder="Documento"
                  value={nuevoCliente.documento}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, documento: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Nombre / Razón Social"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Dirección"
                  value={nuevoCliente.direccion}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={nuevoCliente.correo}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, correo: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                />

                {/* ⭐ Estrellas */}
                <label className="block font-medium">Puntuación:</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((estrella) => (
                    <button
                      type="button"
                      key={estrella}
                      onClick={() => setNuevoCliente({ ...nuevoCliente, nestrella: estrella })}
                      className={`text-2xl ${estrella <= nuevoCliente.nestrella ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                {/* 📝 Comentario */}
                <textarea
                  placeholder="Comentario sobre el cliente (opcional)"
                  value={nuevoCliente.cestrella}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, cestrella: e.target.value })}
                  className="border px-3 py-2 rounded w-full mt-2"
                />

                {/* 📍 Ubicación */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Latitud"
                    value={nuevoCliente.lat}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, lat: e.target.value })}
                    className="border px-3 py-2 rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="Longitud"
                    value={nuevoCliente.long}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, long: e.target.value })}
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>
                <a
                  href="https://www.google.com/maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm underline"
                >
                  ¿No sabes la latitud/longitud? Búscalas aquí en Google Maps
                </a>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setMostrarNuevoClienteModal(false)}
                  className="border px-4 py-2 rounded hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarNuevoCliente}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
