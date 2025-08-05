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
    if (courseId) {
      loadCourse()
      loadClasses()
      loadAllClasses()
    }
  }, [courseId])

  const loadCourse = async () => {
    try {
      console.log('Loading course with ID:', courseId);
      const courseData = await courseService.getCourse(courseId);
      console.log('Course data loaded:', courseData);
      setCourse(courseData);
    } catch (err) {
      console.error('Error loading course:', err);
      setError('Không thể tải thông tin khóa học');
    }
  }

  const loadClasses = async () => {
    try {
      console.log('=== LOADING CLASSES START ===');
      console.log('Loading classes for course:', courseId);
      setLoading(true);
      setError('');
      const classesData = await classService.getClassesByCourse(courseId);
      console.log('Classes data loaded:', classesData);
      console.log('Number of classes:', classesData.length);
      setClasses(classesData);
      console.log('=== LOADING CLASSES END ===');
    } catch (err: any) {
      console.error('Error loading classes:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách lớp học';
      setError(errorMessage);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }

  const loadAllClasses = async () => {
    try {
      console.log('=== LOADING ALL CLASSES START ===');
      const { allClasses: allClassesData, classesByCourse: classesByCourseData } = await classService.getAllClasses();
      console.log('All classes loaded:', allClassesData.length);
      console.log('Classes by course:', Object.keys(classesByCourseData).length, 'courses');
      setAllClasses(allClassesData);
      setClassesByCourse(classesByCourseData);
      console.log('=== LOADING ALL CLASSES END ===');
    } catch (err: any) {
      console.error('Error loading all classes:', err);
    }
  }

  const handleCreateClass = () => {
    setShowCreateModal(true)
  }

  const handleBackToCourses = () => {
    router.push('/teacher/courses')
  }

  const getDayName = (dayOfWeek: number) => {
    const days = ['', 'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return days[dayOfWeek] || 'N/A'
  }

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

  const getSemesterName = (semester: string) => {
    const semesters: { [key: string]: string } = {
      'HK1': 'Học kỳ 1',
      'HK2': 'Học kỳ 2',
      'HK_HE': 'Học kỳ hè'
    }
    return semesters[semester] || semester
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  }

  if (!course && !error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    )
  }

  if (error && !course) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <h3 className="text-lg font-semibold">Có lỗi xảy ra</h3>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={() => {
              setError('');
              loadCourse();
              loadClasses();
            }}>
              Thử lại
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8 lg:space-y-10">
        {/* Back Button */}
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={handleBackToCourses}
            className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại danh sách khóa học</span>
            <span className="sm:hidden">Quay lại</span>
          </Button>
        </div>

        {/* Course Header */}
        {course && (
          <Card className="p-6 lg:p-8 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div className="flex items-start gap-4 lg:gap-6">
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-7 h-7 lg:w-8 lg:h-8 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 break-words mb-3">
                    {course.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {course.code}
                    </span>
                    <span className="text-sm lg:text-base text-gray-600">
                      {course.credits} tín chỉ
                    </span>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <span className="text-sm lg:text-base text-gray-600">
                      {course.academicYear}
                    </span>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <span className="text-sm lg:text-base text-gray-600">
                      {getSemesterName(course.semester)}
                    </span>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    {getStatusBadge(course.status)}
                  </div>
                  <p className="text-sm lg:text-base text-gray-600 mb-3 line-clamp-2 lg:line-clamp-3">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span>Giảng viên: {course.teacher?.name || 'Chưa phân công'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:items-end">
                <Button
                  onClick={handleCreateClass}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-6 py-3 lg:px-8 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo lớp học
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Classes Section */}
        <div className="space-y-6 lg:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Quản lý lớp học
              </h2>
              <p className="text-sm lg:text-base text-gray-600 mt-1">
                Hiển thị tất cả lớp học - bao gồm lớp của khóa này và các khóa khác
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6 lg:p-8 shadow-lg">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-8 lg:p-12 text-center shadow-lg">
              <div className="text-red-500 mb-6">
                <GraduationCap className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Có lỗi xảy ra</h3>
                <p className="text-base mt-2">{error}</p>
              </div>
              <Button onClick={loadClasses} className="px-6 py-3">Thử lại</Button>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Current Course Classes */}
              {classes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Lớp học của khóa học này ({classes.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    {classes.map((classItem) => (
                      <Card key={classItem._id} className="p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 shadow-lg border-l-4 border-l-blue-500">
                        <div className="space-y-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-lg lg:text-xl text-gray-900 break-words mb-2">
                                {classItem.name}
                              </h3>
                              <p className="text-sm lg:text-base text-gray-600 font-mono">{classItem.code}</p>
                            </div>
                            {getStatusBadge(classItem.status)}
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-blue-500" />
                              <span className="text-sm lg:text-base font-medium text-gray-700">Sinh viên</span>
                            </div>
                            <span className="text-sm lg:text-base font-bold text-blue-600">
                              {classItem.studentCount}/{classItem.maxStudents}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Lịch học</span>
                            </div>
                            <div className="space-y-2">
                              {classItem.schedule.map((schedule, index) => (
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
                </div>
              )}

              {/* No classes for current course */}
              {classes.length === 0 && (
                <Card className="p-8 lg:p-12 text-center shadow-lg">
                  <div className="text-gray-500 mb-6">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-3">Khóa học này chưa có lớp học nào</h3>
                    <p className="text-base text-gray-600 max-w-md mx-auto">
                      Tạo lớp học đầu tiên cho khóa học này để bắt đầu quản lý sinh viên
                    </p>
                  </div>
                  <Button onClick={handleCreateClass} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                    <Plus className="w-5 h-5 mr-2" />
                    Tạo lớp học cho khóa này
                  </Button>
                </Card>
              )}

              {/* Other Courses Classes */}
              {Object.keys(classesByCourse).length > 0 && (
                <div className="space-y-6">
                  <div className="border-t pt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      Lớp học từ các khóa học khác ({allClasses.length})
                    </h3>
                    <div className="space-y-6">
                      {Object.entries(classesByCourse)
                        .filter(([courseKey]) => courseKey !== courseId)
                        .map(([courseKey, courseData]) => (
                          <div key={courseKey} className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                              <BookOpen className="w-5 h-5 text-purple-600" />
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {courseData.course?.name || 'Khóa học không xác định'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {courseData.course?.code || 'N/A'} • {courseData.classes.length} lớp học
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 ml-4">
                              {courseData.classes.map((classItem) => (
                                <Card key={classItem._id} className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-400">
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <h5 className="font-semibold text-gray-900 text-sm">
                                          {classItem.name}
                                        </h5>
                                        <p className="text-xs text-gray-600 font-mono">{classItem.code}</p>
                                      </div>
                                      {getStatusBadge(classItem.status)}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {classItem.studentCount}/{classItem.maxStudents}
                                      </span>
                                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                        {classItem.schedule.length} buổi/tuần
                                      </span>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action button */}
              <div className="flex justify-center pt-6 border-t">
                <Button 
                  onClick={handleCreateClass} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo lớp học mới cho khóa học này  
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Create Class Modal */}
        {showCreateModal && course && (
          <CreateClassModal
            courseId={courseId}
            courseName={course.name}
            courseCode={course.code}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              console.log('=== CREATE SUCCESS CALLBACK ===');
              setShowCreateModal(false)
              console.log('Modal closed, now reloading all data...');
              loadClasses()
              loadAllClasses()
            }}
          />
        )}
      </div>
    </AppLayout>
  )
}

// Create Class Modal Component
function CreateClassModal({
  courseId,
  courseName,
  courseCode,
  onClose,
  onSuccess
}: {
  courseId: string
  courseName: string
  courseCode: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState<CreateClassData>({
    name: '',
    code: '',
    maxStudents: 40,
    schedule: [
      {
        dayOfWeek: 2,
        startTime: '08:00',
        endTime: '10:00',
        room: ''
      }
    ]
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('=== CREATE CLASS FORM SUBMIT ===');
      console.log('Form data:', formData);
      console.log('Course ID:', courseId);

      const classData = {
        ...formData,
        course: courseId
      }

      console.log('Sending class data:', classData);

      const result = await classService.createClass(classData)
      console.log('Class created successfully:', result)
      
      onSuccess()
    } catch (err: any) {
      console.error('Error creating class:', err)
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo lớp học')
    } finally {
      setLoading(false)
    }
  }

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        {
          dayOfWeek: 2,
          startTime: '08:00',
          endTime: '10:00',
          room: ''
        }
      ]
    }))
  }

  const removeSchedule = (index: number) => {
    if (formData.schedule.length > 1) {
      setFormData(prev => ({
        ...prev,
        schedule: prev.schedule.filter((_, i) => i !== index)
      }))
    }
  }

  const updateSchedule = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const getDayOptions = () => [
    { value: 2, label: 'Thứ 2' },
    { value: 3, label: 'Thứ 3' },
    { value: 4, label: 'Thứ 4' },
    { value: 5, label: 'Thứ 5' },
    { value: 6, label: 'Thứ 6' },
    { value: 7, label: 'Thứ 7' },
    { value: 1, label: 'Chủ nhật' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Tạo lớp học mới</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Khóa học: {courseName} ({courseCode})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên lớp học *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                placeholder="Ví dụ: CS 101 A"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã lớp học
              </label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData(prev => ({...prev, code: e.target.value}))}
                placeholder="Ví dụ: CS101A2024"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số sinh viên tối đa *
            </label>
            <Input
              type="number"
              value={formData.maxStudents}
              onChange={(e) => setFormData(prev => ({
                ...prev, 
                maxStudents: parseInt(e.target.value) || 0
              }))}
              min="1"
              max="200"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Lịch học *
              </label>
              <Button type="button" variant="outline" size="sm" onClick={addSchedule}>
                <Plus className="w-4 h-4 mr-1" />
                Thêm buổi học
              </Button>
            </div>

            {formData.schedule.map((schedule, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700">Buổi học {index + 1}</h4>
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thứ
                    </label>
                    <select
                      value={schedule.dayOfWeek}
                      onChange={(e) => updateSchedule(index, 'dayOfWeek', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {getDayOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bắt đầu
                    </label>
                    <Input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kết thúc
                    </label>
                    <Input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phòng học
                    </label>
                    <Input
                      value={schedule.room}
                      onChange={(e) => updateSchedule(index, 'room', e.target.value)}
                      placeholder="Ví dụ: A101"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Đang tạo...' : 'Tạo lớp học'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
