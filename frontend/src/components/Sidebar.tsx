'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Home, 
  BookOpen, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  GraduationCap,
  ClipboardList,
  BarChart3,
  User
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

const navigation: NavItem[] = [
  // Admin navigation
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home, roles: ['admin'] },
  { name: 'Quản lý người dùng', href: '/admin/users', icon: Users, roles: ['admin'] },
  { name: 'Cài đặt hệ thống', href: '/admin/settings', icon: Settings, roles: ['admin'] },
  
  // Teacher navigation
  { name: 'Dashboard', href: '/teacher/dashboard', icon: Home, roles: ['teacher'] },
  { name: 'Khóa học của tôi', href: '/teacher/courses', icon: BookOpen, roles: ['teacher'] },
  { name: 'Bài thi của tôi', href: '/teacher/exams', icon: FileText, roles: ['teacher'] },
  { name: 'Sinh viên', href: '/teacher/students', icon: GraduationCap, roles: ['teacher'] },
  
  // Student navigation
  { name: 'Dashboard', href: '/student/dashboard', icon: Home, roles: ['student'] },
  { name: 'Khóa học', href: '/student/courses', icon: BookOpen, roles: ['student'] },
  { name: 'Bài thi', href: '/student/exams', icon: FileText, roles: ['student'] },
  { name: 'Kết quả', href: '/student/results', icon: ClipboardList, roles: ['student'] },
]

export default function Sidebar({ className = '' }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const userNavigation = navigation.filter(item => item.roles.includes(user.role))

  const NavItems = () => (
    <>
      {userNavigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
            onClick={() => setIsMobileOpen(false)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        )
      })}
    </>
  )

  const UserSection = () => (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-start px-3 py-2">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          <p className="text-xs text-blue-600 font-medium capitalize">{user.role}</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="flex items-center w-full px-3 py-2 mt-2 text-sm font-medium text-red-700 hover:bg-red-50 hover:text-red-900 rounded-md transition-colors"
      >
        <LogOut className="mr-3 h-5 w-5" />
        Đăng xuất
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${className}`}>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md lg:hidden"
        >
          {isMobileOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>

        {/* Mobile sidebar overlay */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileOpen(false)} />
            <div className="fixed inset-y-0 left-0 flex w-full max-w-xs">
              <div className="flex min-h-0 flex-1 flex-col bg-white">
                <div className="flex flex-1 flex-col overflow-y-auto pt-16 pb-4">
                  <div className="flex flex-shrink-0 items-center px-4 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Exam System</h2>
                  </div>
                  <nav className="flex-1 space-y-1 px-2">
                    <NavItems />
                  </nav>
                  <div className="px-2">
                    <UserSection />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-shrink-0 ${className}`}>
        <div className="flex w-64">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Exam System</h2>
              </div>
              <nav className="flex-1 space-y-1 px-3">
                <NavItems />
              </nav>
              <div className="px-3">
                <UserSection />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
