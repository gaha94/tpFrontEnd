'use client';
import { useEffect, useState } from 'react';
import {
  getClientes,
  deleteCliente,
  createCliente
} from '../../../services/clienteService';
import { Cliente } from '../../../types/cliente';

const clienteVacio: Cliente = {
  id: 0,
  tipo_documento: 'DNI',
  documento: '',
  nombre: '',
  direccion: '',
  telefono: '',
  correo: ''
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Cliente>(clienteVacio);

  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (err) {
      console.error('Error al cargar clientes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar cliente?')) return;
    try {
      await deleteCliente(id);
      fetchClientes();
    } catch (err) {
      console.error('Error al eliminar', err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await createCliente(form);
      setShowModal(false);
      setForm(clienteVacio);
      fetchClientes();
    } catch (err) {
      console.error('Error al crear cliente', err);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes</h1>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
      >
        + Nuevo Cliente
      </button>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Documento</th>
              <th className="border p-2">Dirección</th>
              <th className="border p-2">Teléfono</th>
              <th className="border p-2">Correo</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr key={cliente.id}>
                <td className="border p-2">{cliente.nombre}</td>
                <td className="border p-2">{cliente.tipo_documento} {cliente.documento}</td>
                <td className="border p-2">{cliente.direccion}</td>
                <td className="border p-2">{cliente.telefono}</td>
                <td className="border p-2">{cliente.correo}</td>
                <td className="border p-2">
                  {/* botón de editar se implementará luego */}
                  <button
                    onClick={() => handleDelete(cliente.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Nuevo Cliente</h2>

            <div className="space-y-3">
              <select
                name="tipo_documento"
                title='Tipo de Documento'
                value={form.tipo_documento}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
              </select>

              <input
                type="text"
                name="documento"
                placeholder="Documento"
                value={form.documento}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
              />

              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
              />

              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={form.direccion}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
              />

              <input
                type="text"
                name="telefono"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
              />

              <input
                type="email"
                name="correo"
                placeholder="Correo"
                value={form.correo}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
