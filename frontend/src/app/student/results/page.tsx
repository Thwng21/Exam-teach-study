'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { submissionService } from '@/services/submissionService'
import type { Submission } from '@/services/submissionService'
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

export default function StudentResultsPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadSubmissions()
    }
  }, [user])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const data = await submissionService.getSubmissions()
      console.log('Loaded submissions:', data)
      setSubmissions(data)
    } catch (err) {
      console.error('Error loading submissions:', err)
      setError('Không thể tải danh sách kết quả')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics from real submissions
  const stats = {
    totalExams: submissions.length,
    averageScore: submissions.length > 0 
      ? Math.round(submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length)
      : 0,
    bestScore: submissions.length > 0 
      ? Math.max(...submissions.map(sub => sub.score))
      : 0,
    totalTime: submissions.reduce((sum, sub) => sum + (sub.timeSpent || 0), 0)
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
    <AppLayout>
      <main className="p-6">
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
                <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalTime)}</p>
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
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải kết quả...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadSubmissions}>Thử lại</Button>
              </div>
            ) : submissions.map((submission) => (
              <div key={submission._id} className={`p-4 border rounded-lg ${getScoreBgColor(submission.score, submission.exam?.maxScore || 100)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{submission.exam?.title || 'Bài thi'}</h3>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {submission.exam?.course?.code || 'N/A'}
                      </span>
                      {submission.status !== 'completed' && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          Chờ chấm điểm
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{submission.submittedAt ? formatDate(submission.submittedAt) : 'Chưa nộp'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{formatDuration(submission.timeSpent || 0)}</span>
                      </div>
                      {submission.status === 'completed' && submission.percentage && (
                        <div className="flex items-center space-x-1">
                          {getRankIcon(1, 10)}
                          <span>Điểm {submission.percentage}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {submission.status === 'completed' ? (
                      <div className="text-right">
                        <p className={`text-xl font-bold ${getScoreColor(submission.score, submission.exam?.maxScore || 100)}`}>
                          {submission.score}/{submission.exam?.maxScore || 100}
                        </p>
                        <p className="text-sm text-gray-600">
                          {submission.percentage || Math.round((submission.score / (submission.exam?.maxScore || 100)) * 100)}%
                        </p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-400">--/--</p>
                        <p className="text-sm text-gray-500">Chờ chấm</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Link href={`/student/results/${submission._id}`}>
                        <Button size="sm" variant="outline">
                          <Eye size={14} className="mr-1" />
                          Xem chi tiết
                        </Button>
                      </Link>
                      {submission.status === 'completed' && (
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

            {!loading && !error && submissions.length === 0 && (
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
    </AppLayout>
  )
}
