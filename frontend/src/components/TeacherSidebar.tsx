'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard,
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  GraduationCap,
  Calendar,
  MessageSquare,
  CheckCircle,
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
    href: '/teacher/dashboard'
  },
  {
    id: 'courses',
    label: 'Quản lý khóa học',
    icon: BookOpen,
    children: [
      { id: 'my-courses', label: 'Khóa học của tôi', icon: BookOpen, href: '/teacher/courses' },
      { id: 'create-course', label: 'Tạo khóa học mới', icon: BookOpen, href: '/teacher/courses/create' }
    ]
  },
  {
    id: 'exams',
    label: 'Quản lý bài thi',
    icon: FileText,
    children: [
      { id: 'my-exams', label: 'Bài thi của tôi', icon: FileText, href: '/teacher/exams' },
      { id: 'create-exam', label: 'Tạo bài thi mới', icon: FileText, href: '/teacher/exams/create' },
      { id: 'grading', label: 'Chấm điểm', icon: CheckCircle, href: '/teacher/exams/grading', badge: '5' }
    ]
  },
  {
    id: 'students',
    label: 'Quản lý sinh viên',
    icon: Users,
    href: '/teacher/students'
  },
  {
    id: 'schedule',
    label: 'Lịch giảng dạy',
    icon: Calendar,
    href: '/teacher/schedule'
  },
  {
    id: 'reports',
    label: 'Báo cáo & Thống kê',
    icon: BarChart3,
    children: [
      { id: 'course-reports', label: 'Báo cáo khóa học', icon: BookOpen, href: '/teacher/reports/courses' },
      { id: 'exam-reports', label: 'Báo cáo bài thi', icon: FileText, href: '/teacher/reports/exams' },
      { id: 'student-progress', label: 'Tiến độ sinh viên', icon: Users, href: '/teacher/reports/students' }
    ]
  },
  {
    id: 'messages',
    label: 'Tin nhắn',
    icon: MessageSquare,
    href: '/teacher/messages',
    badge: '2'
  }
]

export default function TeacherSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedItems, setExpandedItems] = useState<string[]>(['courses', 'exams'])

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
              ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-700' 
              : 'text-gray-700 hover:bg-gray-100'
          } ${level > 0 ? 'ml-4' : ''}`}
        >
          <div className="flex items-center">
            <Icon className={`w-5 h-5 mr-3 ${active ? 'text-purple-700' : 'text-gray-500'}`} />
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
        {/* Teacher Info */}
        <div className="mb-6 p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-purple-900">Giảng viên</p>
              <p className="text-xs text-purple-600">Quản lý giảng dạy</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-900">8</div>
            <div className="text-xs text-blue-600">Khóa học</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-900">5</div>
            <div className="text-xs text-orange-600">Bài chấm</div>
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
