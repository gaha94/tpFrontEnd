'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'admin' | 'caja' | 'vendedor'

interface AuthContextType {
  user: { username: string; role: Role } | null
  login: (username: string, password: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ username: string; role: Role } | null>(null)
  const router = useRouter()

  const login = (username: string) => {
    // Simular login (reemplazar luego con API)
    let role: Role = 'vendedor'
    if (username === 'admin') role = 'admin'
    else if (username === 'caja') role = 'caja'

    setUser({ username, role })
    router.push(`/${role}`) // redirige al dashboard correspondiente
  }

  const logout = () => {
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
