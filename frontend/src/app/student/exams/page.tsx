'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { examService, type Exam } from '@/services/examService'
import { Clock, Users, BookOpen, Calendar, Play } from 'lucide-react'
import Link from 'next/link'

export default function StudentExamsPage() {
  const { user } = useAuth()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadExams()
  }, [])

  const loadExams = async () => {
    try {
      setLoading(true)
      const data = await examService.getExams()
      setExams(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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

    if (!exam.isActive) return { text: 'Không hoạt động', color: 'gray' }
    if (now < startTime) return { text: 'Chưa bắt đầu', color: 'yellow' }
    if (now > endTime) return { text: 'Đã kết thúc', color: 'red' }
    return { text: 'Đang diễn ra', color: 'green' }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bài thi khả dụng</h1>
          <p className="mt-2 text-gray-600">Danh sách các bài thi bạn có thể tham gia</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {exams.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có bài thi nào</h3>
            <p className="text-gray-600">Hiện tại chưa có bài thi nào khả dụng</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => {
              const status = getExamStatus(exam)
              const canTakeExam = isExamAvailable(exam)
              
              return (
                <Card key={exam._id} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {exam.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status.color === 'green' 
                          ? 'bg-green-100 text-green-800'
                          : status.color === 'yellow'
                          ? 'bg-yellow-100 text-yellow-800'
                          : status.color === 'red'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {status.text}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {exam.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {exam.course.name} ({exam.course.code})
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {exam.duration} phút
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {exam.questions.length} câu hỏi
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(exam.startTime).toLocaleDateString('vi-VN')} - {new Date(exam.endTime).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/student/exams/${exam._id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                        >
                          Xem chi tiết
                        </Button>
                      </Link>
                      {canTakeExam && (
                        <Link href={`/student/exams/${exam._id}/take`} className="flex-1">
                          <Button size="sm" className="w-full flex items-center justify-center gap-1">
                            <Play className="w-4 h-4" />
                            Làm bài
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
