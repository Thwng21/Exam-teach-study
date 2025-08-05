'use client'

import { ReactNode, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import TeacherSidebar from './TeacherSidebar'
import AdminSidebar from './AdminSidebar'
import StudentSidebar from './StudentSidebar'
import Topbar from './Topbar'

interface AppLayoutProps {
  children: ReactNode
  showSidebar?: boolean
}

export default function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Không hiển thị layout cho auth pages
  if (pathname?.includes('/auth/') || pathname === '/') {
    return <>{children}</>
  }

  if (!showSidebar) {
    return <>{children}</>
  }

  const getSidebar = () => {
    if (!user) return null
    
    switch (user.role) {
      case 'admin':
        return <AdminSidebar />
      case 'teacher':
        return <TeacherSidebar />
      case 'student':
        return <StudentSidebar />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex pt-16"> {/* Add padding-top for fixed topbar */}
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 
          transition-transform duration-300 lg:duration-0
        `}>
          {getSidebar()}
        </div>
        
        {/* Main Content */}
        <main className="flex-1 w-full lg:pl-8"> {/* Add left padding for desktop spacing */}
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"> {/* Improved container */}
            <div className="space-y-6 lg:space-y-8"> {/* Add consistent vertical spacing */}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
