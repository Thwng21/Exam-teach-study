'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { courseService, Course } from '@/services/courseService'
import { classService, Class } from '@/services/classService'
import { 
  Users, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  CalendarDays,
  ArrowLeft,
  User,
  X
} from 'lucide-react'

interface CreateClassData {
  name: string
  code: string
  maxStudents: number
  schedule: {
    dayOfWeek: number
    startTime: string
    endTime: string
    room: string
  }[]
}

export default function CourseClassesPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [allClasses, setAllClasses] = useState<Class[]>([])
  const [classesByCourse, setClassesByCourse] = useState<{[key: string]: {course: any, classes: Class[]}}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [courseId])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load essential data first - course and classes for current course
      await Promise.all([
        loadCourse(),
        loadClasses()
      ])
      
      // Load cross-course classes separately - don't fail if this fails
      try {
        await loadAllClasses()
      } catch (crossCourseError) {
        console.warn('Failed to load cross-course classes, continuing without them:', crossCourseError)
        // Set empty state for cross-course functionality
        setAllClasses([])
        setClassesByCourse({})
      }
    } catch (err: any) {
      console.error('Error loading essential data:', err)
      setError(err.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const loadCourse = async () => {
    try {
      const courseData = await courseService.getCourse(courseId)
      setCourse(courseData)
    } catch (err: any) {
      console.error('Error loading course:', err)
      throw err
    }
  }

  const loadClasses = async () => {
    try {
      const classesData = await classService.getClassesByCourse(courseId)
      setClasses(classesData)
    } catch (err: any) {
      console.error('Error loading classes:', err)
      setClasses([])
    }
  }

  const loadAllClasses = async () => {
    try {
      const result = await classService.getAllClasses()
      console.log('loadAllClasses result:', result)
      
      // Handle the structured response from getAllClasses
      if (result && result.allClasses) {
        setAllClasses(result.allClasses)
        
        // Group classes by course, excluding current course
        const grouped: {[key: string]: {course: any, classes: Class[]}} = {}
        result.allClasses.forEach((classItem: any) => {
          if (classItem.course && classItem.course._id !== courseId) {
            const otherCourseId = classItem.course._id
            if (!grouped[otherCourseId]) {
              grouped[otherCourseId] = {
                course: classItem.course,
                classes: []
              }
            }
            grouped[otherCourseId].classes.push(classItem)
          }
        })
        setClassesByCourse(grouped)
      } else {
        // Fallback to empty state
        setAllClasses([])
        setClassesByCourse({})
      }
    } catch (err: any) {
      console.error('Error loading all classes:', err)
      // Set empty state on error - don't show error to user since this is optional functionality
      setAllClasses([])
      setClassesByCourse({})
    }
  }

  const getDayName = (dayOfWeek: number) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return days[dayOfWeek] || 'N/A'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN')
  }

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

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/teacher/courses')}>
              Quay lại danh sách khóa học
            </Button>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/teacher/courses/${courseId}`)}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại chi tiết khóa học
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý lớp học</h1>
              <p className="text-gray-600 mt-2">
                Khóa học: <span className="font-medium">{course?.name}</span> ({course?.code})
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo lớp học mới
            </Button>
          </div>
        </div>

        {/* Current Course Classes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Lớp học của khóa này
            </h2>
            <span className="text-sm text-gray-500">
              {classes.length} lớp học
            </span>
          </div>

          {classes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <Card key={classItem._id} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
                        <p className="text-sm text-gray-600 font-mono">{classItem.code}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Khóa này
                      </span>
                    </div>

                    {/* Students */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-500" />
                        <span className="text-sm lg:text-base font-medium text-gray-700">Sinh viên</span>
                      </div>
                      <span className="text-sm lg:text-base font-bold text-blue-600">
                        {classItem.studentCount || 0}/{classItem.maxStudents}
                      </span>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Lịch học</span>
                      </div>
                      <div className="space-y-2">
                        {classItem.schedule && classItem.schedule.map((schedule, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                  {getDayName(schedule.dayOfWeek)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>{schedule.startTime} - {schedule.endTime}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {schedule.room}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Tạo ngày: {formatDate(classItem.createdAt)}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          ID: {classItem.code}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Chi tiết
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Sửa
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lớp học nào</h3>
              <p className="text-gray-600 mb-6">
                Tạo lớp học đầu tiên cho khóa học này
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo lớp học mới
              </Button>
            </Card>
          )}
        </div>

        {/* Other Course Classes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Lớp học từ các khóa khác
            </h2>
            <span className="text-sm text-gray-500">
              {Object.keys(classesByCourse).length} khóa học
            </span>
          </div>

          {Object.keys(classesByCourse).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(classesByCourse).map(([courseId, data]) => (
                <div key={courseId}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {data.course.name}
                    </h3>
                    <span className="text-sm text-gray-500">({data.course.code})</span>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded ml-auto">
                      {data.classes.length} lớp
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {data.classes.map((classItem) => (
                      <Card key={classItem._id} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{classItem.name}</h4>
                              <p className="text-sm text-gray-600 font-mono">{classItem.code}</p>
                            </div>
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Khóa khác
                            </span>
                          </div>

                          {/* Students */}
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-purple-500" />
                              <span className="text-sm lg:text-base font-medium text-gray-700">Sinh viên</span>
                            </div>
                            <span className="text-sm lg:text-base font-bold text-purple-600">
                              {classItem.studentCount || 0}/{classItem.maxStudents}
                            </span>
                          </div>

                          {/* Schedule */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Lịch học</span>
                            </div>
                            <div className="space-y-2">
                              {classItem.schedule && classItem.schedule.map((schedule, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <div className="flex items-center gap-2 flex-1">
                                      <Calendar className="w-3 h-3 text-gray-400" />
                                      <span className="text-sm font-medium text-gray-700">
                                        {getDayName(schedule.dayOfWeek)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <Clock className="w-3 h-3" />
                                      <span>{schedule.startTime} - {schedule.endTime}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {schedule.room}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Tạo ngày: {formatDate(classItem.createdAt)}</span>
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                ID: {classItem.code}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Chi tiết
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lớp học từ khóa khác</h3>
              <p className="text-gray-600">
                Hiện tại chưa có lớp học nào từ các khóa học khác
              </p>
            </Card>
          )}
        </div>

        {/* Create Class Modal */}
        {showCreateModal && course && (
          <CreateClassModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            courseId={courseId}
            onSuccess={() => {
              setShowCreateModal(false)
              loadClasses()
            }}
          />
        )}
      </div>
    </AppLayout>
  )
}

// Create Class Modal Component
interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  onSuccess: () => void
}

function CreateClassModal({ isOpen, onClose, courseId, onSuccess }: CreateClassModalProps) {
  const [formData, setFormData] = useState<CreateClassData>({
    name: '',
    code: '',
    maxStudents: 50,
    schedule: [{
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '10:00',
      room: ''
    }]
  })
  const [loading, setLoading] = useState(false)

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, {
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '10:00',
        room: ''
      }]
    }))
  }

  const removeSchedule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }))
  }

  const updateSchedule = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((schedule, i) => 
        i === index ? { ...schedule, [field]: value } : schedule
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.code.trim()) return

    setLoading(true)
    try {
      // Include courseId in the data object as required by the service
      const classData = {
        ...formData,
        course: courseId
      }
      await classService.createClass(classData)
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        name: '',
        code: '',
        maxStudents: 50,
        schedule: [{
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '10:00',
          room: ''
        }]
      })
    } catch (error) {
      console.error('Error creating class:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Tạo lớp học mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên lớp học *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="VD: Lớp 01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã lớp *
                </label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="VD: SE301-01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng sinh viên tối đa
              </label>
              <Input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                min="1"
                max="200"
              />
            </div>

            {/* Schedule */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Lịch học
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSchedule}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm lịch
                </Button>
              </div>

              <div className="space-y-4">
                {formData.schedule.map((schedule, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Lịch {index + 1}</h4>
                      {formData.schedule.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSchedule(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Thứ
                        </label>
                        <select
                          value={schedule.dayOfWeek}
                          onChange={(e) => updateSchedule(index, 'dayOfWeek', parseInt(e.target.value))}
                          className="text-sm w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={1}>Thứ 2</option>
                          <option value={2}>Thứ 3</option>
                          <option value={3}>Thứ 4</option>
                          <option value={4}>Thứ 5</option>
                          <option value={5}>Thứ 6</option>
                          <option value={6}>Thứ 7</option>
                          <option value={0}>Chủ nhật</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Giờ bắt đầu
                        </label>
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                          className="text-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Giờ kết thúc
                        </label>
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                          className="text-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Phòng học
                        </label>
                        <Input
                          type="text"
                          value={schedule.room}
                          onChange={(e) => updateSchedule(index, 'room', e.target.value)}
                          placeholder="VD: H1-201"
                          className="text-sm w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none sm:px-6"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none sm:px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                'Tạo lớp học'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
