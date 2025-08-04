'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { submissionService } from '@/services/submissionService'
import { examService } from '@/services/examService'
import { courseService } from '@/services/courseService'
import type { Submission } from '@/services/submissionService'
import type { Exam } from '@/services/examService'
import type { Course } from '@/services/courseService'
import { 
  BookOpen, 
  FileText, 
  Clock, 
  TrendingUp,
  Eye,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface StudentStats {
  totalCourses: number
  totalExams: number
  completedExams: number
  averageScore: number
  pendingExams: number
}

interface UpcomingExam {
  _id: string
  title: string
  course: {
    name: string
    code: string
  }
  startTime: string
  endTime: string
  duration: number
  status: 'upcoming' | 'active' | 'completed'
}

export default function StudentDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<StudentStats>({
    totalCourses: 0,
    totalExams: 0,
    completedExams: 0,
    averageScore: 0,
    pendingExams: 0
  })
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'student') {
        router.push('/auth/login')
        return
      }
      
      fetchDashboardData()
    }
  }, [user, loading, router])

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true)
      
      // Fetch real data from APIs
      const [courses, exams, submissions] = await Promise.all([
        courseService.getCourses(),
        examService.getExams(),
        submissionService.getSubmissions()
      ])

      // Calculate real statistics
      const completedExamIds = submissions.map(s => s.exam._id)
      const completedCount = completedExamIds.length
      const totalExamsCount = exams.length
      const pendingCount = totalExamsCount - completedCount
      
      // Calculate average score from submissions
      const avgScore = submissions.length > 0 
        ? submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length 
        : 0

      const realStats: StudentStats = {
        totalCourses: courses.length,
        totalExams: totalExamsCount,
        completedExams: completedCount,
        pendingExams: pendingCount,
        averageScore: Math.round(avgScore * 10) / 10
      }

      // Filter upcoming exams (not completed and within time range)
      const now = new Date()
      const upcomingExamsList: UpcomingExam[] = exams
        .filter(exam => {
          const startTime = new Date(exam.startTime)
          const endTime = new Date(exam.endTime)
          const isNotCompleted = !completedExamIds.includes(exam._id)
          const isRelevant = endTime > now || (startTime <= now && endTime >= now)
          return isNotCompleted && isRelevant
        })
        .map(exam => {
          const startTime = new Date(exam.startTime)
          const endTime = new Date(exam.endTime)
          
          let status: 'upcoming' | 'active' | 'completed' = 'upcoming'
          if (now >= startTime && now <= endTime) {
            status = 'active'
          } else if (now > endTime) {
            status = 'completed'
          }

          return {
            _id: exam._id,
            title: exam.title,
            course: {
              name: exam.course.name,
              code: exam.course.code
            },
            startTime: exam.startTime,
            endTime: exam.endTime,
            duration: exam.duration,
            status
          }
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 5) // Show only next 5 exams

      setStats(realStats)
      setUpcomingExams(upcomingExamsList)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      
      // Fallback to basic stats if API fails
      setStats({
        totalCourses: 0,
        totalExams: 0,
        completedExams: 0,
        averageScore: 0,
        pendingExams: 0
      })
      setUpcomingExams([])
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  const dashboardStats = [
    {
      title: 'Khóa học đã đăng ký',
      value: stats.totalCourses.toString(),
      icon: BookOpen,
      change: 'Học kỳ này',
      changeType: 'neutral' as const
    },
    {
      title: 'Bài kiểm tra',
      value: stats.totalExams.toString(),
      icon: FileText,
      change: `${stats.completedExams} đã hoàn thành`,
      changeType: 'positive' as const
    },
    {
      title: 'Điểm trung bình',
      value: stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '0',
      icon: TrendingUp,
      change: stats.completedExams > 0 ? `Từ ${stats.completedExams} bài thi` : 'Chưa có điểm',
      changeType: stats.averageScore >= 70 ? 'positive' as const : stats.averageScore > 0 ? 'warning' as const : 'neutral' as const
    },
    {
      title: 'Bài chưa làm',
      value: stats.pendingExams.toString(),
      icon: Clock,
      change: 'Cần hoàn thành',
      changeType: 'warning' as const
    }
  ]

  const getExamStatus = (exam: UpcomingExam) => {
    const now = new Date()
    const startTime = new Date(exam.startTime)
    const endTime = new Date(exam.endTime)

    if (now < startTime) {
      return { status: 'upcoming', text: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-700' }
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', text: 'Đang diễn ra', color: 'bg-green-100 text-green-700' }
    } else {
      return { status: 'completed', text: 'Đã kết thúc', color: 'bg-gray-100 text-gray-700' }
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Chào {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Theo dõi tiến độ học tập và các bài kiểm tra sắp tới
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-xs ${
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'warning' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.changeType === 'positive' ? 'bg-green-100' :
                    stat.changeType === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <Icon size={24} className={
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    } />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Exams */}
          <Card title="Bài kiểm tra sắp tới">
            <div className="space-y-4">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam) => {
                  const examStatus = getExamStatus(exam)
                  return (
                    <div key={exam._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{exam.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{exam.course.code} - {exam.course.name}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Thời gian: {exam.duration} phút</span>
                          <span>Bắt đầu: {formatDate(exam.startTime)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${examStatus.color}`}>
                          {examStatus.text}
                        </span>
                        {examStatus.status === 'active' && (
                          <Button
                            size="sm"
                            onClick={() => router.push(`/student/exams/${exam._id}/take`)}
                          >
                            <Play size={14} className="mr-1" />
                            Vào thi
                          </Button>
                        )}
                        {examStatus.status === 'upcoming' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/student/exams/${exam._id}`)}
                          >
                            <Eye size={14} className="mr-1" />
                            Xem
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Không có bài kiểm tra sắp tới</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/student/exams')}
              >
                <Eye size={16} className="mr-2" />
                Xem tất cả bài kiểm tra
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Thao tác nhanh">
            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => router.push('/student/courses')}
              >
                <BookOpen size={16} className="mr-2" />
                Xem khóa học
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/student/results')}
              >
                <TrendingUp size={16} className="mr-2" />
                Xem kết quả thi
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/student/exams')}
              >
                <FileText size={16} className="mr-2" />
                Danh sách bài kiểm tra
              </Button>
            </div>

            {/* Recent Notifications */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Thông báo gần đây</h4>
              <div className="space-y-3">
                {upcomingExams.filter(exam => exam.status === 'active').length > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <AlertCircle size={16} className="text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Bài thi đang diễn ra</p>
                      <p className="text-xs text-green-700">
                        {upcomingExams.filter(exam => exam.status === 'active')[0]?.title}
                      </p>
                    </div>
                  </div>
                )}
                
                {upcomingExams.filter(exam => exam.status === 'upcoming').length > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <AlertCircle size={16} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Bài kiểm tra sắp tới</p>
                      <p className="text-xs text-blue-700">
                        {upcomingExams.filter(exam => exam.status === 'upcoming')[0]?.title}
                      </p>
                    </div>
                  </div>
                )}

                {stats.completedExams > 0 && stats.averageScore > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Điểm trung bình hiện tại</p>
                      <p className="text-xs text-green-700">{stats.averageScore} điểm từ {stats.completedExams} bài thi</p>
                    </div>
                  </div>
                )}

                {upcomingExams.length === 0 && stats.completedExams === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Không có thông báo mới</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
