'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import AppLayout from '@/components/AppLayout'
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff, Lock, Shield } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1: Nhập email, 2: Đổi mật khẩu
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Vui lòng nhập địa chỉ email')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Định dạng email không hợp lệ')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra')
      }

      if (data.success) {
        setStep(2) // Chuyển sang bước đổi mật khẩu
      }
    } catch (error: any) {
      setError(error.message || 'Email không tồn tại trong hệ thống')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp')
      return
    }

    if (!passwordValidation.isValid) {
      setError('Mật khẩu mới không đáp ứng yêu cầu bảo mật')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password-direct`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          newPassword: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Đổi mật khẩu thất bại')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)

    } catch (error: any) {
      setError(error.message || 'Đổi mật khẩu thất bại')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl">
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 shadow-lg">
                  <CheckCircle size={32} className="text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Đổi mật khẩu thành công!
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Mật khẩu của bạn đã được cập nhật thành công. Đang chuyển hướng đến trang đăng nhập...
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/auth/login')}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl"
                  >
                    Đăng nhập ngay
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Step 1: Nhập email
  if (step === 1) {
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Quay lại đăng nhập
              </button>
              
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                <Mail size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Đặt lại mật khẩu
              </h1>
              <p className="text-gray-600">
                Nhập email để xác minh tài khoản
              </p>
            </div>

            <Card className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl">
              <div className="p-8">
                <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                      <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email của bạn"
                        className="pl-10 py-3 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Chúng tôi sẽ kiểm tra email này có tồn tại trong hệ thống không
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={!email || loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang kiểm tra...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle size={18} className="mr-2" />
                        Xác minh email
                      </div>
                    )}
                  </Button>
                </form>

                {/* Help Text */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-600">
                      Nhớ lại mật khẩu rồi?{' '}
                      <button 
                        onClick={() => router.push('/auth/login')}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                      >
                        Đăng nhập ngay
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Step 2: Đổi mật khẩu
  return (
    <AppLayout showSidebar={false}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Quay lại
            </button>
            
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đặt mật khẩu mới
            </h1>
            <p className="text-gray-600">
              Đã xác minh email: <strong>{email}</strong>
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl">
            <div className="p-8">
              <form onSubmit={handlePasswordReset} className="space-y-6">
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
                    Xác nhận mật khẩu mới
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
                    'Cập nhật mật khẩu'
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
