'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // Limpia errores anteriores

    try {
      await login(username, password)
    } catch (error) {
      setError('Error al iniciar sesión. Verifica tus credenciales.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h1 className='text-xl font-bold mb-4 text-center text-black'>Iniciar Sesión</h1>
        <div className="flex justify-center mb-4">
          <img
            src="/logo.svg"
            alt="Logo de la empresa"
            className="h-50 object-contain"
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
            </div>)}
        {/* Logo encima del formulario */}
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded text-black"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded text-black"
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer">
          Entrar
        </button>
      </form>
    </div>
  )
}
