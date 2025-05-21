import api from '@/lib/api'
import { VentaPendiente } from '@/types/venta'

export const getVentasPendientes = async (): Promise<VentaPendiente[]> => {
  const res = await api.get<VentaPendiente[]>('/ventas/pendientes')
  return res.data
}
