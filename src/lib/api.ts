// src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  // baseURL: 'http://localhost:4001/api', // ✅ IP pública del servidor
  baseURL: 'http://163.123.180.94:4001/api', // ✅ IP pública del servidor
})

// ✅ Interceptor para agregar el token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
