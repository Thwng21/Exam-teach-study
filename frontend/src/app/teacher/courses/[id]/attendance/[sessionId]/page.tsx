'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { 
  ArrowLeft,
  UserCheck,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Edit
} from 'lucide-react'
import { attendanceService, AttendanceSession, AttendanceRecord } from '@/services/attendanceService'

export default function AttendanceSessionPage() {
  const { id: courseId, sessionId } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const [session, setSession] = useState<AttendanceSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (sessionId) {
      loadSessionDetails()
    }
  }, [sessionId])

  const loadSessionDetails = async () => {
    try {
      setLoading(true)
      setError('')
      const sessionData = await attendanceService.getAttendanceSession(sessionId as string)
      setSession(sessionData)
    } catch (err: any) {
      console.error('Error loading attendance session:', err)
      setError('Không thể tải thông tin buổi điểm danh')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    try {
      setUpdating(true)
      await attendanceService.markAttendance(sessionId as string, {
        studentId,
        status,
        checkInTime: status === 'present' || status === 'late' ? new Date().toTimeString().substring(0, 5) : undefined
      })
      await loadSessionDetails()
    } catch (err: any) {
      console.error('Error marking attendance:', err)
      setError('Không thể cập nhật điểm danh')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'late':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'excused':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <UserCheck className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Có mặt'
      case 'late': return 'Đi muộn'
      case 'absent': return 'Vắng mặt'
      case 'excused': return 'Vắng có phép'
      default: return 'Chưa điểm danh'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'excused': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !session) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải buổi điểm danh</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push(`/teacher/courses/${courseId}`)}>
              Quay lại khóa học
            </Button>
          </Card>
        </div>
      </AppLayout>
    )
  }

  const presentCount = session.attendanceRecords.filter(r => r.status === 'present').length
  const lateCount = session.attendanceRecords.filter(r => r.status === 'late').length
  const absentCount = session.attendanceRecords.filter(r => r.status === 'absent').length
  const excusedCount = session.attendanceRecords.filter(r => r.status === 'excused').length
  const totalStudents = session.attendanceRecords.length
  const attendanceRate = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/teacher/courses/${courseId}`)}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại khóa học
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(session.date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-5 h-5" />
                  <span>{session.startTime} - {session.endTime}</span>
                </div>
                {session.room && (
                  <span>Phòng: {session.room}</span>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => router.push(`/teacher/courses/${courseId}/attendance/${sessionId}/mark`)}
                className="flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa điểm danh
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
            <p className="text-gray-600">Tổng số</p>
          </Card>
          <Card className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{presentCount}</p>
            <p className="text-gray-600">Có mặt</p>
          </Card>
          <Card className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{lateCount}</p>
            <p className="text-gray-600">Đi muộn</p>
          </Card>
          <Card className="p-6 text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{absentCount}</p>
            <p className="text-gray-600">Vắng mặt</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-sm font-bold">{attendanceRate}%</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{attendanceRate}%</p>
            <p className="text-gray-600">Tỷ lệ có mặt</p>
          </Card>
        </div>

        {/* Attendance List */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Danh sách điểm danh</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sinh viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã SV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giờ vào
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {session.attendanceRecords.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {record.student.firstName.charAt(0)}{record.student.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.student.firstName} {record.student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkInTime || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.note || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleMarkAttendance(record.student._id, 'present')}
                          disabled={updating}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Có mặt"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(record.student._id, 'late')}
                          disabled={updating}
                          className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                          title="Đi muộn"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(record.student._id, 'absent')}
                          disabled={updating}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Vắng mặt"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(record.student._id, 'excused')}
                          disabled={updating}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="Vắng có phép"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex space-x-4">
          <Button onClick={() => router.push(`/teacher/courses/${courseId}`)}>
            Quay lại khóa học
          </Button>
          <Button 
            onClick={() => router.push(`/teacher/courses/${courseId}/attendance`)}
            variant="outline"
          >
            Xem tất cả buổi điểm danh
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
