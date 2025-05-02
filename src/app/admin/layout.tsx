// src/app/admin/layout.tsx
'use client'
import AdminLayout from '@/components/AdminLayout'

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}
