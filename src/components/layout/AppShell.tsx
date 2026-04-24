'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

interface AppShellProps {
  children: React.ReactNode
  userName: string
}

export function AppShell({ children, userName }: AppShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar mobileOpen={mobileNavigationOpen} onClose={() => setMobileNavigationOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={userName} onOpenNavigation={() => setMobileNavigationOpen(true)} />

        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1480px] px-4 py-6 pb-16 sm:px-6 sm:py-8 sm:pb-20 lg:px-8 xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
