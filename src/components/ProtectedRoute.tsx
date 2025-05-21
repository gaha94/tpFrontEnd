'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface Props {
  children: React.ReactNode
  allowedRoles: ('admin' | 'caja' | 'vendedor')[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else if (!allowedRoles.includes(user.rol)) {
      router.push(`/${user.rol}`) // redirige a su panel correcto
    }
  }, [user, router, allowedRoles])

  // Si no hay user aún (ej. en primer render), no mostrar nada
  if (!user) return null

  return <>{children}</>
}
