'use client'

import { useState, useEffect } from 'react'
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

export default function CreateExamPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  
  const [examData, setExamData] = useState({
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
  })
  
  // Initialize with a callback function to ensure proper state initialization
  const [questions, setQuestions] = useState<Question[]>(() => {
    const initialQuestions = [{
      question: '',
      type: 'multiple-choice' as const,
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1
    }];
    console.log('Initializing questions with:', initialQuestions);
    return initialQuestions;
  })

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoadingCourses(true)
      const data = await courseService.getMyCourses()
      setCourses(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Error loading courses:', err)
      setError('Không thể tải danh sách khóa học: ' + err.message)
      setCourses([]) // Ensure courses is always an array
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleExamDataChange = (field: string, value: any) => {
    // Handle numeric fields properly
    if (field === 'duration' || field === 'passingScore') {
      const numValue = parseInt(value);
      setExamData(prev => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }))
    } else {
      setExamData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleQuestionChange = (index: number, field: string, value: any) => {
    console.log('handleQuestionChange called:', { index, field, value })
    
    setQuestions(prevQuestions => {
      if (!prevQuestions || !Array.isArray(prevQuestions)) {
        console.error('Questions is not a valid array:', prevQuestions)
        return prevQuestions;
      }
      
      const updatedQuestions = [...prevQuestions]
      
      if (field === 'type') {
        // Reset question when type changes
        updatedQuestions[index] = {
          question: updatedQuestions[index].question,
          type: value,
          options: value === 'multiple-choice' ? ['', '', '', ''] : [],
          correctAnswer: value === 'multiple-choice' ? 0 : value === 'true-false' ? 'true' : '',
          points: updatedQuestions[index].points
        }
      } else if (field === 'points') {
        const numValue = parseInt(value);
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: isNaN(numValue) ? 1 : numValue }
      } else if (field === 'correctAnswer') {
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
      } else {
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
      }
      
      return updatedQuestions;
    })
  }

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions(prevQuestions => {
      if (!prevQuestions || !Array.isArray(prevQuestions)) return prevQuestions;
      
      const updatedQuestions = [...prevQuestions]
      if (!updatedQuestions[questionIndex].options) {
        updatedQuestions[questionIndex].options = []
      }
      updatedQuestions[questionIndex].options[optionIndex] = value
      return updatedQuestions;
    })
  }

  const addQuestion = () => {
    setQuestions(prevQuestions => {
      console.log('addQuestion called, current questions:', prevQuestions)
      if (!prevQuestions || !Array.isArray(prevQuestions)) {
        console.error('Cannot add question - questions is not a valid array:', prevQuestions)
        return prevQuestions;
      }
      
      return [...prevQuestions, {
        question: '',
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 1
      }];
    })
  }

  const removeQuestion = (index: number) => {
    setQuestions(prevQuestions => {
      console.log('removeQuestion called:', { index, questionsLength: prevQuestions?.length })
      if (!prevQuestions || !Array.isArray(prevQuestions) || prevQuestions.length <= 1) {
        console.error('Cannot remove question:', { questions: prevQuestions, length: prevQuestions?.length })
        return prevQuestions;
      }
      
      return prevQuestions.filter((_, i) => i !== index);
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate course selection
      if (!examData.course) {
        throw new Error('Vui lòng chọn khóa học')
      }

      // Validate questions
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new Error('Phải có ít nhất một câu hỏi')
      }
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        if (!q.question.trim()) {
          throw new Error(`Câu hỏi ${i + 1} không được để trống`)
        }
        if (q.type === 'multiple-choice' && q.options && q.options.some(opt => !opt.trim())) {
          throw new Error(`Tất cả lựa chọn của câu hỏi ${i + 1} phải được điền`)
        }
      }

      await examService.createExam({
        ...examData,
        questions
      })

      router.push('/teacher/exams')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Early return if questions is not properly initialized
  if (!questions || !Array.isArray(questions)) {
    console.error('Questions state is invalid:', questions)
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Đang khởi tạo...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('Rendering with questions:', questions.length, 'items')

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

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
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
                  value={examData.title}
                  onChange={(e) => handleExamDataChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề bài thi"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khóa học *
                </label>
                {loadingCourses ? (
                  <div className="text-sm text-gray-500">Đang tải khóa học...</div>
                ) : (
                  <select
                    value={examData.course}
                    onChange={(e) => handleExamDataChange('course', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn khóa học</option>
                    {courses.map((course) => (
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
                  value={examData.description}
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
                  value={examData.duration.toString()}
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
                  value={examData.passingScore.toString()}
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
                  value={examData.startTime}
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
                  value={examData.endTime}
                  onChange={(e) => handleExamDataChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={examData.isActive}
                  onChange={(e) => handleExamDataChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                Kích hoạt bài thi
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={examData.allowRetake}
                  onChange={(e) => handleExamDataChange('allowRetake', e.target.checked)}
                  className="mr-2"
                />
                Cho phép làm lại
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={examData.showResults}
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
              <h2 className="text-xl font-semibold">Câu hỏi ({questions?.length || 0})</h2>
              <Button type="button" onClick={addQuestion} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Thêm câu hỏi
              </Button>
            </div>

            <div className="space-y-6">
              {questions && Array.isArray(questions) && questions.map((question, questionIndex) => (
                <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Câu hỏi {questionIndex + 1}</h3>
                    {questions.length > 1 && (
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo bài thi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
