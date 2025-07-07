'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import Link from 'next/link'

interface Cliente {
  id: number
  nombre: string
  saldo: number
}

interface Zona {
  idzona: number
  zona: string
}

export default function ConsultaZonaPage() {
  const [zonas, setZonas] = useState<Zona[]>([])
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const { token } = useAuth()

  useEffect(() => {
    const cargarZonas = async () => {
      try {
        if (!token) return

        const { data } = await api.get<Zona[]>('/zonas', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        setZonas(data)
      } catch (error) {
        console.error('Error al cargar zonas:', error)
      }
    }

    cargarZonas()
  }, [token])

  const buscarClientesPorZona = async () => {
    if (!sucursalSeleccionada) {
      alert('Selecciona una zona')
      return
    }

    try {
      const { data } = await api.get<Cliente[]>(`/clientes/zona?zona_id=${sucursalSeleccionada}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setClientes(data)
    } catch (error) {
      console.error('Error al obtener clientes:', error)
      alert('No se pudieron cargar los clientes')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 text-black">
      <h1 className="text-2xl font-bold mb-6">Consulta de Clientes por Zona</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Zona:</label>
          <select
          title='Seleccione una zona'
            value={sucursalSeleccionada}
            onChange={(e) => setSucursalSeleccionada(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">Seleccione una zona</option>
            {zonas.map((z) => (
              <option key={z.idzona} value={z.idzona}>
                {z.zona}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={buscarClientesPorZona}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
          >
            Buscar
          </button>
        </div>
      </div>

      {clientes.length > 0 && (
        <div className="overflow-x-auto">
          <h2 className="text-lg font-bold mb-3">Clientes en la zona</h2>
          <table className="min-w-full table-auto border border-gray-200 bg-white shadow-sm text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Nombre</th>
                <th className="border px-4 py-2">Deuda (S/)</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 text-blue-600 underline">
                    <Link href={`/vendedor/clientes/${cliente.id}`}>{cliente.id}</Link>
                  </td>
                  <td className="border px-4 py-2">{cliente.nombre}</td>
                  <td className="border px-4 py-2 text-right">{cliente.saldo.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
