'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  BookOpen, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NavigationProps {
  userRole?: 'teacher' | 'student'
  userName?: string
  userEmail?: string
}

const teacherNavItems = [
  { href: '/teacher/dashboard', label: 'Tổng quan', icon: BarChart3 },
  { href: '/teacher/courses', label: 'Khóa học', icon: BookOpen },
  { href: '/teacher/exams', label: 'Bài kiểm tra', icon: FileText },
  { href: '/teacher/students', label: 'Sinh viên', icon: Users },
]

const studentNavItems = [
  { href: '/student/dashboard', label: 'Tổng quan', icon: BarChart3 },
  { href: '/student/courses', label: 'Khóa học', icon: BookOpen },
  { href: '/student/exams', label: 'Bài kiểm tra', icon: FileText },
  { href: '/student/results', label: 'Kết quả', icon: BarChart3 },
]

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Tổng quan', icon: BarChart3 },
  { href: '/admin/users', label: 'Quản lý tài khoản', icon: Users },
  { href: '/admin/courses', label: 'Quản lý khóa học', icon: BookOpen },
  { href: '/admin/exams', label: 'Quản lý bài thi', icon: FileText },
  { href: '/admin/settings', label: 'Cài đặt hệ thống', icon: Settings },
]

export default function Navigation({ userRole: propUserRole, userName: propUserName, userEmail: propUserEmail }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  
  // Use props if provided, otherwise use auth context
  const userRole = propUserRole || user?.role || 'student'
  const userName = propUserName || (user ? `${user.firstName} ${user.lastName}` : 'User')
  const userEmail = propUserEmail || user?.email || ''
  
  const navItems = userRole === 'teacher' ? teacherNavItems : 
                   userRole === 'admin' ? adminNavItems : 
                   studentNavItems

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 flex-col z-30">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            {userRole === 'teacher' ? 'Giảng viên' : 
             userRole === 'admin' ? 'Quản trị viên' : 
             'Sinh viên'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{userName}</p>
          <p className="text-xs text-gray-400">{userEmail}</p>
        </div>
        
        <div className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      isActive 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {userRole === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
            </h1>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Menu */}
        <div className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{userName}</h2>
            <p className="text-sm text-gray-500">{userEmail}</p>
          </div>
          
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                        isActive 
                          ? "bg-blue-100 text-blue-700" 
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors w-full"
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
