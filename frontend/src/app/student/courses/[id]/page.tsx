'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { 
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  Clock,
  FileText,
  Play,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { courseService, Course } from '@/services/courseService'
import { examService, Exam } from '@/services/examService'
import Link from 'next/link'

export default function StudentCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true)
        const [courseData, examsData] = await Promise.all([
          courseService.getCourse(courseId),
          examService.getExamsByCourse(courseId)
        ])
        
        setCourse(courseData)
        setExams(examsData)
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin khóa học')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      loadCourseData()
    }
  }, [courseId])

  const isExamAvailable = (exam: Exam) => {
    const now = new Date()
    const startTime = new Date(exam.startTime)
    const endTime = new Date(exam.endTime)
    
    return exam.isActive && now >= startTime && now <= endTime
  }

  const getExamStatus = (exam: Exam) => {
    const now = new Date()
    const startTime = new Date(exam.startTime)
    const endTime = new Date(exam.endTime)
    
    if (!exam.isActive) return { status: 'inactive', label: 'Không hoạt động', color: 'gray' }
    if (now < startTime) return { status: 'upcoming', label: 'Sắp diễn ra', color: 'blue' }
    if (now > endTime) return { status: 'ended', label: 'Đã kết thúc', color: 'red' }
    return { status: 'active', label: 'Đang diễn ra', color: 'green' }
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

  if (error || !course) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải khóa học</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/student/courses">
              <Button>Quay lại danh sách khóa học</Button>
            </Link>
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
          <Link href="/student/courses" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách khóa học
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
                    <p className="text-lg text-blue-600 font-medium">{course.code}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.classes?.length || 0} lớp học</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Tạo ngày {formatDate(course.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status === 'published' ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              {/* Exams Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Bài kiểm tra
                  </h2>
                  <span className="text-sm text-gray-500">{exams.length} bài thi</span>
                </div>

                {exams.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài thi nào</h3>
                    <p className="text-gray-600">Giảng viên chưa tạo bài thi cho khóa học này</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exams.map((exam) => {
                      const status = getExamStatus(exam)
                      const available = isExamAvailable(exam)
                      
                      return (
                        <div key={exam._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">{exam.title}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  status.color === 'green' ? 'bg-green-100 text-green-800' :
                                  status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                  status.color === 'red' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {status.label}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3">{exam.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{exam.duration} phút</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  <span>{exam.questions?.length || 0} câu hỏi</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Điểm đạt: {exam.passingScore}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Bắt đầu: {formatDate(exam.startTime)}</span>
                                <span>Kết thúc: {formatDate(exam.endTime)}</span>
                              </div>
                            </div>
                            
                            <div className="ml-4">
                              {available ? (
                                <Link href={`/student/exams/${exam._id}/take`}>
                                  <Button size="sm">
                                    <Play className="w-4 h-4 mr-2" />
                                    Làm bài
                                  </Button>
                                </Link>
                              ) : (
                                <Button size="sm" disabled>
                                  {status.status === 'upcoming' && 'Chưa mở'}
                                  {status.status === 'ended' && 'Đã đóng'}
                                  {status.status === 'inactive' && 'Không hoạt động'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Teacher Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Giảng viên</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {course.teacher.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {course.teacher.name}
                    </h4>
                    <p className="text-sm text-gray-600">Giảng viên</p>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Thông tin khóa học</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng lớp học:</span>
                    <span className="font-medium">{course.classes?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số bài thi:</span>
                    <span className="font-medium">{exams.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bài thi khả dụng:</span>
                    <span className="font-medium text-green-600">
                      {exams.filter(exam => isExamAvailable(exam)).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`font-medium ${course.status === 'published' ? 'text-green-600' : 'text-gray-600'}`}>
                      {course.status === 'published' ? 'Đang hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
    </AppLayout>
  )
}
