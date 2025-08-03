'use client'

import { useReducer, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import { examService } from '@/services/examService'
import { courseService, type Course } from '@/services/courseService'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Question {
  question: string
  type: 'multiple-choice' | 'true-false' | 'essay' | 'fill-blank'
  options: string[]
  correctAnswer: number | string
  points: number
}

interface State {
  loading: boolean
  error: string
  courses: Course[]
  loadingCourses: boolean
  examData: {
    title: string
    description: string
    course: string
    duration: number
    passingScore: number
    startTime: string
    endTime: string
    isActive: boolean
    allowRetake: boolean
    showResults: boolean
  }
  questions: Question[]
}

type Action = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_LOADING_COURSES'; payload: boolean }
  | { type: 'SET_EXAM_DATA'; payload: { field: string; value: any } }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'UPDATE_QUESTION'; payload: { index: number; field: string; value: any } }
  | { type: 'UPDATE_OPTION'; payload: { questionIndex: number; optionIndex: number; value: string } }
  | { type: 'ADD_QUESTION' }
  | { type: 'REMOVE_QUESTION'; payload: number }

const initialState: State = {
  loading: false,
  error: '',
  courses: [],
  loadingCourses: true,
  examData: {
    title: '',
    description: '',
    course: '',
    duration: 60,
    passingScore: 5,
    startTime: '',
    endTime: '',
    isActive: true,
    allowRetake: false,
    showResults: true
  },
  questions: [
    {
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1
    }
  ]
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_COURSES':
      return { ...state, courses: Array.isArray(action.payload) ? action.payload : [] }
    
    case 'SET_LOADING_COURSES':
      return { ...state, loadingCourses: action.payload }
    
    case 'SET_EXAM_DATA':
      const { field, value } = action.payload
      let processedValue = value
      if (field === 'duration' || field === 'passingScore') {
        const numValue = parseInt(value)
        processedValue = isNaN(numValue) ? 0 : numValue
      }
      return {
        ...state,
        examData: { ...state.examData, [field]: processedValue }
      }
    
    case 'SET_QUESTIONS':
      return { ...state, questions: Array.isArray(action.payload) ? action.payload : [initialState.questions[0]] }
    
    case 'UPDATE_QUESTION':
      const { index, field: qField, value: qValue } = action.payload
      if (!Array.isArray(state.questions) || index < 0 || index >= state.questions.length) {
        return state
      }
      
      const updatedQuestions = [...state.questions]
      
      if (qField === 'type') {
        updatedQuestions[index] = {
          question: updatedQuestions[index].question,
          type: qValue,
          options: qValue === 'multiple-choice' ? ['', '', '', ''] : [],
          correctAnswer: qValue === 'multiple-choice' ? 0 : qValue === 'true-false' ? 'true' : '',
          points: updatedQuestions[index].points
        }
      } else if (qField === 'points') {
        const numValue = parseInt(qValue)
        updatedQuestions[index] = { ...updatedQuestions[index], [qField]: isNaN(numValue) ? 1 : numValue }
      } else {
        updatedQuestions[index] = { ...updatedQuestions[index], [qField]: qValue }
      }
      
      return { ...state, questions: updatedQuestions }
    
    case 'UPDATE_OPTION':
      const { questionIndex, optionIndex, value: optValue } = action.payload
      if (!Array.isArray(state.questions) || questionIndex < 0 || questionIndex >= state.questions.length) {
        return state
      }
      
      const questionsWithUpdatedOption = [...state.questions]
      if (!Array.isArray(questionsWithUpdatedOption[questionIndex].options)) {
        questionsWithUpdatedOption[questionIndex].options = []
      }
      questionsWithUpdatedOption[questionIndex].options[optionIndex] = optValue
      
      return { ...state, questions: questionsWithUpdatedOption }
    
    case 'ADD_QUESTION':
      if (!Array.isArray(state.questions)) {
        return { ...state, questions: [initialState.questions[0]] }
      }
      
      return {
        ...state,
        questions: [
          ...state.questions,
          {
            question: '',
            type: 'multiple-choice',
            options: ['', '', '', ''],
            correctAnswer: 0,
            points: 1
          }
        ]
      }
    
    case 'REMOVE_QUESTION':
      if (!Array.isArray(state.questions) || state.questions.length <= 1) {
        return state
      }
      
      return {
        ...state,
        questions: state.questions.filter((_, i) => i !== action.payload)
      }
    
    default:
      return state
  }
}

export default function CreateExamPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      dispatch({ type: 'SET_LOADING_COURSES', payload: true })
      const data = await courseService.getMyCourses()
      dispatch({ type: 'SET_COURSES', payload: data })
    } catch (err: any) {
      console.error('Error loading courses:', err)
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải danh sách khóa học: ' + err.message })
      dispatch({ type: 'SET_COURSES', payload: [] })
    } finally {
      dispatch({ type: 'SET_LOADING_COURSES', payload: false })
    }
  }

  const handleExamDataChange = (field: string, value: any) => {
    dispatch({ type: 'SET_EXAM_DATA', payload: { field, value } })
  }

  const handleQuestionChange = (index: number, field: string, value: any) => {
    dispatch({ type: 'UPDATE_QUESTION', payload: { index, field, value } })
  }

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    dispatch({ type: 'UPDATE_OPTION', payload: { questionIndex, optionIndex, value } })
  }

  const addQuestion = () => {
    dispatch({ type: 'ADD_QUESTION' })
  }

  const removeQuestion = (index: number) => {
    dispatch({ type: 'REMOVE_QUESTION', payload: index })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: '' })

    try {
      // Validate course selection
      if (!state.examData.course) {
        throw new Error('Vui lòng chọn khóa học')
      }

      // Validate questions
      if (!Array.isArray(state.questions) || state.questions.length === 0) {
        throw new Error('Phải có ít nhất một câu hỏi')
      }
      
      for (let i = 0; i < state.questions.length; i++) {
        const q = state.questions[i]
        if (!q.question.trim()) {
          throw new Error(`Câu hỏi ${i + 1} không được để trống`)
        }
        if (q.type === 'multiple-choice' && Array.isArray(q.options) && q.options.some(opt => !opt.trim())) {
          throw new Error(`Tất cả lựa chọn của câu hỏi ${i + 1} phải được điền`)
        }
      }

      await examService.createExam({
        ...state.examData,
        questions: state.questions
      })

      router.push('/teacher/exams')
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Safety check
  const safeQuestions = Array.isArray(state.questions) ? state.questions : []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/teacher/exams" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách bài thi
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Tạo bài thi mới</h1>
          <p className="mt-2 text-gray-600">Điền thông tin và câu hỏi cho bài thi</p>
        </div>

        {state.error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {state.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Thông tin cơ bản */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề bài thi *
                </label>
                <Input
                  value={state.examData.title}
                  onChange={(e) => handleExamDataChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề bài thi"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khóa học *
                </label>
                {state.loadingCourses ? (
                  <div className="text-sm text-gray-500">Đang tải khóa học...</div>
                ) : (
                  <select
                    value={state.examData.course}
                    onChange={(e) => handleExamDataChange('course', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn khóa học</option>
                    {state.courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={state.examData.description}
                  onChange={(e) => handleExamDataChange('description', e.target.value)}
                  placeholder="Mô tả về bài thi"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian làm bài (phút) *
                </label>
                <Input
                  type="number"
                  value={state.examData.duration.toString()}
                  onChange={(e) => handleExamDataChange('duration', e.target.value)}
                  min="1"
                  max="480"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm đạt (tối thiểu)
                </label>
                <Input
                  type="number"
                  value={state.examData.passingScore.toString()}
                  onChange={(e) => handleExamDataChange('passingScore', e.target.value)}
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian bắt đầu *
                </label>
                <Input
                  type="datetime-local"
                  value={state.examData.startTime}
                  onChange={(e) => handleExamDataChange('startTime', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian kết thúc *
                </label>
                <Input
                  type="datetime-local"
                  value={state.examData.endTime}
                  onChange={(e) => handleExamDataChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={state.examData.isActive}
                  onChange={(e) => handleExamDataChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                Kích hoạt bài thi
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={state.examData.allowRetake}
                  onChange={(e) => handleExamDataChange('allowRetake', e.target.checked)}
                  className="mr-2"
                />
                Cho phép làm lại
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={state.examData.showResults}
                  onChange={(e) => handleExamDataChange('showResults', e.target.checked)}
                  className="mr-2"
                />
                Hiển thị kết quả sau khi nộp
              </label>
            </div>
          </Card>

          {/* Câu hỏi */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Câu hỏi ({safeQuestions.length})</h2>
              <Button type="button" onClick={addQuestion} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Thêm câu hỏi
              </Button>
            </div>

            <div className="space-y-6">
              {safeQuestions.map((question, questionIndex) => (
                <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Câu hỏi {questionIndex + 1}</h3>
                    {safeQuestions.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loại câu hỏi *
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => handleQuestionChange(questionIndex, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Vui lòng chọn loại câu hỏi</option>
                          <option value="multiple-choice">Trắc nghiệm</option>
                          <option value="true-false">Đúng/Sai</option>
                          <option value="essay">Tự luận</option>
                          <option value="fill-blank">Điền vào chỗ trống</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Điểm số *
                        </label>
                        <Input
                          type="number"
                          value={question.points.toString()}
                          onChange={(e) => handleQuestionChange(questionIndex, 'points', e.target.value)}
                          min="1"
                          max="10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nội dung câu hỏi *
                      </label>
                      <textarea
                        value={question.question}
                        onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                        placeholder="Nhập nội dung câu hỏi"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Render different UI based on question type */}
                    {question.type === 'multiple-choice' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Các lựa chọn *
                        </label>
                        <div className="grid gap-2 md:grid-cols-2">
                          {(question.options || []).map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${questionIndex}`}
                                checked={question.correctAnswer === optionIndex}
                                onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', optionIndex)}
                                className="text-blue-600"
                              />
                              <Input
                                value={option || ''}
                                onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                placeholder={`Lựa chọn ${optionIndex + 1}`}
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.type === 'true-false' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đáp án đúng *
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={question.correctAnswer === 'true'}
                              onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', 'true')}
                              className="mr-2 text-blue-600"
                            />
                            Đúng
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={question.correctAnswer === 'false'}
                              onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', 'false')}
                              className="mr-2 text-blue-600"
                            />
                            Sai
                          </label>
                        </div>
                      </div>
                    )}

                    {question.type === 'essay' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gợi ý đáp án (tùy chọn)
                        </label>
                        <textarea
                          value={question.correctAnswer as string || ''}
                          onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                          placeholder="Nhập gợi ý hoặc đáp án mẫu cho câu tự luận"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {question.type === 'fill-blank' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đáp án đúng *
                        </label>
                        <Input
                          value={question.correctAnswer as string || ''}
                          onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                          placeholder="Nhập đáp án cho chỗ trống"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Sử dụng dấu _____ trong câu hỏi để đánh dấu chỗ trống
                        </p>
                      </div>
                    )}

                    {!question.type && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-800 text-sm">
                          Vui lòng chọn loại câu hỏi để tiếp tục
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Submit buttons */}
          <div className="flex gap-4 justify-end">
            <Link href="/teacher/exams">
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </Link>
            <Button type="submit" disabled={state.loading}>
              {state.loading ? 'Đang tạo...' : 'Tạo bài thi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
