'use client'
import { useEffect, useState } from 'react'
import { Venta } from '@/types/venta'
import ProtectedRoute from '@/components/ProtectedRoute' 

export default function VentasPage() {
const [ventas, setVentas] = useState<Venta[]>([])

  useEffect(() => {
    const data = localStorage.getItem('ventas')
    if (data) setVentas(JSON.parse(data))
  }, [])

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div>
        <h1 className="text-2xl font-bold mb-4">Historial de Ventas</h1>
        {ventas.length === 0 ? (
          <p>No hay ventas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Fecha</th>
                  <th className="border px-2 py-1">Cliente</th>
                  <th className="border px-2 py-1">Comprobante</th>
                  <th className="border px-2 py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id}>
                    <td className="border px-2 py-1">{new Date(v.fecha).toLocaleString()}</td>
                    <td className="border px-2 py-1">
                      {v.tipoComprobante === 'boleta'
                        ? `DNI: ${v.cliente?.dni}`
                        : `RUC: ${v.cliente?.ruc} - ${v.cliente?.nombre}`}
                    </td>
                    <td className="border px-2 py-1">{v.tipoComprobante}</td>
                    <td className="border px-2 py-1">S/ {v.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
