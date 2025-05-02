export type Rol = 'admin' | 'caja' | 'vendedor'

export interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: Rol
}
