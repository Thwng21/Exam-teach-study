'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Clock, 
  Calendar,
  BookOpen,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Settings,
  Share2,
  Copy,
  Archive,
  Star
} from 'lucide-react'
import { Course } from '@/services/courseService'
import Card from '@/components/Card'

interface CourseCardProps {
  course: Course
  onEdit?: (course: Course) => void
  onDelete?: (course: Course) => void
  onStatusChange?: (course: Course, status: string) => void
  onClick?: (course: Course) => void
  className?: string
}

export default function CourseCard({ 
  course, 
  onEdit, 
  onDelete, 
  onStatusChange,
  onClick,
  className = '' 
}: CourseCardProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { 
        label: 'Hoạt động', 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: '✓'
      },
      draft: { 
        label: 'Bản nháp', 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⚠'
      },
      archived: { 
        label: 'Đã lưu trữ', 
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '📁'
      }
    }
    return configs[status as keyof typeof configs] || configs.draft
  }

  const statusConfig = getStatusConfig(course.status || 'draft')

  const handleActionClick = (action: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    switch (action) {
      case 'edit':
        onEdit?.(course)
        break
      case 'delete':
        onDelete?.(course)
        break
      case 'publish':
        onStatusChange?.(course, 'active')
        break
      case 'draft':
        onStatusChange?.(course, 'draft')
        break
      case 'archive':
        onStatusChange?.(course, 'archived')
        break
    }
    setShowDropdown(false)
  }

  return (
    <Card 
      className={`
        relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer
        ${isHovered ? 'shadow-lg' : 'shadow-md'}
        ${className}
      `}
      onClick={() => onClick?.(course)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-bold text-gray-900 text-lg lg:text-xl truncate">
                {course.name}
              </h3>
              {course.status === 'active' && (
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              )}
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm lg:text-base font-mono bg-gray-100 px-3 py-1.5 rounded-lg border">
                {course.code}
              </span>
              <span className={`
                px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium border text-center min-w-[90px]
                ${statusConfig.className}
              `}>
                <span className="mr-1">{statusConfig.icon}</span>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDropdown(!showDropdown)
              }}
              className="p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
            </button>

            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={(e) => handleActionClick('edit', e)}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4 mr-3" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={(e) => handleActionClick('copy', e)}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4 mr-3" />
                      Sao chép
                    </button>
                    <button
                      onClick={(e) => handleActionClick('share', e)}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Share2 className="w-4 h-4 mr-3" />
                      Chia sẻ
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    {course.status !== 'active' && (
                      <button
                        onClick={(e) => handleActionClick('publish', e)}
                        className="w-full flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                      >
                        <Eye className="w-4 h-4 mr-3" />
                        Xuất bản
                      </button>
                    )}
                    {course.status !== 'draft' && (
                      <button
                        onClick={(e) => handleActionClick('draft', e)}
                        className="w-full flex items-center px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                      >
                        <Edit className="w-4 h-4 mr-3" />
                        Chuyển về nháp
                      </button>
                    )}
                    <button
                      onClick={(e) => handleActionClick('archive', e)}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Archive className="w-4 h-4 mr-3" />
                      Lưu trữ
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={(e) => handleActionClick('delete', e)}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Xóa
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm lg:text-base text-gray-600 mb-6 line-clamp-2 min-h-[3rem] lg:min-h-[3.5rem] leading-relaxed">
          {course.description || 'Chưa có mô tả cho khóa học này.'}
        </p>

        {/* Course Info - Simplified with real data */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm lg:text-base">
            <div className="flex items-center text-gray-600">
              <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-blue-500" />
              <span className="font-medium">{course.credits || 3} tín chỉ</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-green-500" />
              <span>{course.academicYear}</span>
            </div>
          </div>

          <div className="flex items-center text-sm lg:text-base text-gray-600">
            <Users className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-purple-500" />
            <span>Giảng viên: {course.teacher?.name || 'Chưa phân công'}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-xs lg:text-sm text-gray-500">
            <Calendar className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
            <span>{course.semester === 'HK1' ? 'Học kỳ 1' : course.semester === 'HK2' ? 'Học kỳ 2' : 'Học kỳ hè'}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClick?.(course)
              }}
              className="px-3 py-1.5 text-xs lg:text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors font-medium"
            >
              Quản lý lớp
            </button>
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg
        transition-opacity duration-200 pointer-events-none
        ${isHovered ? 'opacity-100' : 'opacity-0'}
      `} />
    </Card>
  )
}
