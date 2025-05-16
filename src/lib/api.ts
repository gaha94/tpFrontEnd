// src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // o el que tengas en tu .env
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
