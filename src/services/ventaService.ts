import api from '@/lib/api'
import { VentaPendiente, Venta, Cliente } from '@/types/venta'

interface CrearVentaPayload {
  vendedorId?: string
  tipoComprobante: string
  cliente: Cliente
  productos: {
    id_producto: number
    cantidad: number
    precio_unitario: number
    subtotal: number
  }[]
  estado: 'pendiente' | 'aprobado' | 'cancelado'
}

export const getVentasPendientes = async (): Promise<VentaPendiente[]> => {
  const res = await api.get<VentaPendiente[]>('/ventas/pendientes')
  return res.data
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const createVentaService = async (
  venta: CrearVentaPayload,
  token: string
): Promise<{ message: string; id?: number }> => {
  const res = await fetch(`${API_URL}/ventas/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(venta),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error ${res.status}: ${text}`)
  }

  return res.json()
}

export const cancelarVentaService = async (id: number): Promise<void> => {
  await api.put(`/ventas/${id}/cancelar`)
}

export const getVentasDelVendedorHoy = async (token: string): Promise<Venta[]> => {
  const { data } = await api.get<Venta[]>('/ventas/vendedor/hoy', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return data
}



