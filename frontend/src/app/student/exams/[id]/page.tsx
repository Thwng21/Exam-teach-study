'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { examService, type Exam } from '@/services/examService'
import { submissionService, type Submission } from '@/services/submissionService'
import { 
  Clock, 
  Calendar,
  Users,
  BookOpen,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Play,
  Eye,
  Award,
  Target
} from 'lucide-react'

interface ExamDetail {
  id: string
  title: string
  description: string
  course: {
    id: string
    name: string
    code: string
  }
  duration: number // in minutes
  totalQuestions: number
  totalPoints: number
  startTime: string
  endTime: string
  isActive: boolean
  allowRetake: boolean
  maxAttempts: number
  passingScore: number
  instructions: string[]
  createdBy: {
    firstName: string
    lastName: string
  }
  // Student's submission info
  submission?: {
    id: string
    startedAt: string
    submittedAt?: string
    score?: number
    answeredQuestions: number
    status: 'in_progress' | 'submitted' | 'graded'
    attempt: number
  }
}

export default function ExamDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [exam, setExam] = useState<Exam | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadExamDetail()
    }
  }, [id])

  const loadExamDetail = async () => {
    try {
      setLoading(true)
      // Load exam details from API
      const examData = await examService.getExam(id as string)
      setExam(examData)
      
      // Load student's submissions for this exam
      const submissionsData = await submissionService.getSubmissions()
      const examSubmissions = submissionsData.filter(sub => sub.exam._id === id)
      setSubmissions(examSubmissions)
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin bài thi')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours} giờ ${mins} phút`
    }
    return `${mins} phút`
  }

  const getExamStatus = () => {
    if (!exam) return { text: '', color: '', canTake: false }
    
    const now = new Date()
    const startTime = new Date(exam.startTime)
    const endTime = new Date(exam.endTime)

    if (!exam.isActive) {
      return { text: 'Bài thi không hoạt động', color: 'gray', canTake: false }
    }

    // Check if student has submitted
    const latestSubmission = submissions.length > 0 ? submissions[submissions.length - 1] : null
    
    if (latestSubmission) {
      if (latestSubmission.submittedAt) {
        return { text: 'Đã hoàn thành', color: 'green', canTake: false }
      }
      return { text: 'Đang làm bài', color: 'yellow', canTake: true }
    }

    if (now < startTime) {
      return { text: 'Chưa bắt đầu', color: 'yellow', canTake: false }
    }
    if (now > endTime) {
      return { text: 'Đã kết thúc', color: 'red', canTake: false }
    }
    
    return { text: 'Có thể làm bài', color: 'green', canTake: true }
  }

  const handleStartExam = () => {
    const latestSubmission = submissions.length > 0 ? submissions[submissions.length - 1] : null
    
    if (latestSubmission && !latestSubmission.submittedAt) {
      router.push(`/student/exam/${exam?._id}`)
    } else {
      router.push(`/student/exams/${exam?._id}/take`)
    }
  }

  const handleViewResult = () => {
    const latestSubmission = submissions.length > 0 ? submissions[submissions.length - 1] : null
    if (latestSubmission) {
      router.push(`/student/results/${latestSubmission._id}`)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !exam) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải bài thi</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/student/exams')}>
              Quay lại danh sách bài thi
            </Button>
          </Card>
        </div>
      </AppLayout>
    )
  }

  const status = getExamStatus()

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/student/exams')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách bài thi
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {exam.course.name} ({exam.course.code})
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {exam.teacher.firstName} {exam.teacher.lastName}
                </div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              status.color === 'green' ? 'bg-green-100 text-green-800' :
              status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
              status.color === 'red' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status.text}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả bài thi</h2>
              <p className="text-gray-700 leading-relaxed">{exam.description}</p>
            </Card>

            {/* Instructions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hướng dẫn làm bài</h2>
              <ul className="space-y-2">
                {/* Default instructions since Exam interface doesn't have instructions */}
                {[
                  'Đọc kỹ câu hỏi trước khi trả lời',
                  'Chọn đáp án đúng nhất cho câu hỏi trắc nghiệm',
                  'Trả lời đầy đủ và chi tiết cho câu hỏi tự luận',
                  'Kiểm tra lại bài làm trước khi nộp',
                  'Không được sử dụng tài liệu tham khảo',
                  'Thời gian làm bài được hiển thị ở góc phải màn hình'
                ].map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Submission Result */}
            {submissions.length > 0 && submissions[submissions.length - 1].submittedAt && (
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="flex items-center mb-4">
                  <Award className="w-6 h-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-semibold text-green-900">Kết quả bài thi</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-green-700">Điểm số</p>
                    <p className="text-2xl font-bold text-green-900">
                      {submissions[submissions.length - 1].score}/{exam.maxScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Tỷ lệ đúng</p>
                    <p className="text-2xl font-bold text-green-900">
                      {Math.round((submissions[submissions.length - 1].score! / exam.maxScore) * 100)}%
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button onClick={handleViewResult} className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết kết quả
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Thông tin bài thi</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Thời gian làm bài</span>
                  <span className="font-medium">{formatDuration(exam.duration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Số câu hỏi</span>
                  <span className="font-medium">{exam.questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tổng điểm</span>
                  <span className="font-medium">{exam.maxScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Điểm đạt</span>
                  <span className="font-medium">{exam.passingScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Số lần thi</span>
                  <span className="font-medium">
                    {submissions.length}/1
                  </span>
                </div>
              </div>
            </Card>

            {/* Schedule */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Lịch thi</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    Bắt đầu
                  </div>
                  <p className="font-medium">{formatDateTime(exam.startTime)}</p>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    Kết thúc
                  </div>
                  <p className="font-medium">{formatDateTime(exam.endTime)}</p>
                </div>
              </div>
            </Card>

            {/* Action Button */}
            <Card className="p-6">
              {status.canTake ? (
                <Button 
                  onClick={handleStartExam} 
                  className="w-full flex items-center justify-center"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {submissions.length > 0 && submissions[submissions.length - 1].status === 'in_progress' ? 'Tiếp tục làm bài' : 'Bắt đầu làm bài'}
                </Button>
              ) : submissions.length > 0 && submissions[submissions.length - 1].status === 'completed' ? (
                <Button 
                  onClick={handleViewResult} 
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  size="lg"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Xem kết quả
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Không thể làm bài thi</p>
                  <div className={`px-3 py-2 rounded text-sm ${
                    status.color === 'red' ? 'bg-red-100 text-red-800' :
                    status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status.text}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
