import api from '@/lib/api'
import { Producto } from '@/types/venta'

export const fetchProductos = async (): Promise<Producto[]> => {
  const res = await api.get<Producto[]>('/productos')
  return res.data
}
