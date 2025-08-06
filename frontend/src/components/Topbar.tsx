'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  Search, 
  Menu, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Lock
} from 'lucide-react'
import Button from './Button'

interface TopbarProps {
  onMenuClick?: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên'
      case 'teacher': return 'Giảng viên'
      case 'student': return 'Sinh viên'
      default: return role
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 fixed top-0 left-0 right-0 z-50">
      {/* Left Section - Logo & Mobile Menu */}
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Logo */}
        <div className="flex items-center ml-2 lg:ml-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">ET</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-gray-900">Exam Teach</h1>
            <p className="text-xs text-gray-500">Hệ thống thi trực tuyến</p>
          </div>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học, bài thi..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section - Actions & User */}
      <div className="flex items-center space-x-2">
        {/* Search button for mobile */}
        <button className="md:hidden p-2 rounded-md hover:bg-gray-100">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md hover:bg-gray-100 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Thông báo</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-medium">Bài thi mới được tạo</p>
                  <p className="text-xs text-gray-500 mt-1">Lập trình Web - Bài kiểm tra giữa kỳ</p>
                  <p className="text-xs text-gray-400 mt-1">2 phút trước</p>
                </div>
                <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-medium">Sinh viên nộp bài</p>
                  <p className="text-xs text-gray-500 mt-1">Nguyễn Văn A đã nộp bài thi</p>
                  <p className="text-xs text-gray-400 mt-1">5 phút trước</p>
                </div>
              </div>
              <div className="p-3 border-t border-gray-100">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Xem tất cả thông báo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              <p className="text-xs text-gray-500">{getRoleDisplay(user?.role || '')}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="font-medium text-gray-900">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => {
                    setShowUserMenu(false)
                    // Navigate to profile based on role
                    if (user?.role === 'student') {
                      router.push('/student/profile')
                    } else if (user?.role === 'teacher') {
                      router.push('/teacher/profile')
                    } else {
                      router.push('/admin/profile')
                    }
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <User className="w-4 h-4 mr-2" />
                  Thông tin cá nhân
                </button>
                <button 
                  onClick={() => {
                    setShowUserMenu(false)
                    router.push('/auth/change-password')
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </button>
                <button className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50">
                  <Settings className="w-4 h-4 mr-2" />
                  Cài đặt
                </button>
                <hr className="my-1" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
