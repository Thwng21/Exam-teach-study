'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  BookOpen, 
  Users, 
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Settings
} from 'lucide-react'
import { courseService, Course } from '@/services/courseService'
import ModernSemesterSelector from '@/components/ModernSemesterSelector'
import CreateCourseModal from '@/components/CreateCourseModal'
import CourseCard from '@/components/CourseCard'
import Card from '@/components/Card'
import Button from '@/components/Button'
import AppLayout from '@/components/AppLayout'

export default function ModernTeacherCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Set current academic year (2025-2026) as default
  const [selectedYear, setSelectedYear] = useState('2025-2026')
  const [selectedSemester, setSelectedSemester] = useState('HK1')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadCourses()
  }, [selectedYear, selectedSemester])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = { 
        academicYear: selectedYear, 
        semester: selectedSemester 
      }
      
      const data = await courseService.getCourses(params)
      const filteredData = data?.filter(course => course && course._id) || []
      setCourses(filteredData)
    } catch (err) {
      console.error('Error loading courses:', err)
      setError('Không thể tải danh sách khóa học')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    loadCourses()
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Hoạt động', className: 'bg-green-100 text-green-800' },
      draft: { label: 'Bản nháp', className: 'bg-yellow-100 text-yellow-800' },
      archived: { label: 'Đã lưu trữ', className: 'bg-gray-100 text-gray-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
            <p className="mt-2 text-sm lg:text-base text-gray-600">
              Quản lý các khóa học, tạo mới và theo dõi tiến độ giảng dạy
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 lg:px-8 lg:py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo khóa học mới
            </Button>
          </div>
        </div>
      </div>

      {/* Semester Selector */}
      <div className="mb-8 lg:mb-10">
        <ModernSemesterSelector
          selectedYear={selectedYear}
          selectedSemester={selectedSemester}
          onYearChange={setSelectedYear}
          onSemesterChange={setSelectedSemester}
        />
      </div>

            {/* Filters & Search */}
            <Card className="p-6 lg:p-8 mb-8 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm khóa học..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="draft">Bản nháp</option>
                    <option value="archived">Đã lưu trữ</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Courses Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6 lg:p-8 shadow-lg">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                      <div className="h-8 bg-gray-200 rounded w-full mb-6"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="p-8 lg:p-12 text-center shadow-lg">
                <div className="text-red-500 mb-4">
                  <BookOpen className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg lg:text-xl font-semibold">Có lỗi xảy ra</h3>
                  <p className="text-sm lg:text-base">{error}</p>
                </div>
                <Button onClick={loadCourses}>Thử lại</Button>
              </Card>
            ) : filteredCourses.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <BookOpen className="w-12 h-12 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">
                    {courses.length === 0 ? 'Chưa có khóa học nào' : 'Không tìm thấy khóa học'}
                  </h3>
                  <p className="text-sm">
                    {courses.length === 0 
                      ? 'Tạo khóa học đầu tiên của bạn' 
                      : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                    }
                  </p>
                </div>
                {courses.length === 0 && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo khóa học mới
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    onClick={(course) => {
                      router.push(`/teacher/courses/${course._id}/classes`)
                    }}
                    onEdit={(course) => {
                      // Handle edit
                      console.log('Edit course:', course)
                    }}
                    onDelete={(course) => {
                      // Handle delete
                      console.log('Delete course:', course)
                    }}
                    onStatusChange={(course, status) => {
                      // Handle status change
                      console.log('Change status:', course, status)
                    }}
                  />
                ))}
              </div>
            )}

            {/* Statistics Summary */}
            {!loading && !error && courses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tổng khóa học</p>
                      <p className="text-xl font-semibold text-gray-900">{courses.length}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Eye className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hoạt động</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {courses.filter(c => c.status === 'active').length}
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <Edit className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bản nháp</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {courses.filter(c => c.status === 'draft').length}
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tổng lớp học</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {courses.reduce((total, course) => total + (course.classes?.length || 0), 0)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <CreateCourseModal
          academicYear={selectedYear}
          semester={selectedSemester}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </AppLayout>
  )
}
