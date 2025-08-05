'use client'

import { useState, useEffect } from 'react'
import { classService, CreateClassData } from '@/services/classService'
import { courseService, Course } from '@/services/courseService'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { Plus, Users, Calendar, MapPin, Clock } from 'lucide-react'

interface ClassManagementProps {
  courseId?: string
  onClassCreated?: () => void
}

export default function ClassManagement({ courseId, onClassCreated }: ClassManagementProps) {
  const [classes, setClasses] = useState<any[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [courseId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load courses for teacher
      const teacherCourses = await courseService.getCourses()
      const validCourses = teacherCourses.filter(course => course && course._id)
      setCourses(validCourses)

      // Load classes
      if (courseId) {
        const courseClasses = await classService.getClasses({ course: courseId })
        const validClasses = courseClasses.filter(cls => cls && cls._id)
        setClasses(validClasses)
      } else {
        const allClasses = await classService.getClasses()
        const validClasses = allClasses.filter(cls => cls && cls._id)
        setClasses(validClasses)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClassCreated = () => {
    setShowCreateForm(false)
    loadData()
    onClassCreated?.()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quản lý lớp học</h2>
          <p className="text-gray-600">Tạo và quản lý các lớp học trong khóa học</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo lớp học
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <CreateClassForm
          courses={courses}
          defaultCourseId={courseId}
          onCancel={() => setShowCreateForm(false)}
          onSuccess={handleClassCreated}
        />
      )}

      {/* Classes List */}
      {classes.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">🏫</div>
            <h3 className="text-lg font-medium mb-2">Chưa có lớp học nào</h3>
            <p>Hãy tạo lớp học đầu tiên cho khóa học của bạn</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.filter(cls => cls && cls._id).map((cls) => (
            <ClassItem key={cls._id} classInfo={cls} onUpdate={loadData} />
          ))}
        </div>
      )}
    </div>
  )
}

// Create Class Form Component
interface CreateClassFormProps {
  courses: Course[]
  defaultCourseId?: string
  onCancel: () => void
  onSuccess: () => void
}

function CreateClassForm({ courses, defaultCourseId, onCancel, onSuccess }: CreateClassFormProps) {
  const [formData, setFormData] = useState<CreateClassData>({
    name: '',
    code: '',
    course: defaultCourseId || '',
    schedule: [{
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '10:00',
      room: ''
    }],
    maxStudents: 35
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError('')
      await classService.createClass(formData)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo lớp học')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('schedule.')) {
      const scheduleField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        schedule: [{ ...prev.schedule[0], [scheduleField]: value }]
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const selectedCourse = courses.find(c => c._id === formData.course)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo lớp học mới</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khóa học <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.course}
              onChange={(e) => handleInputChange('course', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn khóa học</option>
              {courses.filter(course => course && course._id).map(course => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên lớp học <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={selectedCourse ? `${selectedCourse.name} - Lớp 1` : 'Tên lớp học'}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thứ</label>
            <select
              value={formData.schedule[0].dayOfWeek}
              onChange={(e) => handleInputChange('schedule.dayOfWeek', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {classService.getDayOptions().map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giờ bắt đầu</label>
            <Input
              type="time"
              value={formData.schedule[0].startTime}
              onChange={(e) => handleInputChange('schedule.startTime', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giờ kết thúc</label>
            <Input
              type="time"
              value={formData.schedule[0].endTime}
              onChange={(e) => handleInputChange('schedule.endTime', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phòng học</label>
            <Input
              type="text"
              value={formData.schedule[0].room}
              onChange={(e) => handleInputChange('schedule.room', e.target.value)}
              placeholder="P101"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sĩ số tối đa
          </label>
          <Input
            type="number"
            min="1"
            max="100"
            value={formData.maxStudents}
            onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo lớp học'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

// Class Item Component
function ClassItem({ classInfo, onUpdate }: { classInfo: any; onUpdate: () => void }) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{classInfo.name}</h4>
          <p className="text-sm text-gray-600 font-mono">{classInfo.code}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          classInfo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {classInfo.status === 'active' ? 'Hoạt động' : 'Nháp'}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{classService.formatSchedule(classInfo.schedule)}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span>{classInfo.studentCount}/{classInfo.maxStudents} sinh viên</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1">
          Chi tiết
        </Button>
      </div>
    </Card>
  )
}
