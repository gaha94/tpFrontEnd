'use client'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

type Role = 'admin' | 'caja' | 'vendedor'

interface User {
  id: number
  nombre: string
  rol: Role
  correo: string
}

interface LoginResponse {
  token: string
  user: User
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (correo: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  const login = async (correo: string, password: string) => {
    try {
      const { data }: { data: LoginResponse } = await api.post('/login', { correo, password })

      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      router.push(`/${data.user.rol}`)
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      throw new Error('Error al iniciar sesión')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
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
