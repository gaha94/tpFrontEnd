export interface Cliente {
  dni?: string
  ruc?: string
  nombre?: string
  nombres?: string       // Para boleta
  razonSocial?: string   // Para factura
  direccion?: string
}

export interface Producto {
  id: number
  nombre: string
  precio: number
  stock: number
  categoria: string
  marca: string
}

export interface PedidoItem {
  producto: Producto
  cantidad: number
}

export interface Venta {
  id: string
  vendedor: string
  tipoComprobante: 'boleta' | 'factura'
  metodoPago?: 'efectivo' | 'tarjeta' | 'yape' // opcional en ventas pendientes
  cliente: Cliente
  fecha: string
  productos: PedidoItem[]
  total: number
  estado: 'pendiente' | 'aprobado' | 'cancelado'
}

export interface VentaParaEnviar {
  vendedorId?: string
  tipoComprobante: 'boleta' | 'factura'
  cliente: Cliente
  estado: 'pendiente' | 'aprobado' | 'cancelado'
  productos: {
    id_producto: number
    cantidad: number
    precio_unitario: number
    subtotal: number
  }[]
}

export interface VentaPendiente {
  id: number
  numero_venta: string
  cliente: string
  telefono: string
  monto: number
}
