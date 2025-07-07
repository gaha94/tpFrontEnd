import api from '@/lib/api'
import { Producto } from '@/types/venta'

export const fetchProductos = async (token: string): Promise<Producto[]> => {
  const res = await api.get<Producto[]>('/productos', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}
