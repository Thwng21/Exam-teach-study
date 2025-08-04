'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  BookOpen,
  FileText,
  Upload,
  Download,
  Eye,
  Settings,
  Clock,
  Video,
  Image,
  File,
  X,
  Save,
  UserCheck,
  Users2,
  CheckCircle2,
  TrendingUp,
  Award,
  User
} from 'lucide-react'
import { courseService, Course } from '@/services/courseService'
import { lessonService, Lesson } from '@/services/lessonService'
import { materialService, Material } from '@/services/materialService'
import { scheduleService, Schedule } from '@/services/scheduleService'
import { enrollmentService, type StudentEnrollment, type EnrollmentStats } from '@/services/enrollmentService'
import { attendanceService, type AttendanceSession } from '@/services/attendanceService'
import { studentService, type Student as StudentData, type StudentProgress, type StudentGrade, type StudentAttendance } from '@/services/studentService'

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  studentId: string
  enrolledAt: string
}

interface LessonFormData {
  title: string
  description: string
  content: string
  type: 'video' | 'document' | 'quiz' | 'assignment'
  duration: number
}

interface ScheduleFormData {
  dayOfWeek: number
  startTime: string
  endTime: string
  room: string
}

export default function CourseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([])
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([])
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [enrollmentLoading, setEnrollmentLoading] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  
  // Real student data states
  const [courseStudents, setCourseStudents] = useState<StudentData[]>([])
  const [studentProgress, setStudentProgress] = useState<{[key: string]: StudentProgress}>({})
  const [studentGrades, setStudentGrades] = useState<{[key: string]: StudentGrade}>({})
  const [studentAttendance, setStudentAttendance] = useState<{[key: string]: StudentAttendance}>({})
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'students' | 'schedule' | 'materials' | 'attendance'>('overview')
  
  // Modal states
  const [showEditCourse, setShowEditCourse] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [showEditLesson, setShowEditLesson] = useState(false)
  const [showAddSchedule, setShowAddSchedule] = useState(false)
  const [showUploadMaterial, setShowUploadMaterial] = useState(false)
  const [showCreateAttendance, setShowCreateAttendance] = useState(false)
  
  // Form data
  const [courseFormData, setCourseFormData] = useState({
    name: '',
    description: ''
  })
  
  const [lessonFormData, setLessonFormData] = useState<LessonFormData>({
    title: '',
    description: '',
    content: '',
    type: 'document',
    duration: 60
  })
  
  const [scheduleFormData, setScheduleFormData] = useState<ScheduleFormData>({
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '10:00',
    room: ''
  })
  
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    console.log('Course detail page mounted, id:', id)
    if (id) {
      loadCourseDetail()
    }
  }, [id])

  const loadCourseDetail = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Load course basic info
      const courseData = await courseService.getCourse(id as string)
      setCourse(courseData)
      console.log('Course data loaded:', courseData)
      console.log('Course students:', courseData.students)
      setCourseFormData({
        name: courseData.name,
        description: courseData.description || ''
      })
      
      // Load lessons, materials, schedules, attendance, and enrollments in parallel
      const [lessonsData, materialsData, schedulesData, attendanceData, enrollmentsData, enrollmentStatsData] = await Promise.all([
        lessonService.getLessons(id as string).catch(() => []),
        materialService.getMaterials(id as string).catch(() => []),
        scheduleService.getSchedules(id as string).catch(() => []),
        attendanceService.getAttendanceSessions(id as string).catch(() => []),
        enrollmentService.getCourseEnrollments(id as string).catch(() => []),
        enrollmentService.getCourseEnrollmentStats(id as string).catch(() => null)
      ])
      
      setLessons(lessonsData)
      setMaterials(materialsData)
      setSchedules(schedulesData)
      setAttendanceSessions(attendanceData)
      setEnrollments(enrollmentsData)
      setEnrollmentStats(enrollmentStatsData)
      
      // Always load student data for demo purposes
      // If course has students, load them, otherwise load mock data
      console.log('About to load students for course...')
      await loadCourseStudentsDataSimple(id as string)
      
    } catch (err: any) {
      console.error('Error loading course:', err)
      setError('Không thể tải thông tin khóa học')
    } finally {
      setLoading(false)
    }
  }

  // Simple function to load students for testing
  const loadCourseStudentsDataSimple = async (courseId: string) => {
    try {
      console.log('=== Loading students (simple) ===')
      console.log('Course ID:', courseId)
      setStudentsLoading(true)
      
      const mockStudents = await studentService.getCourseStudents(courseId)
      console.log('Mock students loaded:', mockStudents)
      console.log('Number of students:', mockStudents.length)
      
      setCourseStudents(mockStudents)
      console.log('courseStudents state updated with:', mockStudents.length, 'students')
      
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setStudentsLoading(false)
      console.log('=== Students loading finished ===')
    }
  }

  // Load student data for the course
  const loadCourseStudentsData = async (studentIds: string[], courseId: string) => {
    try {
      console.log('Loading student data for course:', courseId)
      console.log('Student IDs:', studentIds)
      setStudentsLoading(true)
      
      // Always load mock data for demo purposes
      // In production, this would call the real API first
      const students = await studentService.getStudents(studentIds)
      console.log('Students from API:', students)
      setCourseStudents(students)
      
      // If no students from API, use mock data
      if (students.length === 0) {
        const mockStudents = await studentService.getCourseStudents(courseId)
        console.log('Mock students loaded:', mockStudents)
        setCourseStudents(mockStudents)
      }
      
      // Load progress, grades, and attendance for each student
      const currentStudents = students.length > 0 ? students : await studentService.getCourseStudents(courseId)
      
      if (currentStudents.length > 0) {
        const progressPromises = currentStudents.map(student => 
          studentService.getStudentProgress(courseId, student._id)
        )
        const gradesPromises = currentStudents.map(student => 
          studentService.getStudentGrades(courseId, student._id)
        )
        const attendancePromises = currentStudents.map(student => 
          studentService.getStudentAttendance(courseId, student._id)
        )
        
        const [progressData, gradesData, attendanceData] = await Promise.all([
          Promise.all(progressPromises),
          Promise.all(gradesPromises),
          Promise.all(attendancePromises)
        ])
        
        // Convert arrays to objects keyed by student ID
        const progressMap: {[key: string]: StudentProgress} = {}
        const gradesMap: {[key: string]: StudentGrade} = {}
        const attendanceMap: {[key: string]: StudentAttendance} = {}
        
        progressData.forEach(progress => {
          progressMap[progress.studentId] = progress
        })
        
        gradesData.forEach(grade => {
          gradesMap[grade.studentId] = grade
        })
        
        attendanceData.forEach(attendance => {
          attendanceMap[attendance.studentId] = attendance
        })
        
        setStudentProgress(progressMap)
        setStudentGrades(gradesMap)
        setStudentAttendance(attendanceMap)
      }
      
    } catch (error) {
      console.error('Error loading student data:', error)
      
      // Fallback to mock data
      try {
        const mockStudents = await studentService.getCourseStudents(courseId)
        setCourseStudents(mockStudents)
        
        if (mockStudents.length > 0) {
          const progressPromises = mockStudents.map(student => 
            studentService.getStudentProgress(courseId, student._id)
          )
          const gradesPromises = mockStudents.map(student => 
            studentService.getStudentGrades(courseId, student._id)
          )
          const attendancePromises = mockStudents.map(student => 
            studentService.getStudentAttendance(courseId, student._id)
          )
          
          const [progressData, gradesData, attendanceData] = await Promise.all([
            Promise.all(progressPromises),
            Promise.all(gradesPromises),
            Promise.all(attendancePromises)
          ])
          
          const progressMap: {[key: string]: StudentProgress} = {}
          const gradesMap: {[key: string]: StudentGrade} = {}
          const attendanceMap: {[key: string]: StudentAttendance} = {}
          
          progressData.forEach(progress => {
            progressMap[progress.studentId] = progress
          })
          
          gradesData.forEach(grade => {
            gradesMap[grade.studentId] = grade
          })
          
          attendanceData.forEach(attendance => {
            attendanceMap[attendance.studentId] = attendance
          })
          
          setStudentProgress(progressMap)
          setStudentGrades(gradesMap)
          setStudentAttendance(attendanceMap)
        }
      } catch (mockError) {
        console.error('Error loading mock student data:', mockError)
      }
    } finally {
      setStudentsLoading(false)
    }
  }

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await courseService.updateCourse(id as string, courseFormData)
      await loadCourseDetail()
      setShowEditCourse(false)
    } catch (err: any) {
      console.error('Error updating course:', err)
      setError('Không thể cập nhật khóa học')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await lessonService.createLesson(id as string, lessonFormData)
      await loadCourseDetail()
      setShowAddLesson(false)
      setLessonFormData({
        title: '',
        description: '',
        content: '',
        type: 'document',
        duration: 60
      })
    } catch (err: any) {
      console.error('Error adding lesson:', err)
      setError('Không thể thêm bài học')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    try {
      setUploading(true)
      await materialService.uploadMultipleMaterials(id as string, files)
      await loadCourseDetail()
      setShowUploadMaterial(false)
    } catch (err: any) {
      console.error('Error uploading files:', err)
      setError('Không thể tải lên tài liệu')
    } finally {
      setUploading(false)
    }
  }

  const getDayName = (day: number) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return days[day]
  }

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await scheduleService.createSchedule(id as string, scheduleFormData)
      await loadCourseDetail()
      setShowAddSchedule(false)
      setScheduleFormData({
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '10:00',
        room: ''
      })
    } catch (err: any) {
      console.error('Error adding schedule:', err)
      setError('Không thể thêm lịch học')
    } finally {
      setSubmitting(false)
    }
  }

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-red-500" />
      case 'document': return <FileText className="w-5 h-5 text-blue-500" />
      case 'quiz': return <BookOpen className="w-5 h-5 text-green-500" />
      case 'assignment': return <Edit className="w-5 h-5 text-purple-500" />
      default: return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-green-500" />
      case 'video': return <Video className="w-5 h-5 text-red-500" />
      case 'file': return <File className="w-5 h-5 text-blue-500" />
      default: return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !course) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải khóa học</h3>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/teacher/courses')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách khóa học
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
              <p className="text-xl text-gray-600 mt-1">Mã: {course.code}</p>
              <p className="text-gray-500 mt-2">{course.description}</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowEditCourse(true)}
                variant="outline"
                className="flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button
                onClick={() => setShowUploadMaterial(true)}
                className="flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Tải lên tài liệu
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Tổng quan', icon: Eye },
              { id: 'lessons', label: 'Bài học', icon: BookOpen },
              { id: 'students', label: 'Sinh viên', icon: Users },
              { id: 'schedule', label: 'Lịch học', icon: Calendar },
              { id: 'materials', label: 'Tài liệu', icon: FileText },
              { id: 'attendance', label: 'Điểm danh', icon: UserCheck }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Course Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{course.students?.length || 0}</p>
                <p className="text-gray-600">Sinh viên</p>
              </Card>
              <Card className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{lessons.length}</p>
                <p className="text-gray-600">Bài học</p>
              </Card>
              <Card className="p-6 text-center">
                <FileText className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{materials.length}</p>
                <p className="text-gray-600">Tài liệu</p>
              </Card>
              <Card className="p-6 text-center">
                <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{schedules.length}</p>
                <p className="text-gray-600">Buổi học/tuần</p>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Có 3 sinh viên mới đăng ký khóa học</span>
                  <span className="text-gray-400">2 giờ trước</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Bài học "Giới thiệu" đã được cập nhật</span>
                  <span className="text-gray-400">1 ngày trước</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Tài liệu mới đã được tải lên</span>
                  <span className="text-gray-400">3 ngày trước</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Danh sách bài học</h3>
              <Button
                onClick={() => setShowAddLesson(true)}
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm bài học
              </Button>
            </div>

            <div className="space-y-4">
              {lessons && lessons.length > 0 ? (
                lessons.map((lesson, index) => (
                  <Card key={lesson._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {getLessonTypeIcon(lesson.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            Bài {index + 1}: {lesson.title}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1">{lesson.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Thời lượng: {lesson.duration || 60} phút</span>
                            <span>Loại: {
                              lesson.type === 'video' ? 'Video' :
                              lesson.type === 'document' ? 'Tài liệu' :
                              lesson.type === 'quiz' ? 'Bài kiểm tra' :
                              'Bài tập'
                            }</span>
                            <span className={`px-2 py-1 rounded ${
                              lesson.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {lesson.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setLessonFormData({
                              title: lesson.title,
                              description: lesson.description || '',
                              content: lesson.content || '',
                              type: lesson.type,
                              duration: lesson.duration || 60
                            })
                            setShowEditLesson(true)
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có bài học nào</p>
                  <Button
                    onClick={() => setShowAddLesson(true)}
                    className="mt-4"
                  >
                    Thêm bài học đầu tiên
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            {/* DEBUG BUTTON */}
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-700 mb-2">
                Debug: courseStudents.length = {courseStudents?.length || 0}
              </p>
              <p className="text-sm text-yellow-700 mb-2">
                Debug: course?.students?.length = {course?.students?.length || 0}
              </p>
              <Button 
                onClick={() => loadCourseStudentsDataSimple(id as string)}
                variant="outline"
                size="sm"
                className="mr-2"
              >
                Force Load Students
              </Button>
              <Button 
                onClick={() => {
                  console.log('=== DEBUG INFO ===')
                  console.log('Course:', course)
                  console.log('Course students:', course?.students)
                  console.log('CourseStudents state:', courseStudents)
                  console.log('=== END DEBUG ===')
                }}
                variant="outline"
                size="sm"
              >
                Log Debug Info
              </Button>
            </div>

            {/* Show static student data for demo */}
            <Card className="mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-medium text-purple-700">
                  🎓 Danh sách sinh viên đăng ký khóa học
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Demo - Dữ liệu mẫu
                </p>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {[
                    {
                      id: '1',
                      name: 'Nguyễn Văn An',
                      studentId: 'SV001',
                      email: 'nguyenvanan@email.com',
                      major: 'Công nghệ thông tin',
                      year: 3,
                      gpa: 3.2,
                      phone: '0901234567',
                      isActive: true
                    },
                    {
                      id: '2', 
                      name: 'Trần Thị Bảo',
                      studentId: 'SV002',
                      email: 'tranthibao@email.com',
                      major: 'Công nghệ thông tin',
                      year: 3,
                      gpa: 3.8,
                      phone: '0912345678',
                      isActive: true
                    },
                    {
                      id: '3',
                      name: 'Lê Minh Cường',
                      studentId: 'SV003', 
                      email: 'leminhcuong@email.com',
                      major: 'Công nghệ thông tin',
                      year: 2,
                      gpa: 3.5,
                      phone: '0923456789',
                      isActive: true
                    },
                    {
                      id: '4',
                      name: 'Phạm Thu Dung',
                      studentId: 'SV004',
                      email: 'phamthudung@email.com',
                      major: 'Hệ thống thông tin',
                      year: 3,
                      gpa: 3.7,
                      phone: '0934567890',
                      isActive: false
                    }
                  ].map((student) => (
                    <div key={student.id} className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex-shrink-0 h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h5 className="text-sm font-medium text-gray-900">
                          {student.name}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {student.studentId} • {student.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.major} - Năm {student.year} • GPA: {student.gpa.toFixed(2)} • 📞 {student.phone}
                        </p>
                        <p className="text-xs text-gray-400">
                          {student.isActive ? '✅ Đang học' : '❌ Nghỉ học'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Statistics cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Tổng sinh viên</p>
                    <p className="text-2xl font-bold text-gray-900">4</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Đang học</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">GPA trung bình</p>
                    <p className="text-2xl font-bold text-gray-900">3.55</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Tỷ lệ điểm danh</p>
                    <p className="text-2xl font-bold text-gray-900">85%</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Danh sách sinh viên ({courseStudents?.length || 0})
                </h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>Đang học: {courseStudents?.filter(s => s.isActive).length || 0}</span>
                  <span>Đã nghỉ: {courseStudents?.filter(s => !s.isActive).length || 0}</span>
                  {courseStudents && courseStudents.length > 0 && (
                    <span>GPA trung bình: {(courseStudents.reduce((sum, s) => sum + (s.gpa || 0), 0) / courseStudents.length).toFixed(2)}</span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setShowEnrollModal(true)}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sinh viên
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Xuất danh sách
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            {courseStudents && courseStudents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Tổng sinh viên</p>
                      <p className="text-2xl font-bold text-gray-900">{courseStudents?.length || 0}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Tiến độ TB</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {courseStudents && courseStudents.length > 0 ? 
                          Math.round(Object.values(studentProgress).reduce((sum, p) => sum + p.percentage, 0) / Object.values(studentProgress).length) || 0
                          : 0
                        }%
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center">
                    <Award className="w-8 h-8 text-yellow-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Điểm TB</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {courseStudents && courseStudents.length > 0 ? 
                          (Object.values(studentGrades).reduce((sum, g) => sum + g.total, 0) / Object.values(studentGrades).length).toFixed(1) || '0.0'
                          : '0.0'
                        }
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-purple-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Điểm danh</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {courseStudents && courseStudents.length > 0 ? 
                          Math.round(Object.values(studentAttendance).reduce((sum, a) => sum + a.percentage, 0) / Object.values(studentAttendance).length) || 0
                          : 0
                        }%
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {studentsLoading ? (
              <Card className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu sinh viên...</p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={courseStudents && courseStudents.length > 0 && selectedStudents.length === courseStudents.length}
                            onChange={(e) => {
                              if (e.target.checked && courseStudents) {
                                setSelectedStudents(courseStudents.map(s => s._id))
                              } else {
                                setSelectedStudents([])
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sinh viên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lớp/Ngành
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiến độ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Điểm số
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Điểm danh
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          GPA
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courseStudents && courseStudents.length > 0 ? (
                        courseStudents.map((student) => {
                          const progress = studentProgress[student._id]
                          const grades = studentGrades[student._id]
                          const attendance = studentAttendance[student._id]
                          const gradeInfo = studentService.getGradeFromGPA(student.gpa || 0)
                          
                          return (
                            <tr key={student._id} className={selectedStudents.includes(student._id) ? 'bg-blue-50' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.includes(student._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStudents([...selectedStudents, student._id])
                                    } else {
                                      setSelectedStudents(selectedStudents.filter(id => id !== student._id))
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {student.avatar ? (
                                      <img 
                                        className="h-10 w-10 rounded-full" 
                                        src={student.avatar} 
                                        alt=""
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {student.firstName} {student.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {student.studentId} • {student.email}
                                    </div>
                                    {student.phone && (
                                      <div className="text-xs text-gray-400">
                                        {student.phone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {student.major || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {student.year ? studentService.getYearLabel(student.year) : 'N/A'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {student.dateOfBirth ? `${studentService.calculateAge(student.dateOfBirth)} tuổi` : ''}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {progress ? (
                                  <div>
                                    <div className="flex items-center">
                                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                        <div 
                                          className="bg-blue-600 h-2 rounded-full" 
                                          style={{ width: `${progress.percentage}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm text-gray-600">
                                        {progress.percentage}%
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {progress.completedLessons}/{progress.totalLessons} bài học
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">Chưa có dữ liệu</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {grades ? (
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {grades.total.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      BT: {grades.assignments} | KT: {grades.quizzes}
                                      {grades.midterm && ` | GK: ${grades.midterm}`}
                                      {grades.final && ` | CK: ${grades.final}`}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">Chưa có điểm</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {attendance ? (
                                  <div>
                                    <div className="text-sm text-gray-900">
                                      {attendance.percentage}%
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Có mặt: {attendance.present}/{attendance.total}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Vắng: {attendance.absent}, Trễ: {attendance.late}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">Chưa có dữ liệu</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.gpa ? studentService.formatGPA(student.gpa) : 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {student.gpa ? `${gradeInfo.letter} (${gradeInfo.description})` : ''}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    title="Xem chi tiết"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    title="Chỉnh sửa thông tin"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    title="Xóa khỏi khóa học"
                                    onClick={() => {
                                      if (confirm('Bạn có chắc muốn xóa sinh viên này khỏi khóa học?')) {
                                        // Handle remove student
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Chưa có sinh viên nào đăng ký khóa học này</p>
                            <Button
                              onClick={() => setShowEnrollModal(true)}
                              className="mt-4"
                            >
                              Thêm sinh viên đầu tiên
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Bulk Actions */}
            {selectedStudents.length > 0 && (
              <Card className="mt-4 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Đã chọn {selectedStudents.length} sinh viên
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Xuất danh sách đã chọn
                    </Button>
                    <Button variant="outline" size="sm">
                      Gửi thông báo
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      Xóa đã chọn
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Lịch học</h3>
              <Button
                onClick={() => setShowAddSchedule(true)}
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm lịch học
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules && schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <Card key={schedule._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {getDayName(schedule.dayOfWeek)}
                        </h4>
                        <p className="text-gray-600 text-sm mt-1">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                        {schedule.room && (
                          <p className="text-gray-500 text-sm mt-1">
                            Phòng: {schedule.room}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center text-gray-500 col-span-full">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có lịch học nào</p>
                  <Button
                    onClick={() => setShowAddSchedule(true)}
                    className="mt-4"
                  >
                    Thêm lịch học
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Tài liệu khóa học</h3>
              <Button
                onClick={() => setShowUploadMaterial(true)}
                className="flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Tải lên tài liệu
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials && materials.length > 0 ? (
                materials.map((material) => (
                  <Card key={material._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getMaterialTypeIcon(material.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {material.name}
                          </h4>
                          <p className="text-gray-500 text-sm mt-1">
                            {material.size && `${Math.round(material.size / 1024)} KB`}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(material.uploadedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center text-gray-500 col-span-full">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có tài liệu nào</p>
                  <Button
                    onClick={() => setShowUploadMaterial(true)}
                    className="mt-4"
                  >
                    Tải lên tài liệu đầu tiên
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Điểm danh</h3>
              <Button
                onClick={() => setShowCreateAttendance(true)}
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo buổi điểm danh
              </Button>
            </div>

            <div className="space-y-4">
              {attendanceSessions && attendanceSessions.length > 0 ? (
                attendanceSessions.map((session) => (
                  <Card key={session._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <UserCheck className="w-6 h-6 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{session.title}</h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(session.date).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{session.startTime} - {session.endTime}</span>
                            </div>
                            {session.room && (
                              <span>Phòng: {session.room}</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {session.isActive ? 'Đang diễn ra' : 'Đã kết thúc'}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              {session.attendanceRecords.length} sinh viên đã điểm danh
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => router.push(`/teacher/courses/${id}/attendance/${session._id}`)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </Button>
                        {session.isActive && (
                          <Button
                            onClick={() => router.push(`/teacher/courses/${id}/attendance/${session._id}/mark`)}
                            size="sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Điểm danh
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center text-gray-500">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có buổi điểm danh nào</p>
                  <Button
                    onClick={() => setShowCreateAttendance(true)}
                    className="mt-4"
                  >
                    Tạo buổi điểm danh đầu tiên
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {showEditCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa khóa học</h2>
                <button
                  onClick={() => setShowEditCourse(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khóa học
                  </label>
                  <Input
                    type="text"
                    value={courseFormData.name}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={courseFormData.description}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowEditCourse(false)}
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

        {/* Add Lesson Modal */}
        {showAddLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Thêm bài học mới</h2>
                <button
                  onClick={() => setShowAddLesson(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddLesson} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề bài học *
                  </label>
                  <Input
                    type="text"
                    value={lessonFormData.title}
                    onChange={(e) => setLessonFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại bài học
                  </label>
                  <select
                    value={lessonFormData.type}
                    onChange={(e) => setLessonFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="document">Tài liệu</option>
                    <option value="video">Video</option>
                    <option value="quiz">Bài kiểm tra</option>
                    <option value="assignment">Bài tập</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={lessonFormData.description}
                    onChange={(e) => setLessonFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nội dung bài học
                  </label>
                  <textarea
                    value={lessonFormData.content}
                    onChange={(e) => setLessonFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập nội dung chi tiết của bài học..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời lượng (phút)
                  </label>
                  <Input
                    type="number"
                    value={lessonFormData.duration}
                    onChange={(e) => setLessonFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min="1"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowAddLesson(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Đang thêm...' : 'Thêm bài học'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload Material Modal */}
        {showUploadMaterial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Tải lên tài liệu</h2>
                <button
                  onClick={() => setShowUploadMaterial(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Kéo thả file vào đây hoặc</p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Chọn file
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Hỗ trợ: PDF, Word, PowerPoint, Excel, Hình ảnh, Video
                  </p>
                </div>
                
                {uploading && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Đang tải lên...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Schedule Modal */}
        {showAddSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Thêm lịch học</h2>
                <button
                  onClick={() => setShowAddSchedule(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddSchedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thứ
                  </label>
                  <select
                    value={scheduleFormData.dayOfWeek}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ bắt đầu
                    </label>
                    <Input
                      type="time"
                      value={scheduleFormData.startTime}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ kết thúc
                    </label>
                    <Input
                      type="time"
                      value={scheduleFormData.endTime}
                      onChange={(e) => setScheduleFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phòng học
                  </label>
                  <Input
                    type="text"
                    value={scheduleFormData.room}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, room: e.target.value }))}
                    placeholder="Ví dụ: A101, B205"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowAddSchedule(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Đang thêm...' : 'Thêm lịch học'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enroll Students Modal */}
        {showEnrollModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Thêm sinh viên</h3>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault()
                setEnrollmentLoading(true)
                try {
                  const formData = new FormData(e.currentTarget)
                  const studentData = {
                    studentId: formData.get('studentId') as string,
                    email: formData.get('email') as string
                  }
                  
                  await enrollmentService.enrollStudent(id as string, studentData)
                  
                  // Reload enrollments
                  const [enrollmentsData, enrollmentStatsData] = await Promise.all([
                    enrollmentService.getCourseEnrollments(id as string),
                    enrollmentService.getCourseEnrollmentStats(id as string)
                  ])
                  setEnrollments(enrollmentsData)
                  setEnrollmentStats(enrollmentStatsData)
                  
                  setShowEnrollModal(false)
                } catch (error) {
                  console.error('Error enrolling student:', error)
                } finally {
                  setEnrollmentLoading(false)
                }
              }} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã sinh viên
                    </label>
                    <Input
                      name="studentId"
                      type="text"
                      placeholder="Nhập mã sinh viên"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email sinh viên
                    </label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="student@email.com"
                      required
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Thêm nhiều sinh viên</h4>
                    <p className="text-xs text-blue-700">
                      Để thêm nhiều sinh viên cùng lúc, sử dụng chức năng "Xuất danh sách" để tải file mẫu, 
                      sau đó import file Excel/CSV.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowEnrollModal(false)}
                    disabled={enrollmentLoading}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={enrollmentLoading}>
                    {enrollmentLoading ? 'Đang thêm...' : 'Thêm sinh viên'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
