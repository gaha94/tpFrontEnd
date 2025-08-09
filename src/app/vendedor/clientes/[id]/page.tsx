'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

interface Movimiento {
  fecha: string
  detalle: string
  total: number
  saldo: number
  ctipregi: 'C' | 'D'
  ccodinte: string
}

export default function DetalleClientePage() {
  const params = useParams()
  const clienteId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined)
  const { token } = useAuth()

  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loadingPdfId, setLoadingPdfId] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeuda = async () => {
      try {
        const { data } = await api.get<Movimiento[]>(`/clientes/detalle/${clienteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMovimientos(data)
      } catch (error) {
        console.error('Error al obtener movimientos del cliente:', error)
      }
    }

    if (clienteId && token) fetchDeuda()
  }, [clienteId, token])

// Helpers robustos
const abrirPdfEnNuevaPestana = (blob: Blob) => {
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank', 'noopener,noreferrer')
  // Si el navegador bloqueó el popup, win será null
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return Boolean(win)
}

const imprimirPdfConIframe = (blob: Blob) => {
  return new Promise<boolean>((resolve) => {
    const url = URL.createObjectURL(blob)
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.src = url
    document.body.appendChild(iframe)

    // A veces el visor de PDF tarda: damos un pequeño margen
    const cleanup = () => {
      try { document.body.removeChild(iframe) } catch {}
      URL.revokeObjectURL(url)
    }

    const timer = setTimeout(() => {
      // si en 5s no cargó, consideramos fallido
      cleanup()
      resolve(false)
    }, 5000)

    iframe.onload = () => {
      clearTimeout(timer)
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        setTimeout(() => {
          cleanup()
          resolve(true)
        }, 1000)
      } catch {
        cleanup()
        resolve(false)
      }
    }
  })
}

const descargarComoFallback = (blob: Blob, filename = 'comprobante.pdf') => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

const handleImprimir = async (ccodinte: string) => {
  if (!token) return
  try {
    setLoadingPdfId(ccodinte)
    console.log('[PDF] solicitando...', ccodinte)

    const resp = await api.get<ArrayBuffer>(`/comprobantes/${ccodinte}/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/pdf'
      },
      responseType: 'arraybuffer' as const
    })

    // Validación rápida
    if (!resp?.data || (resp.data as ArrayBuffer).byteLength === 0) {
      console.error('[PDF] Respuesta vacía')
      alert('El PDF llegó vacío.')
      return
    }

    const blob = new Blob([resp.data], { type: 'application/pdf' })

    // Estrategia 1: abrir en pestaña nueva (suele evitar bloqueos de impresión)
    const opened = abrirPdfEnNuevaPestana(blob)
    if (opened) {
      console.log('[PDF] Abierto en pestaña nueva')
      return
    }

    // Estrategia 2: intentar imprimir con iframe oculto
    const printed = await imprimirPdfConIframe(blob)
    if (printed) {
      console.log('[PDF] Impreso con iframe')
      return
    }

    // Estrategia 3 (fallback): descargar
    console.warn('[PDF] Fallback a descarga')
    descargarComoFallback(blob, `comprobante-${ccodinte}.pdf`)
  } catch (err: any) {
    console.error('[PDF] Error', err?.message || err)
    // Muestra más detalle si el backend devuelve JSON de error
    if (err?.response?.data && err?.response?.headers?.['content-type']?.includes('application/json')) {
      try {
        const dec = new TextDecoder()
        const json = JSON.parse(dec.decode(err.response.data))
        console.error('[PDF] detalle backend:', json)
        alert(`No se pudo generar el PDF: ${json?.detail || json?.error || 'Error'}`)
        return
      } catch {}
    }
    alert('No se pudo generar el PDF.')
  } finally {
    setLoadingPdfId(null)
  }
}

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 text-black">
      <h1 className="text-2xl font-bold mb-4">
        Detalle de Deuda del Cliente {clienteId}
      </h1>

      {movimientos.length === 0 ? (
        <p>No se encontraron movimientos.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300 bg-white shadow text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-4 py-2">Fecha</th>
                <th className="border px-4 py-2">Detalle</th>
                <th className="border px-4 py-2">Total</th>
                <th className="border px-4 py-2">Saldo</th>
                <th className="border px-4 py-2 text-center">Imprimir</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">
                    {new Date(m.fecha).toLocaleDateString('es-PE')}
                  </td>
                  <td className="border px-4 py-2">
                    {m.ctipregi === 'C' ? (
                      <a
                        href={`/vendedor/clientes/comprobante/${m.ccodinte}`}
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        {m.detalle}
                      </a>
                    ) : (
                      m.detalle
                    )}
                  </td>
                  <td className="border px-4 py-2 text-right">
                    {m.total.toFixed(2)}
                  </td>
                  <td className="border px-4 py-2 text-right">
                    {m.saldo.toFixed(2)}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {m.ctipregi === 'C' ? (
                      <button
                        onClick={() => handleImprimir(m.ccodinte)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs disabled:opacity-60 cursor-pointer"
                        disabled={loadingPdfId === m.ccodinte}
                        title="Imprimir comprobante"
                      >
                        {loadingPdfId === m.ccodinte ? 'Generando…' : '🖨️ Imprimir'}
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
