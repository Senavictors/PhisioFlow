import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  return (
    <div className="flex h-full min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar userName={session.name} />
        <main className="flex-1 px-12 py-9 pb-20 max-w-[1180px]">{children}</main>
      </div>
    </div>
  )
}
