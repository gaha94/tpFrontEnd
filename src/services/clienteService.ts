// services/clienteService.ts
import api from '@/lib/api'
import { ClienteBuscado } from '@/types/cliente'

// Obtener todos los clientes
export const getClientes = async (): Promise<ClienteBuscado[]> => {
  const res = await api.get<ClienteBuscado[]>('/clientes')
  return res.data
}

// Obtener cliente por ID
export const getClienteById = async (id: number): Promise<ClienteBuscado> => {
  const res = await api.get<ClienteBuscado>(`/clientes/${id}`)
  return res.data
}

// Crear nuevo cliente
export const createCliente = async (cliente: ClienteBuscado): Promise<ClienteBuscado> => {
  const res = await api.post<ClienteBuscado>('/clientes', cliente)
  return res.data
}

// Actualizar cliente
export const updateCliente = async (id: number, cliente: ClienteBuscado): Promise<void> => {
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
