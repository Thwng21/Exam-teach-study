'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import AppLayout from '@/components/AppLayout'
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ')
      setTokenValid(false)
    } else {
      setTokenValid(true)
    }
  }, [token])

  const validatePassword = (password: string) => {
    const minLength = password.length >= 6
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)

    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      isValid: minLength && hasUppercase && hasLowercase && hasNumbers
    }
  }

  const passwordValidation = validatePassword(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp')
      return
    }

    if (!passwordValidation.isValid) {
      setError('Mật khẩu không đáp ứng yêu cầu bảo mật')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)

    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === false) {
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl">
              <div className="p-8 text-center">
                <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Link không hợp lệ
                </h2>
                <p className="text-gray-600 mb-6">
                  Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                </p>
                <Button
                  onClick={() => router.push('/auth/forgot-password')}
                  className="w-full"
                >
                  Yêu cầu link mới
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (success) {
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl">
              <div className="p-8 text-center">
                <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Đặt lại mật khẩu thành công!
                </h2>
                <p className="text-gray-600 mb-6">
                  Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng đến trang đăng nhập...
                </p>
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                >
                  Đăng nhập ngay
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout showSidebar={false}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => router.push('/auth/login')}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Quay lại đăng nhập
            </button>
            
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đặt lại mật khẩu
            </h1>
            <p className="text-gray-600">
              Nhập mật khẩu mới cho tài khoản của bạn
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
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
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
                  
                  {password && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Yêu cầu mật khẩu:</p>
                      <div className="space-y-1">
                        <div className={`flex items-center text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.minLength ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Ít nhất 6 ký tự
                        </div>
                        <div className={`flex items-center text-xs ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Có chữ hoa (A-Z)
                        </div>
                        <div className={`flex items-center text-xs ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasLowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Có chữ thường (a-z)
                        </div>
                        <div className={`flex items-center text-xs ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasNumbers ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Có số (0-9)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="pl-10 pr-10 py-3 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">Mật khẩu không khớp</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-green-600 mt-1">Mật khẩu khớp ✓</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={!password || !confirmPassword || loading || !passwordValidation.isValid || password !== confirmPassword}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang cập nhật...
                    </div>
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
