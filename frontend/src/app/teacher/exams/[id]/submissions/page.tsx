'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { Clock, User, Trophy, Calendar, Eye, Download } from 'lucide-react'
import { submissionService, type Submission } from '@/services/submissionService'
import Link from 'next/link'

export default function ExamSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exam, setExam] = useState<any>(null)
  const [examId, setExamId] = useState<string>('')

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setExamId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (user?.role !== 'teacher' && user?.role !== 'admin') {
      return
    }
    
    if (examId) {
      loadSubmissions()
    }
  }, [user, examId])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      // Get exam info first
      const examResponse = await fetch(`http://localhost:5000/api/exams/${examId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const examData = await examResponse.json()
      setExam(examData.data.exam)

      // Get submissions
      const data = await submissionService.getExamSubmissions(examId)
      setSubmissions(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800'
      case 'late':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Đã nộp'
      case 'late':
        return 'Nộp trễ'
      case 'in_progress':
        return 'Đang làm'
      default:
        return status
    }
  }

  const exportToCSV = () => {
    const headers = ['STT', 'Sinh viên', 'Mã SV', 'Điểm', 'Phần trăm', 'Thời gian làm bài', 'Thời gian nộp', 'Trạng thái']
    const csvData = [
      headers,
      ...submissions.map((submission, index) => [
        index + 1,
        `${submission.student.firstName} ${submission.student.lastName}`,
        submission.student.studentId || 'N/A',
        `${submission.score}/${submission.totalPoints || exam?.totalPoints || 0}`,
        `${submission.percentage || 0}%`,
        formatDuration(submission.timeSpent || 0),
        submission.submittedAt ? formatDateTime(submission.submittedAt) : 'Chưa nộp',
        getStatusText(submission.status || 'unknown')
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `submissions_${exam?.title || 'exam'}_${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bài nộp bài thi</h1>
              {exam && (
                <p className="mt-2 text-gray-600">
                  {exam.title} - {exam.course?.name} ({exam.course?.code})
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Xuất CSV</span>
              </Button>
              <Link href={`/teacher/exams/${examId}`}>
                <Button variant="outline">Quay lại bài thi</Button>
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Summary Stats */}
        {exam && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <User className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng số bài nộp</p>
                  <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Điểm trung bình</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {submissions.length > 0 
                      ? (submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / submissions.length).toFixed(1)
                      : 0
                    }%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Thời gian TB</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {submissions.length > 0 
                      ? formatDuration(Math.round(submissions.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / submissions.length))
                      : '0m'
                    }
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Nộp trễ</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {submissions.filter(s => s.isLate).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {submissions.length === 0 ? (
          <Card className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài nộp nào</h3>
            <p className="text-gray-600">Hiện tại chưa có sinh viên nào nộp bài thi này</p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sinh viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm số
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian làm bài
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian nộp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.student.firstName} {submission.student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.student.studentId || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">{submission.score}</span>
                          <span className="text-gray-500">/{submission.totalPoints || exam?.totalPoints || 0}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {submission.percentage || 0}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {formatDuration(submission.timeSpent || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.submittedAt ? (
                          <div>
                            <div>{formatDateTime(submission.submittedAt).split(' ')[0]}</div>
                            <div className="text-gray-500">{formatDateTime(submission.submittedAt).split(' ')[1]}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Chưa nộp</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status || 'unknown')}`}>
                          {getStatusText(submission.status || 'unknown')}
                        </span>
                        {submission.isLate && (
                          <div className="text-xs text-red-600 mt-1">Trễ hạn</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/teacher/submissions/${submission._id}`}>
                          <Button variant="outline" size="sm" className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>Xem chi tiết</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
