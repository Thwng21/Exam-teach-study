'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import AppLayout from '@/components/AppLayout'
import { User, Lock, AlertCircle, UserCheck, GraduationCap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hệ thống Thi trực tuyến
            </h1>
            <p className="text-gray-600">
              Đăng nhập để tiếp tục
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!email || !password || loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <button 
                onClick={() => router.push('/auth/register')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>

          {/* Demo accounts info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2 font-medium">Tài khoản demo:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <div className="flex items-center space-x-1 mb-1">
                  <UserCheck size={12} />
                  <span className="font-medium">Giảng viên</span>
                </div>
                <div>teacher@demo.com</div>
                <div>password123</div>
              </div>
              <div>
                <div className="flex items-center space-x-1 mb-1">
                  <GraduationCap size={12} />
                  <span className="font-medium">Sinh viên</span>
                </div>
                <div>student@demo.com</div>
                <div>password123</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </AppLayout>
  )
}
