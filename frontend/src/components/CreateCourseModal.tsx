'use client'

import { useState } from 'react'
import { courseService, CreateCourseData } from '@/services/courseService'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { X, BookOpen, FileText, Hash, Award } from 'lucide-react'

interface CreateCourseModalProps {
  academicYear: string
  semester: string
  onClose: () => void
  onSuccess: () => void
}

export default function CreateCourseModal({
  academicYear,
  semester,
  onClose,
  onSuccess
}: CreateCourseModalProps) {
  const [formData, setFormData] = useState<CreateCourseData>({
    name: '',
    code: '',
    description: '',
    academicYear,
    semester,
    credits: 3,
    status: 'draft'
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: keyof CreateCourseData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      console.log('Creating course with data:', formData)
      const result = await courseService.createCourse(formData)
      console.log('Course created successfully:', result)
      onSuccess()
    } catch (err: any) {
      console.error('Error creating course:', err)
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo khóa học')
    } finally {
      setLoading(false)
    }
  }

  const getSemesterName = (sem: string) => {
    const names: { [key: string]: string } = {
      'HK1': 'Học kỳ 1',
      'HK2': 'Học kỳ 2', 
      'HK_HE': 'Học kỳ hè'
    }
    return names[sem] || sem
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tạo khóa học mới</h3>
              <p className="text-sm text-gray-500">
                {academicYear} - {getSemesterName(semester)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          {/* Course Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-gray-400 mr-2" />
              <h4 className="text-sm font-semibold text-gray-700">Thông tin cơ bản</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ví dụ: Lập trình Web"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã khóa học <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    placeholder="IT101"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả khóa học
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả ngắn gọn về nội dung và mục tiêu của khóa học..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Course Settings */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Award className="w-5 h-5 text-gray-400 mr-2" />
              <h4 className="text-sm font-semibold text-gray-700">Cài đặt khóa học</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tín chỉ
                </label>
                <select
                  value={formData.credits}
                  onChange={(e) => handleInputChange('credits', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 tín chỉ</option>
                  <option value={2}>2 tín chỉ</option>
                  <option value={3}>3 tín chỉ</option>
                  <option value={4}>4 tín chỉ</option>
                  <option value={5}>5 tín chỉ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm học
                </label>
                <Input
                  type="text"
                  value={academicYear}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Học kỳ
                </label>
                <Input
                  type="text"
                  value={getSemesterName(semester)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Bản nháp</span>
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Chưa công khai
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Hoạt động</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Hiển thị cho SV
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Course Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Xem trước</h4>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold text-gray-900">
                  {formData.name || 'Tên khóa học'}
                </h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  formData.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {formData.status === 'active' ? 'Hoạt động' : 'Bản nháp'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {formData.code || 'MÃ_KHÓA_HỌC'}
                </span>
                <span className="text-sm text-gray-500">
                  {formData.credits} tín chỉ
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {formData.description || 'Mô tả khóa học sẽ hiển thị ở đây...'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.code.trim()}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </div>
              ) : (
                'Tạo khóa học'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
