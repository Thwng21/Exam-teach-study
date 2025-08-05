'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/AppLayout'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import { courseService } from '@/services/courseService'
import { ArrowLeft, BookOpen } from 'lucide-react'
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
    academicYear: '2024-2025',
    semester: 'HK1',
    credits: 3,
    status: 'draft'
  })

  const handleInputChange = (field: string, value: any) => {
    setCourseData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!courseData.name.trim() || !courseData.code.trim() || !courseData.description.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      await courseService.createCourse(courseData)
      router.push('/teacher/courses')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo khóa học')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-500 text-lg">Vui lòng đăng nhập để tiếp tục</div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/teacher/courses">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tạo khóa học mới</h1>
              <p className="text-gray-600">Tạo một khóa học mới cho năm học và học kỳ</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={courseData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ví dụ: Lập trình Web"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã khóa học <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={courseData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="Ví dụ: IT4409"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả khóa học <span className="text-red-500">*</span>
              </label>
              <textarea
                value={courseData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về khóa học..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Academic Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin học thuật</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm học <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courseData.academicYear}
                    onChange={(e) => handleInputChange('academicYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Học kỳ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courseData.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="HK1">Học kỳ 1</option>
                    <option value="HK2">Học kỳ 2</option>
                    <option value="HK_HE">Học kỳ hè</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tín chỉ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={courseData.credits}
                    onChange={(e) => handleInputChange('credits', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái</h3>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={courseData.status === 'draft'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Nháp - Chưa công khai</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={courseData.status === 'active'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Hoạt động - Sinh viên có thể đăng ký</span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link href="/teacher/courses">
                <Button variant="outline" type="button">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <BookOpen className="w-4 h-4 mr-2" />
                {loading ? 'Đang tạo...' : 'Tạo khóa học'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Help Text */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">💡 Lưu ý</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Sau khi tạo khóa học, bạn cần tạo các lớp học cụ thể</li>
            <li>• Sinh viên sẽ đăng ký vào từng lớp học, không phải khóa học</li>
            <li>• Mã khóa học phải duy nhất trong cùng năm học và học kỳ</li>
            <li>• Chỉ khóa học có trạng thái "Hoạt động" mới hiển thị cho sinh viên</li>
          </ul>
        </Card>
      </div>
    </AppLayout>
  )
}
