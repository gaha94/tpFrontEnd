'use client';
import { useEffect, useState } from 'react';
import {
  getClientes,
  deleteCliente,
  createCliente,
  updateCliente
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
  const [editMode, setEditMode] = useState(false);
  const [filtro, setFiltro] = useState('');


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
      if (editMode && form.id) {
        await updateCliente(form.id, form);
      } else {
        await createCliente(form);
      }
      setShowModal(false);
      setForm(clienteVacio);
      setEditMode(false);
      fetchClientes();
    } catch (err) {
      console.error('Error al guardar cliente', err);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setForm(cliente);
    setEditMode(true);
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setForm(clienteVacio);
    setEditMode(false);
  };
    const clientesFiltrados = clientes.filter((cliente) => {
  const termino = filtro.toLowerCase();
  return (
    cliente.nombre.toLowerCase().includes(termino) ||
    cliente.documento.toLowerCase().includes(termino)
  );
});

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes</h1>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => {
            setForm(clienteVacio);
            setEditMode(false);
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Nuevo Cliente
        </button>

        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="border border-gray-300 rounded p-2 w-64"
        />
      </div>
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
            {clientesFiltrados.map(cliente => (
              <tr key={cliente.id}>
                <td className="border p-2">{cliente.nombre}</td>
                <td className="border p-2">{cliente.tipo_documento} {cliente.documento}</td>
                <td className="border p-2">{cliente.direccion}</td>
                <td className="border p-2">{cliente.telefono}</td>
                <td className="border p-2">{cliente.correo}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => handleEdit(cliente)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Editar
                  </button>
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
      <h2 className="text-lg font-bold mb-4">
        {editMode ? 'Editar Cliente' : 'Nuevo Cliente'}
      </h2>

      {/* validaciones */}
      <div className="text-red-600 mb-2 text-sm">
        {form.documento.trim() === '' && 'Documento es obligatorio.'}
        {form.tipo_documento === 'DNI' &&
          form.documento.length > 0 &&
          form.documento.length !== 8 &&
          ' DNI debe tener 8 dígitos.'}
        {form.tipo_documento === 'RUC' &&
          form.documento.length > 0 &&
          form.documento.length !== 11 &&
          ' RUC debe tener 11 dígitos.'}
        {form.nombre.trim() === '' && ' Nombre es obligatorio.'}
        {form.correo &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo) &&
          ' Correo inválido.'}
      </div>

      <div className="space-y-3">
        <select
          title="Tipo de Documento"
          name="tipo_documento"
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
          onClick={handleCancel}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
            disabled={!!(
              form.documento.trim() === '' ||
              (form.tipo_documento === 'DNI' && form.documento.length !== 8) ||
              (form.tipo_documento === 'RUC' && form.documento.length !== 11) ||
              form.nombre.trim() === '' ||
              (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
            )}
        >
          {editMode ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
