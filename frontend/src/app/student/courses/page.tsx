'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import CourseWithClasses from '@/components/CourseWithClasses'
import { useAuth } from '@/contexts/AuthContext'
import { academicService } from '@/services/academicService'
import Card from '@/components/Card'

export default function StudentCoursesPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'enrolled'>('available')
  const { user } = useAuth()

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-500 text-lg">Vui lòng đăng nhập để tiếp tục</div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Khóa học & Lớp học</h1>
              <p className="text-gray-600 mt-1">
                Chọn năm học và học kỳ để xem các khóa học có sẵn và đăng ký lớp học
              </p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'available'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Khóa học có sẵn
              </button>
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'enrolled'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lớp đã đăng ký
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'available' ? (
          <CourseWithClasses
            showEnrollButton={true}
            userRole="student"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          />
        ) : (
          <EnrolledClasses />
        )}
      </div>
    </AppLayout>
  )
}

// Component hiển thị lớp học đã đăng ký
function EnrolledClasses() {
  return (
    <EnrolledClassesContent />
  )
}

function EnrolledClassesContent() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Lớp học đã đăng ký
      </h2>
      
      {/* Placeholder - sẽ implement sau */}
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">📚</div>
        <h3 className="text-lg font-medium mb-2">Tính năng đang phát triển</h3>
        <p className="text-gray-400">
          Trang xem lớp học đã đăng ký sẽ được cập nhật sớm.<br/>
          Hiện tại bạn có thể đăng ký lớp học từ tab "Khóa học có sẵn".
        </p>
      </div>
    </Card>
  )
}
