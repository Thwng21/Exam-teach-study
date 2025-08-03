'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { 
  Users, 
  FileText, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface DashboardStats {
  totalCourses: number
  totalExams: number  
  totalStudents: number
  pendingGrading: number
}

interface RecentExam {
  id: string
  title: string
  course: string
  submissions: number
  totalStudents: number
  dueDate: string
  status: 'active' | 'completed'
}

export default function TeacherDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalExams: 0,
    totalStudents: 0,
    pendingGrading: 0
  })
  const [recentExams, setRecentExams] = useState<RecentExam[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'teacher') {
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
        totalCourses: 12,
        totalExams: 48,
        totalStudents: 342,
        pendingGrading: 15
      }

      const mockRecentExams: RecentExam[] = [
        {
          id: '1',
          title: 'Kiểm tra giữa kỳ - Lập trình Web',
          course: 'CS101',
          submissions: 45,
          totalStudents: 50,
          dueDate: '2025-08-05T10:00:00Z',
          status: 'active'
        },
        {
          id: '2',
          title: 'Bài tập lớn - Cơ sở dữ liệu',
          course: 'CS201',
          submissions: 32,
          totalStudents: 40,
          dueDate: '2025-08-07T23:59:00Z',
          status: 'active'
        },
        {
          id: '3',
          title: 'Quiz - JavaScript Cơ bản',
          course: 'CS101',
          submissions: 28,
          totalStudents: 30,
          dueDate: '2025-08-03T15:30:00Z',
          status: 'completed'
        }
      ]

      setStats(mockStats)
      setRecentExams(mockRecentExams)
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
      title: 'Tổng khóa học',
      value: stats.totalCourses.toString(),
      icon: Users,
      change: '+2 tuần này',
      changeType: 'positive' as const
    },
    {
      title: 'Bài kiểm tra',
      value: stats.totalExams.toString(),
      icon: FileText,
      change: '+8 tuần này',
      changeType: 'positive' as const
    },
    {
      title: 'Sinh viên hoạt động',
      value: stats.totalStudents.toString(),
      icon: TrendingUp,
      change: '+12 tuần này',
      changeType: 'positive' as const
    },
    {
      title: 'Bài nộp chờ chấm',
      value: stats.pendingGrading.toString(),
      icon: Clock,
      change: '-3 hôm nay',
      changeType: 'negative' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="md:ml-64 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Chào mừng, {user?.firstName} {user?.lastName}!
          </h1>
          <p className="text-gray-600">
            Theo dõi hoạt động giảng dạy và quản lý bài kiểm tra của bạn
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
                      stat.changeType === 'negative' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.changeType === 'positive' ? 'bg-green-100' :
                    stat.changeType === 'negative' ? 'bg-red-100' :
                    'bg-yellow-100'
                  }`}>
                    <Icon size={24} className={
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'negative' ? 'text-red-600' :
                      'text-yellow-600'
                    } />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Exams */}
          <Card title="Bài kiểm tra gần đây">
            <div className="space-y-4">
              {recentExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{exam.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{exam.course}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{exam.submissions}/{exam.totalStudents} đã nộp</span>
                      <span>Hạn: {formatDate(exam.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      exam.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {exam.status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/teacher/exams')}
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
                onClick={() => router.push('/teacher/exams/create')}
              >
                <Plus size={16} className="mr-2" />
                Tạo bài kiểm tra mới
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/teacher/courses/create')}
              >
                <Plus size={16} className="mr-2" />
                Tạo khóa học mới
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/teacher/students')}
              >
                <Users size={16} className="mr-2" />
                Quản lý sinh viên
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/teacher/grades')}
              >
                <Edit size={16} className="mr-2" />
                Chấm điểm bài thi
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
