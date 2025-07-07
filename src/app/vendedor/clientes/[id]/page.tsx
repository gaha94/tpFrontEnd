'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

interface Movimiento {
  fecha: string
  detalle: string
  total: number
  saldo: number
  ctipregi: 'C' | 'D'
  ccodinte: string
}


export default function DetalleClientePage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])

  useEffect(() => {
    const fetchDeuda = async () => {
      try {
        const { data } = await api.get<Movimiento[]>(`/clientes/detalle/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setMovimientos(data)
      } catch (error) {
        console.error('Error al obtener movimientos del cliente:', error)
      }
    }

    if (id && token) {
      fetchDeuda()
    }
  }, [id, token])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 text-black">
      <h1 className="text-2xl font-bold mb-4">Detalle de Deuda del Cliente {id}</h1>

      {movimientos.length === 0 ? (
        <p>No se encontraron movimientos.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300 bg-white shadow text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-4 py-2">Fecha</th>
                <th className="border px-4 py-2">Detalle</th>
                <th className="border px-4 py-2">Total</th>
                <th className="border px-4 py-2">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">
                    {new Date(m.fecha).toLocaleDateString('es-PE')}
                  </td>
                  <td className="border px-4 py-2">
                    {m.ctipregi === 'C' ? (
                        <a
                        href={`/vendedor/clientes/comprobante/${m.ccodinte}`} // aquí puedes poner la ruta real si existe
                        className="text-blue-600 underline hover:text-blue-800"
                        >
                        {m.detalle}
                        </a>
                    ) : (
                        m.detalle
                    )}
                  </td>
                  <td className="border px-4 py-2 text-right">{m.total.toFixed(2)}</td>
                  <td className="border px-4 py-2 text-right">{m.saldo.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
