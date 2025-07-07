'use client'
import { useState } from 'react'

interface Venta {
  id: number
  tipoComprobante: string
  vendedor: string
}

export default function ConsultaClientePage() {
  const [clienteSeleccionado, setClienteSeleccionado] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [ventas, setVentas] = useState<Venta[]>([])

  const clienteDummy = [
    { id: '1', nombre: 'Juan Pérez' },
    { id: '2', nombre: 'María Gómez' },
    { id: '3', nombre: 'Luis Rodríguez' },
  ]

  const buscarVentas = () => {
    if (!clienteSeleccionado || !desde || !hasta) {
      alert('Selecciona un cliente y el rango de fechas')
      return
    }

    const dummyVentas: Venta[] = [
      { id: 101, tipoComprobante: 'Boleta', vendedor: 'Carlos Pérez' },
      { id: 102, tipoComprobante: 'Factura', vendedor: 'Lucía Gómez' },
    ]
    setVentas(dummyVentas)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 text-black">
      <h1 className="text-2xl font-bold mb-6">Consulta por Cliente</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Cliente:</label>
          <select
          title='Selecciona un cliente'
            value={clienteSeleccionado}
            onChange={(e) => setClienteSeleccionado(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">Seleccione un cliente</option>
            {clienteDummy.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Desde:</label>
          <input
            title='Fecha de inicio'
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Hasta:</label>
          <input
            title='Fecha de fin'
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={buscarVentas}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
          >
            Buscar ventas
          </button>
        </div>
      </div>

      {ventas.length > 0 && (
        <div className="overflow-x-auto">
          <h2 className="text-lg font-bold mb-3">Ventas encontradas</h2>
          <table className="min-w-full table-auto border border-gray-200 bg-white shadow-sm text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Comprobante</th>
                <th className="border px-4 py-2">Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{venta.id}</td>
                  <td className="border px-4 py-2">{venta.tipoComprobante}</td>
                  <td className="border px-4 py-2">{venta.vendedor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
