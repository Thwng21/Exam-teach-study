'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/AppLayout'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import { courseService } from '@/services/courseService'
import { ArrowLeft, BookOpen, Users, Calendar, Settings } from 'lucide-react'
import Link from 'next/link'

export default function CreateCoursePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [courseData, setCourseData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true
  })

  const handleInputChange = (field: string, value: any) => {
    setCourseData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!courseData.name.trim()) {
        throw new Error('Tên khóa học không được để trống')
      }
      if (!courseData.code.trim()) {
        throw new Error('Mã khóa học không được để trống')
      }
      if (courseData.code.length < 3) {
        throw new Error('Mã khóa học phải có ít nhất 3 ký tự')
      }

      await courseService.createCourse(courseData)
      router.push('/teacher/courses')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600">Chỉ giảng viên mới có thể tạo khóa học</p>
        </Card>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/teacher/courses" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách khóa học
          </Link>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Tạo khóa học mới</h1>
            </div>
            <p className="text-gray-600">Tạo khóa học mới để quản lý sinh viên và bài thi</p>
          </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Thông tin cơ bản */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold">Thông tin cơ bản</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label="Tên khóa học *"
                  value={courseData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="VD: Lập trình Web nâng cao"
                  required
                />
              </div>
              
              <div>
                <Input
                  label="Mã khóa học *"
                  value={courseData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="VD: SE301"
                  maxLength={10}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Mã khóa học duy nhất, 3-10 ký tự
                </p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Kích hoạt khóa học
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả khóa học
              </label>
              <textarea
                value={courseData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về nội dung, mục tiêu và yêu cầu của khóa học..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                Mô tả sẽ giúp sinh viên hiểu rõ hơn về khóa học
              </p>
            </div>
          </Card>

          {/* Thông tin giảng viên */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold">Thông tin giảng viên</h2>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-500">{user?.department || 'Chưa có thông tin khoa'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Hướng dẫn */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Sau khi tạo khóa học</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Bạn có thể thêm sinh viên vào khóa học</li>
                  <li>• Tạo các bài thi cho khóa học này</li>
                  <li>• Quản lý điểm số và theo dõi tiến độ học tập</li>
                  <li>• Sinh viên có thể đăng ký và tham gia khóa học</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Submit buttons */}
          <div className="flex gap-4 justify-end bg-white p-6 rounded-lg border">
            <Link href="/teacher/courses">
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo...
                </div>
              ) : (
                'Tạo khóa học'
              )}
            </Button>
          </div>
        </form>
        </div>
    </AppLayout>
  )
}
