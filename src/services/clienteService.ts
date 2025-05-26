import api from '@/lib/api';
import { Cliente } from '@/types/cliente';

export const getClientes = async (): Promise<Cliente[]> => {
  const res = await api.get<Cliente[]>('/clientes');
  return res.data;
};

export const deleteCliente = async (id: number): Promise<void> => {
  await api.delete(`/clientes/${id}`);
};

export const getClienteById = async (id: number): Promise<Cliente> => {
  const res = await api.get<Cliente>(`/clientes/${id}`);
  return res.data;
};
export const createCliente = async (cliente: Cliente): Promise<Cliente> => {
  const res = await api.post<Cliente>('/clientes', cliente);
  return res.data;
};
