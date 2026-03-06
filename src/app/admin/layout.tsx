import { AdminSidebar } from '@/components/layout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-background p-8">{children}</main>
    </div>
  )
}
