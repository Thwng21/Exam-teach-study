'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import { User, Lock, Mail, AlertCircle, UserCheck, GraduationCap, Building } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'teacher' | 'student',
    studentId: '',
    department: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { register, user } = useAuth()

  // Redirect if already logged in
  if (user) {
    if (user.role === 'teacher') {
      router.push('/teacher/dashboard')
    } else {
      router.push('/student/dashboard')
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (formData.role === 'student' && !formData.studentId) {
      setError('Vui lòng nhập mã sinh viên')
      return
    }

    setLoading(true)
    setError('')

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'student' && { studentId: formData.studentId }),
        ...(formData.department && { department: formData.department })
      }

      await register(userData)
      // Navigation will be handled by the redirect logic above
    } catch (error: any) {
      setError(error.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng ký tài khoản
          </h1>
          <p className="text-gray-600">
            Tạo tài khoản mới để sử dụng hệ thống
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn vai trò
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateFormData('role', 'student')}
                  className={`p-3 border rounded-lg flex items-center space-x-2 transition-colors ${
                    formData.role === 'student' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <GraduationCap size={16} />
                  <span>Sinh viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData('role', 'teacher')}
                  className={`p-3 border rounded-lg flex items-center space-x-2 transition-colors ${
                    formData.role === 'teacher' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <UserCheck size={16} />
                  <span>Giảng viên</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  placeholder="Nhập họ"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  placeholder="Nhập tên"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="Nhập email"
                required
              />
            </div>

            {formData.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã sinh viên
                </label>
                <Input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => updateFormData('studentId', e.target.value)}
                  placeholder="Nhập mã sinh viên"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khoa/Bộ môn (tùy chọn)
              </label>
              <Input
                type="text"
                value={formData.department}
                onChange={(e) => updateFormData('department', e.target.value)}
                placeholder="Nhập khoa/bộ môn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <button 
                onClick={() => router.push('/auth/login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
