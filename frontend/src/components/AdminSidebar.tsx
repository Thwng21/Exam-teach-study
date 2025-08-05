'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  Settings,
  GraduationCap,
  UserCheck,
  BarChart3,
  Shield,
  ChevronDown,
  ChevronRight
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
    href: '/admin/dashboard'
  },
  {
    id: 'users',
    label: 'Quản lý người dùng',
    icon: Users,
    children: [
      { id: 'all-users', label: 'Tất cả người dùng', icon: Users, href: '/admin/users' },
      { id: 'teachers', label: 'Giảng viên', icon: GraduationCap, href: '/admin/users/teachers' },
      { id: 'students', label: 'Sinh viên', icon: UserCheck, href: '/admin/users/students' }
    ]
  },
  {
    id: 'courses',
    label: 'Quản lý khóa học',
    icon: BookOpen,
    href: '/admin/courses'
  },
  {
    id: 'exams',
    label: 'Quản lý bài thi',
    icon: FileText,
    href: '/admin/exams'
  },
  {
    id: 'reports',
    label: 'Báo cáo & Thống kê',
    icon: BarChart3,
    children: [
      { id: 'course-reports', label: 'Báo cáo khóa học', icon: BookOpen, href: '/admin/reports/courses' },
      { id: 'exam-reports', label: 'Báo cáo bài thi', icon: FileText, href: '/admin/reports/exams' },
      { id: 'user-reports', label: 'Báo cáo người dùng', icon: Users, href: '/admin/reports/users' }
    ]
  },
  {
    id: 'settings',
    label: 'Cài đặt hệ thống',
    icon: Settings,
    children: [
      { id: 'general', label: 'Cài đặt chung', icon: Settings, href: '/admin/settings/general' },
      { id: 'security', label: 'Bảo mật', icon: Shield, href: '/admin/settings/security' }
    ]
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedItems, setExpandedItems] = useState<string[]>(['users'])

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
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
              : 'text-gray-700 hover:bg-gray-100'
          } ${level > 0 ? 'ml-4' : ''}`}
        >
          <div className="flex items-center">
            <Icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-700' : 'text-gray-500'}`} />
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
        {/* Admin Info */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-blue-900">Admin Panel</p>
              <p className="text-xs text-blue-600">Quản trị hệ thống</p>
            </div>
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
