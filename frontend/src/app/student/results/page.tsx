'use client'

import Navigation from '@/components/Navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { 
  TrendingUp, 
  TrendingDown,
  Medal,
  Clock,
  Calendar,
  Eye,
  Download
} from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'

// Mock data
const mockResults = [
  {
    id: '1',
    examTitle: 'Kiểm tra giữa kỳ - Lập trình Web',
    course: 'CS101',
    score: 85,
    totalPoints: 100,
    timeSpent: 75, // minutes
    submittedAt: '2025-08-01T10:30:00Z',
    rank: 5,
    totalStudents: 48,
    status: 'graded'
  },
  {
    id: '2',
    examTitle: 'Quiz - JavaScript Cơ bản',
    course: 'CS101',
    score: 45,
    totalPoints: 50,
    timeSpent: 25,
    submittedAt: '2025-07-28T14:15:00Z',
    rank: 12,
    totalStudents: 48,
    status: 'graded'
  },
  {
    id: '3',
    examTitle: 'Bài tập - HTML/CSS',
    course: 'CS101',
    score: 38,
    totalPoints: 40,
    timeSpent: 45,
    submittedAt: '2025-07-25T16:45:00Z',
    rank: 8,
    totalStudents: 45,
    status: 'graded'
  },
  {
    id: '4',
    examTitle: 'Thực hành SQL',
    course: 'CS201',
    score: 0,
    totalPoints: 75,
    timeSpent: 60,
    submittedAt: '2025-08-02T11:20:00Z',
    rank: 0,
    totalStudents: 40,
    status: 'pending'
  }
]

const stats = {
  totalExams: 12,
  averageScore: 82.5,
  bestScore: 95,
  totalTimeSpent: 420 // minutes
}

export default function StudentResultsPage() {
  const userInfo = {
    userRole: 'student' as const,
    userName: 'Nguyễn Văn An',
    userEmail: 'student@university.edu.vn'
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'bg-green-50 border-green-200'
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getRankIcon = (rank: number, total: number) => {
    if (rank <= 3) return <Medal className="text-yellow-500" size={16} />
    if (rank <= total * 0.2) return <TrendingUp className="text-green-500" size={16} />
    return <TrendingDown className="text-gray-500" size={16} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation {...userInfo} />
      
      <main className="md:ml-64 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Kết quả học tập
          </h1>
          <p className="text-gray-600">
            Xem chi tiết điểm số và thành tích của bạn
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng bài kiểm tra</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Medal size={24} className="text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Điểm trung bình</p>
                <p className="text-2xl font-bold text-green-600">{stats.averageScore}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Điểm cao nhất</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.bestScore}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Medal size={24} className="text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng thời gian</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalTimeSpent)}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Clock size={24} className="text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Results List */}
        <Card title="Lịch sử bài kiểm tra">
          <div className="space-y-4">
            {mockResults.map((result) => (
              <div key={result.id} className={`p-4 border rounded-lg ${getScoreBgColor(result.score, result.totalPoints)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{result.examTitle}</h3>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {result.course}
                      </span>
                      {result.status === 'pending' && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          Chờ chấm điểm
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(result.submittedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{formatDuration(result.timeSpent)}</span>
                      </div>
                      {result.status === 'graded' && result.rank > 0 && (
                        <div className="flex items-center space-x-1">
                          {getRankIcon(result.rank, result.totalStudents)}
                          <span>Hạng {result.rank}/{result.totalStudents}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {result.status === 'graded' ? (
                      <div className="text-right">
                        <p className={`text-xl font-bold ${getScoreColor(result.score, result.totalPoints)}`}>
                          {result.score}/{result.totalPoints}
                        </p>
                        <p className="text-sm text-gray-600">
                          {Math.round((result.score / result.totalPoints) * 100)}%
                        </p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-400">--/--</p>
                        <p className="text-sm text-gray-500">Chờ chấm</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye size={14} className="mr-1" />
                        Xem chi tiết
                      </Button>
                      {result.status === 'graded' && (
                        <Button size="sm" variant="outline">
                          <Download size={14} className="mr-1" />
                          Tải xuống
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {mockResults.length === 0 && (
              <div className="text-center py-12">
                <Medal size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có kết quả nào
                </h3>
                <p className="text-gray-600">
                  Hoàn thành bài kiểm tra đầu tiên để xem kết quả
                </p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
