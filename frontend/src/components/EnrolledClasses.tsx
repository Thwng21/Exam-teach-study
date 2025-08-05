'use client'

import { useState, useEffect } from 'react'
import { classService } from '@/services/classService'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { Users, Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface EnrolledClassesProps {
  studentId?: string
}

export default function EnrolledClasses({ studentId }: EnrolledClassesProps) {
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadEnrolledClasses()
  }, [studentId])

  const loadEnrolledClasses = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Get enrolled classes for current student
      const classes = await classService.getEnrolledClasses()
      setEnrolledClasses(classes)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách lớp học')
    } finally {
      setLoading(false)
    }
  }

  const handleUnenroll = async (classId: string) => {
    try {
      await classService.unenrollFromClass(classId)
      loadEnrolledClasses() // Reload the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi hủy đăng ký')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
          <p>{error}</p>
          <Button onClick={loadEnrolledClasses} className="mt-4">
            Thử lại
          </Button>
        </div>
      </Card>
    )
  }

  if (enrolledClasses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Chưa đăng ký lớp học nào</h3>
          <p>Hãy chọn học kỳ và đăng ký các lớp học phù hợp</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Lớp học đã đăng ký</h2>
          <p className="text-gray-600">Danh sách các lớp học bạn đang theo học</p>
        </div>
        <div className="text-sm text-gray-500">
          Tổng cộng: {enrolledClasses.length} lớp
        </div>
      </div>

      <div className="space-y-4">
        {enrolledClasses.filter(enrollment => enrollment && enrollment._id).map((enrollment) => (
          <EnrolledClassCard 
            key={enrollment._id} 
            enrollment={enrollment}
            onUnenroll={handleUnenroll}
          />
        ))}
      </div>
    </div>
  )
}

function EnrolledClassCard({ 
  enrollment, 
  onUnenroll 
}: { 
  enrollment: any
  onUnenroll: (classId: string) => void 
}) {
  const { classInfo } = enrollment
  const course = classInfo.course

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'dropped':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'Đã đăng ký'
      case 'pending':
        return 'Chờ duyệt'
      case 'dropped':
        return 'Đã hủy'
      default:
        return status
    }
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {classInfo.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
              {getStatusText(enrollment.status)}
            </span>
          </div>
          <p className="text-gray-600 font-mono text-sm">{classInfo.code}</p>
          <p className="text-gray-700 font-medium">{course.name}</p>
        </div>
        {enrollment.status === 'enrolled' && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{classService.formatSchedule(classInfo.schedule)}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span>Phòng {classInfo.schedule.room}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span>{classInfo.studentCount}/{classInfo.maxStudents} sinh viên</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Đăng ký: {new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN')}
        </div>

        {enrollment.status === 'enrolled' && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Xem chi tiết
            </Button>
            <Button 
              size="sm" 
              variant="danger"
              onClick={() => onUnenroll(classInfo._id)}
            >
              Hủy đăng ký
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
