export interface Cliente {
    dni?: string
    ruc?: string
    nombre?: string
  }
  
  export interface Producto {
    id: string
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
    
    tipoComprobante: 'boleta' | 'factura'
    metodoPago: 'efectivo' | 'tarjeta' | 'yape'
    cliente: {
      dni?: string
      ruc?: string
      nombre?: string
    }
    fecha: string
    productos: PedidoItem[]
    total: number
  }
  
  export interface VentaPendiente {
    id: number
    numero_venta: string
    nombre: string
    telefono: string
    total: number
  }