'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import AppLayout from '@/components/AppLayout'
import { User, Lock, AlertCircle, UserCheck, GraduationCap, Eye, EyeOff, BookOpen, Shield } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [justLoggedIn, setJustLoggedIn] = useState(false)
  const router = useRouter()
  const { login, user, logout } = useAuth()

  // Only redirect after successful login, not on page load
  useEffect(() => {
    if (user && justLoggedIn) {
      if (user.role === 'teacher') {
        router.push('/teacher/dashboard')
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/student/dashboard')
      }
    }
  }, [user, router, justLoggedIn])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(email, password)
      setJustLoggedIn(true) // Set flag to trigger redirect
      // Navigation will be handled by the redirect logic above
    } catch (error: any) {
      setError(error.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  // Show logout option if user is already logged in
  if (user && !justLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <div className="text-center space-y-4">
              <UserCheck size={48} className="mx-auto text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Đã đăng nhập
              </h2>
              <p className="text-gray-600">
                Xin chào {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500">
                Role: {user.role === 'teacher' ? 'Giảng viên' : user.role === 'student' ? 'Sinh viên' : 'Quản trị viên'}
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    if (user.role === 'teacher') {
                      router.push('/teacher/dashboard')
                    } else if (user.role === 'admin') {
                      router.push('/admin/dashboard')
                    } else {
                      router.push('/student/dashboard')
                    }
                  }}
                  className="flex-1"
                >
                  Vào Dashboard
                </Button>
                <Button 
                  onClick={() => logout()}
                  variant="outline"
                  className="flex-1"
                >
                  Đăng xuất
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <AppLayout showSidebar={false}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <BookOpen size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
              EduExam System
            </h1>
            <p className="text-gray-600 text-lg">
              Hệ thống thi trực tuyến thông minh
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Đăng nhập để bắt đầu hành trình học tập của bạn
            </p>
          </div>

        <Card className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    className="pl-10 py-3 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="pl-10 pr-10 py-3 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  onClick={() => router.push('/auth/forgot-password')}
                >
                  Quên mật khẩu?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={!email || !password || loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <button 
                  onClick={() => router.push('/auth/register')}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>

            {/* Demo accounts info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-700 mb-3 font-semibold flex items-center">
                <Shield size={16} className="mr-2 text-indigo-600" />
                Tài khoản demo để trải nghiệm:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <UserCheck size={16} className="text-emerald-600" />
                    <span className="font-semibold text-sm text-gray-800">Giảng viên</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>📧 teacher@demo.com</div>
                    <div>🔑 password123</div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <GraduationCap size={16} className="text-blue-600" />
                    <span className="font-semibold text-sm text-gray-800">Sinh viên</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>📧 student@demo.com</div>
                    <div>🔑 password123</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </AppLayout>
  )
}
