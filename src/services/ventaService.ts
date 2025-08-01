import api from '@/lib/api'
import { VentaPendiente, Venta, Cliente } from '@/types/venta'
import axios from 'axios';

export type TipoPrecio = "1" | "2" | "3"

export interface CrearVentaPayload {
  clienteId: number
  serieId: string
  detalle: {
    productoId: number
    ncanprod: number
    tipoPrecio: TipoPrecio
  }[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

// 🔄 Crear una nueva venta
export const createVentaService = async (venta: {
  clienteId: string,
  serie: { ctipdocu: string, cserdocu: string },
  detalle: { productoId: string, tipoPrecio: string, ncanprod: number }[]
}, token: string) => {
  const res = await axios.post(
    `${API_URL}/ventas/registro`,
    venta,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return res.data;
};

// 🕒 Obtener ventas pendientes (para módulo caja)
export const getVentasPendientes = async (): Promise<VentaPendiente[]> => {
  try {
    const res = await api.get<VentaPendiente[]>('/ventas/pendientes')
    return res.data
  } catch (error) {
    console.error('[❌] Error al obtener ventas pendientes:', error)
    throw error
  }
}

// 📆 Obtener ventas del día del vendedor
export const getVentasDelVendedorHoy = async (
  token: string
): Promise<Venta[]> => {
  try {
    const { data } = await api.get<Venta[]>('/ventas/vendedor/hoy', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return data
  } catch (error) {
    console.error('[❌] Error al obtener ventas del día:', error)
    throw error
  }
}

// ⛔ Cancelar una venta
export const cancelarVentaService = async (id: number): Promise<void> => {
  try {
    await api.put(`/ventas/${id}/cancelar`)
    console.log(`[🗑️] Venta ${id} cancelada con éxito`)
  } catch (error) {
    console.error(`[❌] Error al cancelar venta ${id}:`, error)
    throw error
  }
}
