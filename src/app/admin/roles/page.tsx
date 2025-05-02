'use client'
import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Usuario } from '@/types/usuario'
import { motion, AnimatePresence } from 'framer-motion'


export default function RolesPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [nuevoUsuario, setNuevoUsuario] = useState<Usuario>({
    id: '',
    nombre: '',
    correo: '',
    rol: 'vendedor'
  })



  useEffect(() => {
    // Simulación de carga inicial desde localStorage o array base
    const data = localStorage.getItem('usuarios')
    if (data) {
      setUsuarios(JSON.parse(data))
    } else {
      const base: Usuario[] = [
        { id: '1', nombre: 'Admin', correo: 'admin@demo.com', rol: 'admin' },
        { id: '2', nombre: 'Caja 1', correo: 'caja@demo.com', rol: 'caja' },
        { id: '3', nombre: 'Vendedor 1', correo: 'vendedor@demo.com', rol: 'vendedor' }
      ]
      setUsuarios(base)
      localStorage.setItem('usuarios', JSON.stringify(base))
    }
  }, [])

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div>
        <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>
        <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setNuevoUsuario({ id: '', nombre: '', correo: '', rol: 'vendedor' })
            setMostrarFormulario(true)
            setIntentoEnvio(false)
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Agregar usuario
        </button>
      </div>

        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Correo</th>
              <th className="border px-2 py-1">Rol</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="border px-2 py-1">{u.nombre}</td>
                <td className="border px-2 py-1">{u.correo}</td>
                <td className="border px-2 py-1">
                  <select
                    value={u.rol}
                    onChange={(e) => {
                      const nuevoRol = e.target.value as Usuario['rol']
                      const actualizados = usuarios.map(user =>
                        user.id === u.id ? { ...user, rol: nuevoRol } : user
                      )
                      setUsuarios(actualizados)
                      localStorage.setItem('usuarios', JSON.stringify(actualizados))
                      setMensaje(`Rol actualizado a ${nuevoRol} para ${u.nombre}`)

                      setTimeout(() => {
                        setMensaje('')
                      }, 3000)
                    }}
                    title='Rol del usuario'
                    className="border px-2 py-1 rounded w-full"
                  >
                    <option value="admin">Admin</option>
                    <option value="caja">Caja</option>
                    <option value="vendedor">Vendedor</option>
                  </select>
                </td>
                <td className="border px-2 py-1 text-center">
  <button
    onClick={() => {
      const confirmado = confirm(`¿Eliminar al usuario "${u.nombre}"?`)
      if (!confirmado) return

      const actualizados = usuarios.filter(user => user.id !== u.id)
      setUsuarios(actualizados)
      localStorage.setItem('usuarios', JSON.stringify(actualizados))
      setMensaje(`Usuario "${u.nombre}" eliminado correctamente`)

      setTimeout(() => {
        setMensaje('')
      }, 3000)
    }}
    className="text-red-600 hover:underline text-sm"
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
    <div className="bg-white p-6 rounded shadow w-full max-w-lg relative">
      <h2 className="text-xl font-bold mb-4">Nuevo usuario</h2>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            value={nuevoUsuario.nombre}
            title='Nombre del usuario'
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
            className={`border px-3 py-2 rounded w-full ${
              intentoEnvio && !nuevoUsuario.nombre ? 'border-red-500' : ''
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Correo</label>
          <input
            type="email"
            value={nuevoUsuario.correo}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, correo: e.target.value })}
            title='Correo del usuario'
            className={`border px-3 py-2 rounded w-full ${
              intentoEnvio && !nuevoUsuario.correo ? 'border-red-500' : ''
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rol</label>
          <select
            value={nuevoUsuario.rol}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value as Usuario['rol'] })}
            title='Rol del usuario'
            className="border px-3 py-2 rounded w-full"
          >
            <option value="admin">Admin</option>
            <option value="caja">Caja</option>
            <option value="vendedor">Vendedor</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setMostrarFormulario(false)}
          className="border px-4 py-2 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            setIntentoEnvio(true)
            if (!nuevoUsuario.nombre || !nuevoUsuario.correo) return

            const nuevo = {
              ...nuevoUsuario,
              id: Date.now().toString()
            }
            const actualizados = [...usuarios, nuevo]
            setUsuarios(actualizados)
            localStorage.setItem('usuarios', JSON.stringify(actualizados))

            setMensaje('Usuario agregado correctamente')
            setMostrarFormulario(false)
            setIntentoEnvio(false)

            setTimeout(() => {
              setMensaje('')
            }, 3000)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Agregar
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
