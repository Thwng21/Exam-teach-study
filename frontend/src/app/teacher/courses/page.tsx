'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { 
  Plus, 
  X,
  Trash2,
  Search,
  Users,
  BookOpen,
  Edit,
  Eye,
  Calendar,
  FileText,
  MoreVertical
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { courseService, Course, CreateCourseData } from '@/services/courseService'

interface CourseFormData {
  name: string
  code: string
  description: string
  isActive: boolean
}

export default function TeacherCoursesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    code: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const coursesData = await courseService.getMyCourses()
      setCourses(coursesData)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách khóa học')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true
    })
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const courseData: CreateCourseData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        isActive: formData.isActive
      }
      
      const newCourse = await courseService.createCourse(courseData)
      setCourses(prev => [newCourse, ...prev])
      setShowCreateModal(false)
      resetForm()
      setError('')
    } catch (err: any) {
      setError(err.message || 'Không thể tạo khóa học')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return
    
    setSubmitting(true)
    
    try {
      const courseData: CreateCourseData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        isActive: formData.isActive
      }
      
      const updatedCourse = await courseService.updateCourse(selectedCourse._id, courseData)
      setCourses(prev => prev.map(course => 
        course._id === selectedCourse._id ? updatedCourse : course
      ))
      setShowEditModal(false)
      setSelectedCourse(null)
      resetForm()
      setError('')
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật khóa học')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return
    
    setSubmitting(true)
    
    try {
      await courseService.deleteCourse(selectedCourse._id)
      setCourses(prev => prev.filter(course => course._id !== selectedCourse._id))
      setShowDeleteModal(false)
      setSelectedCourse(null)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Không thể xóa khóa học')
    } finally {
      setSubmitting(false)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (course: Course) => {
    setSelectedCourse(course)
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description,
      isActive: course.isActive
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (course: Course) => {
    setSelectedCourse(course)
    setShowDeleteModal(true)
  }

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
              <p className="text-gray-600 mt-2">Tạo và quản lý các khóa học của bạn</p>
            </div>
            <Button onClick={openCreateModal} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tạo khóa học mới
            </Button>
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
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo khóa học mới
              </Button>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => router.push(`/teacher/courses/${course._id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditModal(course)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openDeleteModal(course)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {/* Create Course Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Tạo khóa học mới</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khóa học *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập tên khóa học"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã khóa học *
                  </label>
                  <Input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Ví dụ: CS101"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả về khóa học"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Kích hoạt khóa học
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Đang tạo...' : 'Tạo khóa học'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {showEditModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa khóa học</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleEditCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khóa học *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập tên khóa học"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã khóa học *
                  </label>
                  <Input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Ví dụ: CS101"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả về khóa học"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="editIsActive" className="text-sm text-gray-700">
                    Kích hoạt khóa học
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowEditModal(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Course Modal */}
        {showDeleteModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Xóa khóa học</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-900">{selectedCourse.name}</h3>
                  <p className="text-sm text-red-700">Mã: {selectedCourse.code}</p>
                  <p className="text-sm text-red-700">
                    Số sinh viên: {selectedCourse.students?.length || 0}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleDeleteCourse}
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {submitting ? 'Đang xóa...' : 'Xóa khóa học'}
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>
    </AppLayout>
  )
}
