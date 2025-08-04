'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiService } from '@/lib/api'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Flag,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Question, QUESTION_TYPES } from '@/lib/types'

// Mock exam data for fallback
const mockExam = {
  id: '1',
  title: 'Kiểm tra giữa kỳ - Lập trình Web',
  course: 'CS101',
  duration: 90, // minutes
  totalPoints: 100,
  questions: [
    {
      id: '1',
      type: QUESTION_TYPES.MULTIPLE_CHOICE,
      question: 'HTML là viết tắt của gì?',
      options: [
        'HyperText Markup Language',
        'High Tech Modern Language',
        'Home Tool Markup Language',
        'Hyperlink and Text Markup Language'
      ],
      correctAnswer: 0,
      points: 10
    },
    {
      id: '2',
      type: QUESTION_TYPES.MULTIPLE_CHOICE,
      question: 'CSS được sử dụng để làm gì?',
      options: [
        'Tạo cấu trúc trang web',
        'Tạo kiểu dáng cho trang web',
        'Tạo logic cho trang web',
        'Quản lý cơ sở dữ liệu'
      ],
      correctAnswer: 1,
      points: 10
    },
    {
      id: '3',
      type: QUESTION_TYPES.TRUE_FALSE,
      question: 'JavaScript là ngôn ngữ lập trình phía server.',
      correctAnswer: false,
      points: 5
    },
    {
      id: '4',
      type: QUESTION_TYPES.SHORT_ANSWER,
      question: 'Viết code HTML để tạo một button với text "Click me"',
      points: 15
    },
    {
      id: '5',
      type: QUESTION_TYPES.ESSAY,
      question: 'Giải thích sự khác biệt giữa var, let và const trong JavaScript. Cho ví dụ minh họa.',
      points: 25
    }
  ] as Question[]
}

export default function ExamTakingPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [exam, setExam] = useState<any>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [loadingExam, setLoadingExam] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'student') {
        router.push('/auth/login')
        return
      }
      
      fetchExamData()
    }
  }, [user, loading, router, params.id])

  const fetchExamData = async () => {
    try {
      setLoadingExam(true)
      
      // Try to fetch real exam data, fallback to mock
      let examData
      try {
        const response = await apiService.getExam(params.id as string) as any
        examData = response.exam
      } catch (error) {
        console.error('Failed to fetch exam, using mock data:', error)
        examData = mockExam
      }
      
      setExam(examData)
      setTimeLeft(examData.duration * 60) // Convert to seconds
    } catch (error) {
      console.error('Failed to load exam:', error)
      router.push('/student/dashboard')
    } finally {
      setLoadingExam(false)
    }
  }

  const currentQuestion = exam?.questions[currentQuestionIndex]

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && exam) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && !isSubmitted && exam) {
      handleSubmit()
    }
  }, [timeLeft, isSubmitted, exam])

  const handleSubmit = async () => {
    if (submitting) return
    
    if (!window.confirm('Bạn có chắc chắn muốn nộp bài? Bạn sẽ không thể chỉnh sửa sau khi nộp.')) {
      return
    }

    setSubmitting(true)
    
    try {
      await apiService.submitExam(exam.id, answers)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Failed to submit exam:', error)
      alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || loadingExam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài thi...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài thi</h1>
          <Button onClick={() => router.push('/student/dashboard')}>
            Quay về Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const getQuestionStatus = (questionId: string) => {
    if (answers[questionId] !== undefined) return 'answered'
    if (flaggedQuestions.has(questionId)) return 'flagged'
    return 'unanswered'
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    switch (currentQuestion.type) {
      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={index}
                  checked={answers[currentQuestion.id] === index}
                  onChange={() => handleAnswerChange(currentQuestion.id, index)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case QUESTION_TYPES.TRUE_FALSE:
        return (
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value="true"
                checked={answers[currentQuestion.id] === true}
                onChange={() => handleAnswerChange(currentQuestion.id, true)}
                className="w-4 h-4 text-blue-600"
              />
              <span>Đúng</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value="false"
                checked={answers[currentQuestion.id] === false}
                onChange={() => handleAnswerChange(currentQuestion.id, false)}
                className="w-4 h-4 text-blue-600"
              />
              <span>Sai</span>
            </label>
          </div>
        )

      case QUESTION_TYPES.SHORT_ANSWER:
        return (
          <textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Nhập câu trả lời của bạn..."
          />
        )

      case QUESTION_TYPES.ESSAY:
        return (
          <textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={8}
            placeholder="Nhập câu trả lời chi tiết của bạn..."
          />
        )

      default:
        return null
    }
  }

  if (isSubmitted) {
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto p-6">
            <Card>
              <div className="text-center py-12">
                <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Nộp bài thành công!
                </h1>
                <p className="text-gray-600 mb-6">
                  Bài làm của bạn đã được nộp và sẽ được chấm điểm sớm nhất có thể.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Câu đã trả lời</p>
                    <p className="text-lg font-semibold">
                      {Object.keys(answers).length}/{mockExam.questions.length}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Thời gian đã dùng</p>
                    <p className="text-lg font-semibold">
                      {formatTime((mockExam.duration * 60) - timeLeft)}
                    </p>
                  </div>
                </div>
                <Button onClick={() => window.location.href = '/student/dashboard'}>
                  Quay về Dashboard
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout showSidebar={false}>
      {/* Header with back button only */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.href = '/student/courses'}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Trở về danh sách
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">{mockExam.title}</h1>
              <p className="text-gray-600">{mockExam.course}</p>
            </div>
            <div></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Exam Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock size={16} />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
              <Button variant="danger" onClick={handleSubmit}>
                Nộp bài
              </Button>
            </div>
          </div>
          
          {timeLeft < 300 && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle size={16} className="text-red-600" />
              <span className="text-red-700 text-sm">
                Thời gian sắp hết! Vui lòng hoàn thành và nộp bài.
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <Card title="Câu hỏi" className="sticky top-6">
              <div className="grid grid-cols-5 gap-2">
                {mockExam.questions.map((question, index) => {
                  const status = getQuestionStatus(question.id)
                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`p-2 text-sm font-medium rounded border ${
                        currentQuestionIndex === index
                          ? 'bg-blue-600 text-white border-blue-600'
                          : status === 'answered'
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : status === 'flagged'
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Đã trả lời</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span>Đã đánh dấu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                  <span>Chưa trả lời</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Câu {currentQuestionIndex + 1} / {mockExam.questions.length}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {currentQuestion.points} điểm
                    </span>
                    <button
                      onClick={() => toggleFlag(currentQuestion.id)}
                      className={`p-2 rounded-lg ${
                        flaggedQuestions.has(currentQuestion.id)
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Flag size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg mb-6">
                  <p className="text-gray-900 leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>

                {renderQuestion()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Câu trước
                </Button>
                
                <span className="text-sm text-gray-600">
                  {currentQuestionIndex + 1} / {mockExam.questions.length}
                </span>

                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(mockExam.questions.length - 1, prev + 1))}
                  disabled={currentQuestionIndex === mockExam.questions.length - 1}
                >
                  Câu sau
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
