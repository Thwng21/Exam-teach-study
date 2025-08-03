'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiService } from '@/lib/api'
import Navigation from '@/components/Navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
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
}

interface UpcomingExam {
  id: string
  title: string
  course: string
  startTime: string
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
    averageScore: 0
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
      
      // Mock data since backend might not be fully connected
      const mockStats = {
        totalCourses: 6,
        totalExams: 24,
        completedExams: 18,
        averageScore: 85.5
      }

      const mockUpcomingExams: UpcomingExam[] = [
        {
          id: '1',
          title: 'Kiểm tra giữa kỳ - Lập trình Web',
          course: 'CS101 - Lập trình Web',
          startTime: '2025-08-05T10:00:00Z',
          duration: 90,
          status: 'upcoming'
        },
        {
          id: '2',
          title: 'Quiz - JavaScript Cơ bản',
          course: 'CS101 - Lập trình Web',
          startTime: '2025-08-04T14:00:00Z',
          duration: 30,
          status: 'active'
        },
        {
          id: '3',
          title: 'Bài tập lớn - Cơ sở dữ liệu',
          course: 'CS201 - Cơ sở dữ liệu',
          startTime: '2025-08-07T09:00:00Z',
          duration: 120,
          status: 'upcoming'
        }
      ]

      setStats(mockStats)
      setUpcomingExams(mockUpcomingExams)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
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
      value: stats.averageScore.toString(),
      icon: TrendingUp,
      change: 'Tốt hơn 15% so với kỳ trước',
      changeType: 'positive' as const
    },
    {
      title: 'Bài chưa làm',
      value: (stats.totalExams - stats.completedExams).toString(),
      icon: Clock,
      change: 'Cần hoàn thành',
      changeType: 'warning' as const
    }
  ]

  const getExamStatus = (exam: UpcomingExam) => {
    const now = new Date()
    const startTime = new Date(exam.startTime)
    const endTime = new Date(startTime.getTime() + exam.duration * 60000)

    if (now < startTime) {
      return { status: 'upcoming', text: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-700' }
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', text: 'Đang diễn ra', color: 'bg-green-100 text-green-700' }
    } else {
      return { status: 'completed', text: 'Đã kết thúc', color: 'bg-gray-100 text-gray-700' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="md:ml-64 p-6">
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
              {upcomingExams.map((exam) => {
                const examStatus = getExamStatus(exam)
                return (
                  <div key={exam.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{exam.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{exam.course}</p>
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
                          onClick={() => router.push(`/student/exam/${exam.id}`)}
                        >
                          <Play size={14} className="mr-1" />
                          Vào thi
                        </Button>
                      )}
                      {examStatus.status === 'upcoming' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/student/exam/${exam.id}`)}
                        >
                          <Eye size={14} className="mr-1" />
                          Xem
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
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
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Bài kiểm tra mới</p>
                    <p className="text-xs text-blue-700">Quiz JavaScript đã được tạo</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle size={16} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Điểm đã cập nhật</p>
                    <p className="text-xs text-green-700">Bài thi HTML/CSS: 92 điểm</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
