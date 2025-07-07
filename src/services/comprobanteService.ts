import axios from 'axios'

export interface Comprobante {
  listado: string
  ctipdocu: string
  cserdocu: string
  ccoddocu: string
}

// Cambia esta URL si usas un dominio diferente
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const getComprobantes = async (token: string): Promise<Comprobante[]> => {
  try {
    const response = await axios.get(`${API_URL}/comprobantes`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = response.data

    if (!Array.isArray(data)) throw new Error('Formato de respuesta no válido')

    return data.map((item) => ({
      listado: item.listado,
      ctipdocu: item.ctipdocu,
      cserdocu: item.cserdocu,
      ccoddocu: item.ccoddocu,
    }))
  } catch (error) {
    console.error('Error al obtener comprobantes:', error)
    throw error
  }
}
