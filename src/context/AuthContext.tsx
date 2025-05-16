// src/context/AuthContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

type Role = 'admin' | 'caja' | 'vendedor'

interface User {
  id: number
  nombre: string
  correo: string
  rol: Role
}

interface AuthContextType {
  user: User | null
  login: (correo: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const login = async (correo: string, password: string) => {
    try {
      const res = await api.post('/login', { correo, password })
      const { token, user } = res.data

      localStorage.setItem('token', token)
      setUser(user)
      router.push(`/${user.rol}`) // Redirige según el rol
    } catch (err) {
      alert('Correo o contraseña incorrectos')
      console.error('Error en login:', err)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
