export interface Cliente {
  id: number;
  tipo_documento: 'DNI' | 'RUC';
  documento: string;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
}
