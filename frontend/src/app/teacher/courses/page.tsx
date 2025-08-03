'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { 
  Plus, 
  Search,
  Users,
  BookOpen,
  Edit,
  Eye,
  MoreVertical,
  Calendar,
  FileText
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { courseService, Course } from '@/services/courseService'

export default function TeacherCoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await courseService.getMyCourses()
        setCourses(coursesData)
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách khóa học')
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Main content with proper margin for sidebar */}
      <div className="md:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
                <p className="text-gray-600 mt-2">Tạo và quản lý các khóa học của bạn</p>
              </div>
              <Link href="/teacher/courses/create">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Tạo khóa học mới
                </Button>
              </Link>
            </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng khóa học</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng sinh viên</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.reduce((sum, course) => sum + (course.students?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Khóa học đang hoạt động</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.filter(course => course.isActive).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Không tìm thấy khóa học' : 'Chưa có khóa học nào'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc' 
                : 'Tạo khóa học đầu tiên của bạn để bắt đầu'}
            </p>
            {!searchTerm && (
              <Link href="/teacher/courses/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo khóa học mới
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {course.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        course.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-blue-600 mb-2">{course.code}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {course.description || 'Chưa có mô tả'}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students?.length || 0} SV</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(course.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/teacher/courses/${course._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </Link>
                  <Link href={`/teacher/courses/${course._id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
