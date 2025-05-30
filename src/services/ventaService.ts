import api from '@/lib/api'
import { VentaPendiente } from '@/types/venta'

export const getVentasPendientes = async (): Promise<VentaPendiente[]> => {
  const res = await api.get<VentaPendiente[]>('/ventas/pendientes')
  return res.data
}

// ✅ Nueva función para cancelar una venta pendiente
export const cancelarVentaService = async (id: number): Promise<void> => {
  await api.put(`/ventas/${id}/cancelar`)
}
