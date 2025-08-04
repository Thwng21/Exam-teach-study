'use client'

import { useState, useEffect, useReducer, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/Button'
import Card from '@/components/Card'
import AppLayout from '@/components/AppLayout'
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { api } from '@/services/api'

interface Question {
  _id: string
  type: 'multiple-choice' | 'true-false' | 'essay' | 'fill-blank'
  question: string
  options: string[]
  points: number
  order: number
}

interface ExamData {
  _id: string
  title: string
  description: string
  course: {
    _id: string
    name: string
    code: string
  }
  duration: number
  questions: Question[]
  startTime: string
  endTime: string
  submissionId: string
  startedAt: string
}

interface AnswerState {
  [questionIndex: number]: string | number | boolean
}

interface ExamState {
  examData: ExamData | null
  answers: AnswerState
  currentQuestion: number
  timeRemaining: number
  isSubmitting: boolean
  error: string
  submitted: boolean
  submissionResult: any
}

type ExamAction = 
  | { type: 'SET_EXAM_DATA'; payload: ExamData }
  | { type: 'SET_ANSWER'; payload: { questionIndex: number; answer: string | number | boolean } }
  | { type: 'SET_CURRENT_QUESTION'; payload: number }
  | { type: 'TICK_TIMER' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_SUBMITTED'; payload: { submitted: boolean; result?: any } }

const examReducer = (state: ExamState, action: ExamAction): ExamState => {
  switch (action.type) {
    case 'SET_EXAM_DATA':
      const startedAt = new Date(action.payload.startedAt).getTime()
      const duration = action.payload.duration * 60 * 1000 // convert to milliseconds
      const timeRemaining = Math.max(0, duration - (Date.now() - startedAt))
      
      return {
        ...state,
        examData: action.payload,
        timeRemaining: Math.floor(timeRemaining / 1000) // convert to seconds
      }
    case 'SET_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionIndex]: action.payload.answer
        }
      }
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload
      }
    case 'TICK_TIMER':
      return {
        ...state,
        timeRemaining: Math.max(0, state.timeRemaining - 1)
      }
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }
    case 'SET_SUBMITTED':
      return {
        ...state,
        submitted: action.payload.submitted,
        submissionResult: action.payload.result
      }
    default:
      return state
  }
}

export default function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // Unwrap params using React.use()
  const { id: examId } = use(params)

  const [state, dispatch] = useReducer(examReducer, {
    examData: null,
    answers: {},
    currentQuestion: 0,
    timeRemaining: 0,
    isSubmitting: false,
    error: '',
    submitted: false,
    submissionResult: null
  })

  useEffect(() => {
    if (user?.role !== 'student') {
      router.push('/dashboard')
      return
    }
    loadExam()
  }, [user])

  useEffect(() => {
    if (state.timeRemaining <= 0 && state.examData && !state.submitted) {
      handleSubmit()
    }
  }, [state.timeRemaining])

  useEffect(() => {
    if (state.examData && state.timeRemaining > 0 && !state.submitted) {
      const timer = setInterval(() => {
        dispatch({ type: 'TICK_TIMER' })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [state.examData, state.timeRemaining, state.submitted])

  const loadExam = async () => {
    try {
      setLoading(true)
      console.log('Loading exam with ID:', examId)
      console.log('API URL:', `/exams/${examId}/take`)
      
      const response = await api.get(`/exams/${examId}/take`) as any
      console.log('API Response successful:', response)
      
      // API interceptor returns response.data, so we check for data structure
      if (response && response.data && response.data.exam) {
        console.log('Found exam data, setting exam state')
        dispatch({ type: 'SET_EXAM_DATA', payload: response.data.exam })
      } else if (response && response.exam) {
        console.log('Found exam in direct response')
        dispatch({ type: 'SET_EXAM_DATA', payload: response.exam })
      } else {
        console.log('Invalid response structure:', response)
        dispatch({ type: 'SET_ERROR', payload: 'Dữ liệu bài thi không hợp lệ' })
      }
    } catch (err: any) {
      console.log('ERROR CAUGHT in loadExam')
      console.log('Error object:', err)
      console.log('Error message:', err.message)
      console.log('Error status:', err.status)
      
      // Handle specific error cases based on message content
      const errorMessage = err.message || 'Không thể tải bài thi'
      
      if (errorMessage.includes('đã nộp bài thi này rồi') || errorMessage.includes('Bạn đã nộp bài thi này rồi')) {
        console.log('Student already submitted - showing completion message')
        dispatch({ type: 'SET_ERROR', payload: 'Bạn đã hoàn thành bài thi này rồi. Không thể làm lại.' })
      } else if (errorMessage.includes('chưa bắt đầu')) {
        dispatch({ type: 'SET_ERROR', payload: 'Bài thi chưa bắt đầu. Vui lòng đợi đến thời gian thi.' })
      } else if (errorMessage.includes('đã kết thúc')) {
        dispatch({ type: 'SET_ERROR', payload: 'Bài thi đã kết thúc. Bạn không thể tham gia nữa.' })
      } else if (errorMessage.includes('Không có quyền truy cập')) {
        dispatch({ type: 'SET_ERROR', payload: 'Bạn cần đăng nhập để truy cập bài thi.' })
      } else {
        dispatch({ type: 'SET_ERROR', payload: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionIndex: number, answer: string | number | boolean) => {
    dispatch({ type: 'SET_ANSWER', payload: { questionIndex, answer } })
  }

  const handleSubmit = async () => {
    if (state.isSubmitting || !state.examData) return

    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true })
      
      const answersArray = state.examData.questions.map((_, index) => 
        state.answers[index] !== undefined ? state.answers[index] : null
      )

      const response = await api.post(`/submissions/${state.examData.submissionId}/submit`, {
        answers: answersArray
      })

      dispatch({ 
        type: 'SET_SUBMITTED', 
        payload: { submitted: true, result: response.data.submission } 
      })
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Không thể nộp bài' })
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false })
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const renderQuestion = (question: Question, index: number) => {
    const answer = state.answers[index]

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={optionIndex}
                  checked={answer === optionIndex}
                  onChange={(e) => handleAnswerChange(index, parseInt(e.target.value))}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'true-false':
        return (
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={`question-${index}`}
                value="true"
                checked={answer === true}
                onChange={() => handleAnswerChange(index, true)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Đúng</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={`question-${index}`}
                value="false"
                checked={answer === false}
                onChange={() => handleAnswerChange(index, false)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Sai</span>
            </label>
          </div>
        )

      case 'fill-blank':
        return (
          <input
            type="text"
            value={answer as string || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập câu trả lời..."
          />
        )

      case 'essay':
        return (
          <textarea
            value={answer as string || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
            placeholder="Nhập câu trả lời..."
          />
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải bài thi...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (state.error) {
    const isAlreadySubmitted = state.error.includes('đã hoàn thành bài thi này rồi')
    
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto text-center p-6">
            {isAlreadySubmitted ? (
              <>
                <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Đã hoàn thành</h3>
                <p className="text-blue-600 mb-4">{state.error}</p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push('/student/exams')}
                    className="w-full"
                  >
                    Xem danh sách bài thi
                  </Button>
                  <Button 
                    onClick={() => router.push('/student/dashboard')}
                    variant="outline"
                    className="w-full"
                  >
                    Về dashboard
                  </Button>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi</h3>
                <p className="text-red-600 mb-4">{state.error}</p>
                <Button onClick={() => router.push('/student/exams')}>
                  Quay lại danh sách bài thi
                </Button>
              </>
            )}
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (state.submitted) {
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto text-center p-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nộp bài thành công!</h3>
            {state.submissionResult && (
              <div className="text-left space-y-2 mb-4">
                <p><strong>Điểm:</strong> {state.submissionResult.score}/{state.submissionResult.totalPoints}</p>
                <p><strong>Phần trăm:</strong> {state.submissionResult.percentage}%</p>
                <p><strong>Thời gian làm bài:</strong> {state.submissionResult.timeSpent} phút</p>
                {state.submissionResult.isLate && (
                  <p className="text-red-600"><strong>Trạng thái:</strong> Nộp trễ</p>
                )}
              </div>
            )}
            <Button onClick={() => router.push('/student/exams')}>
              Quay lại danh sách bài thi
            </Button>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (!state.examData) return null

  const currentQuestion = state.examData.questions[state.currentQuestion]
  const answeredCount = Object.keys(state.answers).length
  const totalQuestions = state.examData.questions.length
  const isTimeRunningOut = state.timeRemaining <= 300 // 5 minutes

  return (
    <AppLayout showSidebar={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Header with timer */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{state.examData.title}</h1>
                <p className="text-sm text-gray-600">{state.examData.course.name}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  isTimeRunningOut ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-medium">{formatTime(state.timeRemaining)}</span>
                </div>
                {isTimeRunningOut && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Sắp hết giờ!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Question Panel */}
            <div className="flex-1">
              <Card className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-medium text-gray-900">
                      Câu {state.currentQuestion + 1} / {totalQuestions}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {currentQuestion.points} điểm
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((state.currentQuestion + 1) / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {currentQuestion.question}
                  </h3>
                  {renderQuestion(currentQuestion, state.currentQuestion)}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => dispatch({ type: 'SET_CURRENT_QUESTION', payload: Math.max(0, state.currentQuestion - 1) })}
                    disabled={state.currentQuestion === 0}
                  >
                    Câu trước
                  </Button>

                  {state.currentQuestion === totalQuestions - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={state.isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {state.isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => dispatch({ type: 'SET_CURRENT_QUESTION', payload: Math.min(totalQuestions - 1, state.currentQuestion + 1) })}
                    >
                      Câu tiếp
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Navigation Panel */}
            <div className="w-80">
              <Card className="p-4 sticky top-24">
                <h3 className="font-medium text-gray-900 mb-4">Điều hướng</h3>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    Đã trả lời: {answeredCount}/{totalQuestions}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-4">
                  {state.examData.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => dispatch({ type: 'SET_CURRENT_QUESTION', payload: index })}
                      className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
                        index === state.currentQuestion
                          ? 'bg-blue-600 text-white'
                          : state.answers[index] !== undefined
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span>Câu hiện tại</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                    <span>Đã trả lời</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                    <span>Chưa trả lời</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={state.isSubmitting}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                >
                  {state.isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
