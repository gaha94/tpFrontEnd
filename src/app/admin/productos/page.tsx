'use client'
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Producto } from '@/types/venta'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchProductos } from '@/services/productService'


export default function ProductosPage() {
    const [productos, setProductos] = useState<Producto[]>([])
    const [editandoId, setEditandoId] = useState<string | null>(null)
    const [busqueda, setBusqueda] = useState('')
    const [modoEdicion, setModoEdicion] = useState(false)
    const [mostrarFormulario, setMostrarFormulario] = useState(false) // ✅ Añadir esto
    const [intentoEnvio, setIntentoEnvio] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [nuevoProducto, setNuevoProducto] = useState<Producto>({
      id: '',
      nombre: '',
      precio: 0,
      stock: 0,
      categoria: '',
      marca: ''
    })
    
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await fetchProductos()
        setProductos(data)
      } catch (error) {
        console.error('Error al obtener productos:', error)
      }
    }
    cargar()
  }, [])

  const guardarProductos = (productosActualizados: Producto[]) => {
    setProductos(productosActualizados)
    localStorage.setItem('productos', JSON.stringify(productosActualizados))
  }

  const handleGuardar = () => {
    if (
      !nuevoProducto.nombre ||
      nuevoProducto.precio <= 0 ||
      nuevoProducto.stock < 0 ||
      !nuevoProducto.categoria ||
      !nuevoProducto.marca
    ) {
      alert('Por favor completa todos los campos correctamente.')
      return
    }
  
    if (modoEdicion && editandoId) {
      // Editar producto existente
      const actualizados = productos.map(p =>
        p.id === editandoId ? { ...nuevoProducto, id: editandoId } : p
      )
      guardarProductos(actualizados)
    } else {
      // Agregar nuevo producto
      const nuevo = {
        ...nuevoProducto,
        id: Date.now().toString()
      }
      guardarProductos([...productos, nuevo])
    }
  
    // Resetear formulario
    setNuevoProducto({ id: '', nombre: '', precio: 0, stock: 0, categoria: '', marca: '' })
    setEditandoId(null)
    setModoEdicion(false)
  }
  

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div>
        <h1 className="text-2xl font-bold mb-6">Gestión de Productos</h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="border px-3 py-2 rounded w-full md:max-w-md"
            />
            <button
                onClick={() => {
                setNuevoProducto({ id: '', nombre: '', precio: 0, stock: 0, categoria: '', marca: '' })
                setModoEdicion(false)
                setMostrarFormulario(true)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
            >
                Agregar producto
            </button>
        </div>
        {/* Tabla de productos */}
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Precio</th>
              <th className="border px-2 py-1">Stock</th>
              <th className="border px-2 py-1">Categoria</th>
              <th className="border px-2 py-1">Marca</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos
            .filter(p => {
                const termino = busqueda.toLowerCase()
                return (
                p.nombre.toLowerCase().includes(termino) ||
                p.categoria.toLowerCase().includes(termino) ||
                p.marca.toLowerCase().includes(termino)
                )
            })
            .map((p) => (
              <tr key={p.id}>
                <td className="border px-2 py-1">{p.nombre}</td>
                <td className="border px-2 py-1">S/ {p.precio.toFixed(2)}</td>
                <td className="border px-2 py-1">{p.stock}</td>
                <td className="border px-2 py-1">{p.categoria}</td>
                <td className="border px-2 py-1">{p.marca}</td>
                <td className="border px-2 py-1">
                <button
                    onClick={() => {
                        setNuevoProducto(p)
                        setEditandoId(p.id)
                        setModoEdicion(true)
                        setMostrarFormulario(true)
                      }}                      
                    className="text-blue-600 hover:underline mr-2"
                >
                    Editar
                </button>
                <button
                    onClick={() => {
                    const confirmado = confirm('¿Estás seguro de eliminar este producto?')
                    if (confirmado) {
                        const actualizados = productos.filter(item => item.id !== p.id)
                        guardarProductos(actualizados)
                    }
                    }}
                    className="text-red-600 hover:underline"
                >
                    Eliminar
                </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mostrarFormulario && (
  <div className="fixed inset-0 bg-gray-100 bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow w-full max-w-2xl relative">
    {mensaje && (
  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded flex justify-between items-center">
    <span>{mensaje}</span>
    <button
      onClick={() => {
        setMensaje('')
        setMostrarFormulario(false)
        setIntentoEnvio(false)
      }}
      className="text-sm font-semibold ml-4 text-green-700 hover:underline"
    >
      Cerrar
    </button>
  </div>
)}

      <h2 className="text-xl font-bold mb-4">
        {modoEdicion ? 'Editar producto' : 'Agregar nuevo producto'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            placeholder="Nombre"
            value={nuevoProducto.nombre}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
            className={`border px-3 py-2 rounded w-full ${
                intentoEnvio && !nuevoProducto.nombre ? 'border-red-500' : ''
              }`}
              
              
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Precio</label>
          <input
            type="number"
            placeholder="Precio"
            value={nuevoProducto.precio}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: parseFloat(e.target.value) })}
            className={`border px-3 py-2 rounded w-full ${
                intentoEnvio && !nuevoProducto.nombre ? 'border-red-500' : ''
              }`}            
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            placeholder="Stock"
            value={nuevoProducto.stock}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: parseInt(e.target.value) })}
            className={`border px-3 py-2 rounded w-full ${
                intentoEnvio && !nuevoProducto.nombre ? 'border-red-500' : ''
              }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <input
            type="text"
            placeholder="Categoría"
            value={nuevoProducto.categoria}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })}
            className={`border px-3 py-2 rounded w-full ${
                intentoEnvio && !nuevoProducto.nombre ? 'border-red-500' : ''
              }`}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Marca</label>
          <input
            type="text"
            placeholder="Marca"
            value={nuevoProducto.marca}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, marca: e.target.value })}
            className={`border px-3 py-2 rounded w-full ${
                intentoEnvio && !nuevoProducto.nombre ? 'border-red-500' : ''
              }`}
          />
        </div>
      </div>

      <div className="flex justify-end mt-6 gap-3">
        <button
          onClick={() => {
            setMostrarFormulario(false)
            setIntentoEnvio(false)
        }}
          className="px-4 py-2 border rounded"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            setIntentoEnvio(true)
            const camposInvalidos =
              !nuevoProducto.nombre ||
              nuevoProducto.precio <= 0 ||
              nuevoProducto.stock < 0 ||
              !nuevoProducto.categoria ||
              !nuevoProducto.marca
          
            if (camposInvalidos) return
          
            handleGuardar()
            setMensaje(modoEdicion ? 'Producto actualizado correctamente' : 'Producto agregado correctamente')
            setMostrarFormulario(false)
            setIntentoEnvio(false)
          
            setTimeout(() => {
              setMensaje('')
            }, 3000)
          }}
          
          
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {modoEdicion ? 'Guardar cambios' : 'Agregar'}
        </button>
      </div>
    </div>
  </div>
)}
<AnimatePresence>
  {mensaje && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed top-6 right-6 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-[9999]"
    >
      {mensaje}
    </motion.div>
  )}
</AnimatePresence>



    </ProtectedRoute>
  )
}
