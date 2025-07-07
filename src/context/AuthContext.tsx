'use client'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface User {
  id: number
  nombre: string
}

interface LoginResponse {
  token: string
  user: User
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (usuarioPlano: string, password: string, rememberMe: boolean) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage
    const savedToken = storage.getItem('token')
    const savedUser = storage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

const login = async (usuarioPlano: string, password: string, rememberMe: boolean) => {
  try {
    const { data }: { data: LoginResponse } = await api.post('/login', {
      usuarioPlano,
      password
    })

    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('token', data.token)
    storage.setItem('user', JSON.stringify(data.user))

    setToken(data.token)
    setUser(data.user)

    // Redirigir a /vendedor después del login
    router.push('/vendedor/ventas-dia')
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    throw new Error('Error al iniciar sesión')
  }
}


  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
