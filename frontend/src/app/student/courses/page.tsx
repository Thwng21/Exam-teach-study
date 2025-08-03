'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { 
  Search,
  BookOpen,
  Users,
  Calendar,
  Eye,
  UserPlus,
  CheckCircle,
  Clock
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { courseService, Course } from '@/services/courseService'
import { useAuth } from '@/contexts/AuthContext'

export default function StudentCoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'available' | 'enrolled'>('enrolled')
  const { user } = useAuth()

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true)
        // Load both enrolled courses and all available courses
        const [enrolledCourses, availableCourses] = await Promise.all([
          courseService.getMyCourses(),
          courseService.getAllAvailableCourses()
        ])
        
        setMyCourses(enrolledCourses)
        setAllCourses(availableCourses)
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách khóa học')
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId)
      await courseService.enrollCourse(courseId)
      
      // Refresh courses after enrollment
      const [enrolledCourses, availableCourses] = await Promise.all([
        courseService.getMyCourses(),
        courseService.getAllAvailableCourses()
      ])
      
      setMyCourses(enrolledCourses)
      setAllCourses(availableCourses)
    } catch (err: any) {
      setError(err.message || 'Không thể đăng ký khóa học')
    } finally {
      setEnrolling(null)
    }
  }

  const getAvailableCourses = () => {
    const enrolledCourseIds = myCourses.map(course => course._id)
    return allCourses.filter(course => 
      !enrolledCourseIds.includes(course._id)
    )
  }

  const filteredEnrolledCourses = myCourses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAvailableCourses = getAvailableCourses().filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="md:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="md:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Khóa học của tôi</h1>
                <p className="text-gray-600 mt-2">Quản lý và tham gia các khóa học</p>
              </div>
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
                    <p className="text-sm font-medium text-gray-600">Khóa học đã đăng ký</p>
                    <p className="text-2xl font-bold text-gray-900">{myCourses.length}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Khóa học có sẵn</p>
                    <p className="text-2xl font-bold text-gray-900">{getAvailableCourses().length}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng khóa học</p>
                    <p className="text-2xl font-bold text-gray-900">{allCourses.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'enrolled'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Khóa học đã đăng ký ({myCourses.length})
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'available'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Khóa học có sẵn ({getAvailableCourses().length})
              </button>
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
          {activeTab === 'enrolled' ? (
            // Enrolled Courses
            filteredEnrolledCourses.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Không tìm thấy khóa học' : 'Chưa đăng ký khóa học nào'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Thử thay đổi từ khóa tìm kiếm' 
                    : 'Khám phá và đăng ký các khóa học có sẵn'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setActiveTab('available')}>
                    Xem khóa học có sẵn
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEnrolledCourses.map((course) => (
                  <Card key={course._id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {course.name}
                          </h3>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Đã đăng ký
                          </span>
                        </div>
                        <p className="text-sm font-medium text-blue-600 mb-2">{course.code}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {course.description || 'Chưa có mô tả'}
                        </p>
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
                      <Link href={`/student/courses/${course._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Vào học
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            // Available Courses
            filteredAvailableCourses.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Không tìm thấy khóa học' : 'Không có khóa học mới'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Thử thay đổi từ khóa tìm kiếm' 
                    : 'Bạn đã đăng ký tất cả khóa học có sẵn'}
                </p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAvailableCourses.map((course) => (
                  <Card key={course._id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {course.name}
                          </h3>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            Có sẵn
                          </span>
                        </div>
                        <p className="text-sm font-medium text-blue-600 mb-2">{course.code}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {course.description || 'Chưa có mô tả'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Giảng viên: {course.teacher.firstName} {course.teacher.lastName}
                        </p>
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
                      <Button 
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrolling === course._id}
                        className="flex-1"
                        size="sm"
                      >
                        {enrolling === course._id ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Đang đăng ký...
                          </div>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Đăng ký
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
