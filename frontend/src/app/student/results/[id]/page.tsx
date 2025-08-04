'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { submissionService } from '@/services/submissionService'
import { examService } from '@/services/examService'
import type { Submission } from '@/services/submissionService'
import type { Exam } from '@/services/examService'
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Target,
  Eye,
  Download,
  BarChart,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface QuestionResult {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay'
  options?: string[]
  correctAnswer: string | boolean
  studentAnswer: string | boolean
  isCorrect: boolean
  points: number
  maxPoints: number
  explanation?: string
}

export default function ExamResultPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAnswers, setShowAnswers] = useState(false)

  useEffect(() => {
    if (id) {
      loadExamResult()
    }
  }, [id])

  const loadExamResult = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Loading exam result for submission ID:', id)
      
      // Fetch submission data
      const submissionData = await submissionService.getSubmission(id as string)
      console.log('Submission data loaded:', submissionData)
      setSubmission(submissionData)
      
      // Check if submission has exam reference
      if (!submissionData.exam || !submissionData.exam._id) {
        throw new Error('Dữ liệu bài thi không hợp lệ - thiếu thông tin exam')
      }
      
      // Fetch exam data
      console.log('Loading exam data for exam ID:', submissionData.exam._id)
      const examData = await examService.getExam(submissionData.exam._id)
      console.log('Exam data loaded:', examData)
      setExam(examData)
      
    } catch (err: any) {
      console.error('Error loading exam result:', err)
      
      // More specific error messages
      if (err.response?.status === 404) {
        setError('Không tìm thấy kết quả bài thi. Vui lòng kiểm tra lại.')
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền xem kết quả này.')
      } else if (err.message?.includes('thiếu thông tin exam')) {
        setError('Dữ liệu bài thi không hợp lệ. Vui lòng liên hệ giảng viên.')
      } else {
        setError('Có lỗi xảy ra khi tải kết quả thi. Vui lòng thử lại.')
      }
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

  const getQuestionIcon = (type: string) => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case 'multiple-choice':
        return <BarChart className={`${iconClass} text-blue-500`} />
      case 'true-false':
        return <Target className={`${iconClass} text-green-500`} />
      case 'fill-blank':
        return <CheckCircle className={`${iconClass} text-purple-500`} />
      case 'essay':
        return <Award className={`${iconClass} text-orange-500`} />
      default:
        return <CheckCircle className={`${iconClass} text-gray-500`} />
    }
  }

  const getAnswerDisplay = (question: QuestionResult) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Đáp án của bạn: </span>
              <span className={question.isCorrect ? 'text-green-700' : 'text-red-700'}>
                {question.studentAnswer as string}
              </span>
            </div>
            {!question.isCorrect && (
              <div>
                <span className="text-sm font-medium text-gray-700">Đáp án đúng: </span>
                <span className="text-green-700">{question.correctAnswer as string}</span>
              </div>
            )}
          </div>
        )
      case 'true-false':
        return (
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Đáp án của bạn: </span>
              <span className={question.isCorrect ? 'text-green-700' : 'text-red-700'}>
                {question.studentAnswer ? 'Đúng' : 'Sai'}
              </span>
            </div>
            {!question.isCorrect && (
              <div>
                <span className="text-sm font-medium text-gray-700">Đáp án đúng: </span>
                <span className="text-green-700">{question.correctAnswer ? 'Đúng' : 'Sai'}</span>
              </div>
            )}
          </div>
        )
      case 'fill-blank':
      case 'essay':
        return (
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Câu trả lời của bạn: </span>
              <div className={`mt-1 p-2 rounded border ${question.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                {question.studentAnswer as string}
              </div>
            </div>
            {!question.isCorrect && (
              <div>
                <span className="text-sm font-medium text-gray-700">Đáp án mẫu: </span>
                <div className="mt-1 p-2 rounded border bg-green-50 border-green-200">
                  {question.correctAnswer as string}
                </div>
              </div>
            )}
          </div>
        )
      default:
        return null
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

  if (error || !submission || !exam) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải kết quả</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            
            {/* Debug information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-left text-xs text-gray-500 bg-gray-50 p-4 rounded mb-4">
                <p><strong>Debug Info:</strong></p>
                <p>Submission ID: {id}</p>
                <p>Submission loaded: {submission ? 'Yes' : 'No'}</p>
                <p>Exam loaded: {exam ? 'Yes' : 'No'}</p>
                {submission && (
                  <p>Exam ID in submission: {submission.exam?._id || 'Not found'}</p>
                )}
              </div>
            )}
            
            <div className="space-x-4">
              <Button onClick={() => router.push('/student/results')}>
                Quay lại danh sách kết quả
              </Button>
              <Button 
                onClick={() => loadExamResult()} 
                variant="outline"
              >
                Thử lại
              </Button>
            </div>
          </Card>
        </div>
      </AppLayout>
    )
  }

  // Calculate statistics from submission answers
  const correctAnswers = submission.answers?.filter(answer => answer.isCorrect).length || 0
  const totalQuestions = exam.questions.length
  const percentage = submission.percentage || (exam.maxScore > 0 ? Math.round((submission.score / exam.maxScore) * 100) : 0)
  const passed = submission.score >= exam.passingScore
  const timeSpent = submission.timeSpent || 0

  // Check if exam is overdue
  const now = new Date()
  const examEndTime = new Date(exam.endTime)
  const isOverdue = now > examEndTime
  
  // Check if submission was late
  const submissionTime = submission.submittedAt ? new Date(submission.submittedAt) : null
  const isLateSubmission = submissionTime && submissionTime > examEndTime

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/student/results')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách kết quả
          </button>

          {/* Show exam status warning if overdue */}
          {isOverdue && (
            <div className="mb-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-orange-600 mr-2" />
                <div>
                  <p className="text-orange-800 font-medium">Bài thi đã kết thúc</p>
                  <p className="text-orange-700 text-sm">
                    Thời gian thi: {formatDateTime(exam.startTime)} - {formatDateTime(exam.endTime)}
                    {isLateSubmission && ' • Bài thi của bạn được nộp sau thời hạn'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Kết quả bài thi</h1>
              <p className="text-xl text-gray-600 mb-1">{exam.title}</p>
              <p className="text-gray-500">{submission.exam?.course?.name || 'Khóa học'} ({submission.exam?.course?.code || 'N/A'})</p>
              
              {/* Show exam status */}
              {isOverdue && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Bài thi đã kết thúc
                  </span>
                  {isLateSubmission && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Nộp trễ
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className={`px-4 py-2 rounded-lg text-lg font-medium ${
              passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{submission.score}</p>
              <p className="text-sm text-gray-600">Điểm số</p>
              <p className="text-xs text-gray-500">/{exam.maxScore} điểm</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
              <p className="text-sm text-gray-600">Tỷ lệ đúng</p>
              <p className="text-xs text-gray-500">Yêu cầu: {Math.round((exam.passingScore / exam.maxScore) * 100)}%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{correctAnswers}</p>
              <p className="text-sm text-gray-600">Câu đúng</p>
              <p className="text-xs text-gray-500">/{totalQuestions} câu</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{timeSpent}</p>
              <p className="text-sm text-gray-600">Phút</p>
              <p className="text-xs text-gray-500">/{exam.duration} phút</p>
            </div>
          </div>
        </Card>

        {/* Exam Info */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin bài thi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Sinh viên:</span>
              <span className="ml-2 font-medium">{submission.student?.firstName} {submission.student?.lastName} ({submission.student?.studentId})</span>
            </div>
            <div>
              <span className="text-gray-600">Lần thi:</span>
              <span className="ml-2 font-medium">Lần 1</span>
            </div>
            <div>
              <span className="text-gray-600">Thời gian bài thi:</span>
              <span className="ml-2 font-medium">{formatDateTime(exam.startTime)} - {formatDateTime(exam.endTime)}</span>
            </div>
            <div>
              <span className="text-gray-600">Trạng thái:</span>
              <span className={`ml-2 font-medium ${isOverdue ? 'text-orange-600' : 'text-green-600'}`}>
                {isOverdue ? 'Đã kết thúc' : 'Đang diễn ra'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Bắt đầu làm:</span>
              <span className="ml-2 font-medium">{submission.startedAt ? formatDateTime(submission.startedAt) : 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Nộp bài:</span>
              <span className={`ml-2 font-medium ${isLateSubmission ? 'text-red-600' : ''}`}>
                {submission.submittedAt ? formatDateTime(submission.submittedAt) : 'N/A'}
                {isLateSubmission && ' (Trễ hạn)'}
              </span>
            </div>
            {submission.gradedAt && (
              <>
                <div>
                  <span className="text-gray-600">Chấm điểm:</span>
                  <span className="ml-2 font-medium">{formatDateTime(submission.gradedAt)}</span>
                </div>
                {submission.gradedBy && (
                  <div>
                    <span className="text-gray-600">Chấm bởi:</span>
                    <span className="ml-2 font-medium">{submission.gradedBy}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Feedback */}
        {submission.feedback && (
          <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">Nhận xét của giảng viên</h2>
            <p className="text-blue-800">{submission.feedback}</p>
          </Card>
        )}

        {/* Questions Review */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Chi tiết câu hỏi</h2>
            <Button
              onClick={() => setShowAnswers(!showAnswers)}
              variant="outline"
              className="flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showAnswers ? 'Ẩn đáp án' : 'Hiện đáp án'}
            </Button>
          </div>

          <div className="space-y-6">
            {exam.questions.map((question, index) => {
              const answer = submission.answers?.find(a => a.questionIndex === index)
              return (
                <div key={index} className="border-l-4 pl-4 border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getQuestionIcon(question.type)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          Câu {index + 1}: {question.question}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Loại: {
                            question.type === 'multiple-choice' ? 'Trắc nghiệm' :
                            question.type === 'true-false' ? 'Đúng/Sai' :
                            question.type === 'fill-blank' ? 'Điền từ' :
                            'Tự luận'
                          }</span>
                          <span>{answer?.points || 0}/{question.points} điểm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {showAnswers && (
                    <div className="ml-8 mt-3 space-y-3">
                      {question.options && question.type === 'multiple-choice' && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Các lựa chọn:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {question.options.map((option, idx) => (
                              <li key={idx} className={
                                idx === question.correctAnswer ? 'text-green-700 font-medium' :
                                idx === answer?.studentAnswer && !answer?.isCorrect ? 'text-red-700' :
                                ''
                              }>
                                {option}
                              </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Answer Display */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Câu trả lời:</p>
                      <div className="text-sm">
                        <p className="text-gray-800">
                          <span className="font-medium">Bạn chọn:</span> {
                            question.type === 'multiple-choice' && answer ? 
                              question.options[answer.studentAnswer] || 'Không trả lời' :
                              answer?.studentAnswer?.toString() || 'Không trả lời'
                          }
                        </p>
                        <p className="text-green-600">
                          <span className="font-medium">Đáp án đúng:</span> {
                            question.type === 'multiple-choice' ? 
                              question.options[question.correctAnswer as number] :
                              question.correctAnswer?.toString()
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              )
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex space-x-4">
          <Button onClick={() => router.push('/student/results')}>
            Xem tất cả kết quả
          </Button>
          <Button 
            onClick={() => router.push(`/student/exams/${exam._id}`)}
            variant="outline"
          >
            Xem thông tin bài thi
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
