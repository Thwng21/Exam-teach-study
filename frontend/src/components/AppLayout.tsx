'use client'

import Sidebar from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export default function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  if (!showSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 relative overflow-y-auto">
          <div className="lg:pl-0 pl-16"> {/* Add padding for mobile menu button */}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
