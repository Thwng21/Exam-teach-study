'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Trophy,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Settings,
  Lock
} from 'lucide-react'

interface SidebarItem {
  id: string
  label: string
  icon: any
  href?: string
  badge?: string
  children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/student/dashboard'
  },
  {
    id: 'courses',
    label: 'Khóa học của tôi',
    icon: BookOpen,
    href: '/student/courses'
  },
  {
    id: 'exams',
    label: 'Bài thi',
    icon: FileText,
    children: [
      { id: 'available-exams', label: 'Bài thi khả dụng', icon: Clock, href: '/student/exams', badge: '3' },
      { id: 'completed-exams', label: 'Đã hoàn thành', icon: CheckCircle, href: '/student/exams/completed' },
      { id: 'upcoming-exams', label: 'Sắp tới', icon: AlertCircle, href: '/student/exams/upcoming' }
    ]
  },
  {
    id: 'results',
    label: 'Kết quả thi',
    icon: Trophy,
    href: '/student/results'
  },
  {
    id: 'schedule',
    label: 'Lịch học',
    icon: Calendar,
    href: '/student/schedule'
  },
  {
    id: 'profile',
    label: 'Thông tin cá nhân',
    icon: User,
    href: '/student/profile'
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: Settings,
    children: [
      { id: 'change-password', label: 'Đổi mật khẩu', icon: Lock, href: '/auth/change-password' }
    ]
  }
]

export default function StudentSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedItems, setExpandedItems] = useState<string[]>(['exams'])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  const isParentActive = (children: SidebarItem[]) => {
    return children.some(child => child.href && isActive(child.href))
  }

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const active = item.href ? isActive(item.href) : (hasChildren && isParentActive(item.children!))

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id)
            } else if (item.href) {
              router.push(item.href)
            }
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors ${
            active 
              ? 'bg-green-50 text-green-700 border-r-2 border-green-700' 
              : 'text-gray-700 hover:bg-gray-100'
          } ${level > 0 ? 'ml-4' : ''}`}
        >
          <div className="flex items-center">
            <Icon className={`w-5 h-5 mr-3 ${active ? 'text-green-700' : 'text-gray-500'}`} />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-40">
      <div className="p-4">
        {/* Student Info */}
        <div className="mb-6 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-green-900">Sinh viên</p>
              <p className="text-xs text-green-600">Học tập trực tuyến</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-900">5</div>
            <div className="text-xs text-blue-600">Khóa học</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-900">3</div>
            <div className="text-xs text-orange-600">Bài thi chờ</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {sidebarItems.map(item => renderSidebarItem(item))}
        </nav>
      </div>
    </aside>
  )
}
