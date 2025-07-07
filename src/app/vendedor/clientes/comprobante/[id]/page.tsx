'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

interface Producto {
  cantidad: number
  unidad: string
  producto: string
  punit: number
  total: number
}

export default function ComprobanteDetallePage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const { data } = await api.get<Producto[]>(`/clientes/comprobante/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setProductos(data)
      } catch (error) {
        console.error('Error al cargar detalle del comprobante:', error)
      }
    }

    if (id && token) fetchDetalle()
  }, [id, token])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 text-black">
      <h1 className="text-2xl font-bold mb-4">Detalle del Comprobante {id}</h1>

      {productos.length === 0 ? (
        <p>No se encontraron productos para este comprobante.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300 bg-white shadow text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-4 py-2">Cantidad</th>
                <th className="border px-4 py-2">Unidad</th>
                <th className="border px-4 py-2">Producto</th>
                <th className="border px-4 py-2">P. Unitario</th>
                <th className="border px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 text-right">{p.cantidad}</td>
                  <td className="border px-4 py-2">{p.unidad}</td>
                  <td className="border px-4 py-2">{p.producto}</td>
                  <td className="border px-4 py-2 text-right">{p.punit ? p.punit.toFixed(2) : '0.00'}</td>
                  <td className="border px-4 py-2 text-right">{p.total ? p.total.toFixed(2) : '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
