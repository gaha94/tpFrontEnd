// services/clienteService.ts
import api from '@/lib/api'
import { Cliente } from '@/types/cliente'

export interface ClienteBuscado {
  ccodclie: string
  crucclie: string
  cnomclie: string
  cdirclie: string
  nestrella: number
  cestrella: string
  latitud: number | null
  longitud: number | null
}

// Obtener todos los clientes
export const getClientes = async (): Promise<Cliente[]> => {
  const res = await api.get<Cliente[]>('/clientes')
  return res.data
}

// Obtener cliente por ID
export const getClienteById = async (id: number): Promise<Cliente> => {
  const res = await api.get<Cliente>(`/clientes/${id}`)
  return res.data
}

// Crear nuevo cliente
export const createCliente = async (cliente: Cliente): Promise<Cliente> => {
  const res = await api.post<Cliente>('/clientes', cliente)
  return res.data
}

// Actualizar cliente
export const updateCliente = async (id: number, cliente: Cliente): Promise<void> => {
  await api.put(`/clientes/${id}`, cliente)
}

// Eliminar cliente
export const deleteCliente = async (id: number): Promise<void> => {
  await api.delete(`/clientes/${id}`)
}

// Buscar clientes por nombre (autocomplete)
export const buscarClientesPorNombre = async (
  nombre: string,
  tipoComprobante: string,
  token: string
): Promise<ClienteBuscado[]> => {
  const res = await api.get<ClienteBuscado[]>(`/clientes/buscar`, {
    params: { q: nombre, tipo: tipoComprobante },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
