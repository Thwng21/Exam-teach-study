'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Card from '@/components/Card'
import Button from '@/components/Button'
import AppLayout from '@/components/AppLayout'
import { 
  Lock, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  ArrowLeft,
  Settings as SettingsIcon 
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuth()

  if (!user) {
    router.push('/auth/login')
    return null
  }

  const settingsOptions = [
    {
      icon: Lock,
      title: 'Đổi mật khẩu',
      description: 'Cập nhật mật khẩu để bảo vệ tài khoản',
      href: '/auth/change-password',
      color: 'text-red-600 bg-red-50'
    },
    {
      icon: User,
      title: 'Thông tin cá nhân',
      description: 'Cập nhật thông tin hồ sơ của bạn',
      href: `/${user.role}/profile`,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Bell,
      title: 'Thông báo',
      description: 'Quản lý cài đặt thông báo',
      href: '#',
      color: 'text-yellow-600 bg-yellow-50',
      comingSoon: true
    },
    {
      icon: Shield,
      title: 'Bảo mật',
      description: 'Cài đặt bảo mật và quyền riêng tư',
      href: '#',
      color: 'text-green-600 bg-green-50',
      comingSoon: true
    },
    {
      icon: Palette,
      title: 'Giao diện',
      description: 'Tùy chỉnh giao diện và chủ đề',
      href: '#',
      color: 'text-purple-600 bg-purple-50',
      comingSoon: true
    },
    {
      icon: Globe,
      title: 'Ngôn ngữ',
      description: 'Thay đổi ngôn ngữ hiển thị',
      href: '#',
      color: 'text-indigo-600 bg-indigo-50',
      comingSoon: true
    }
  ]

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-medium transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Quay lại
            </button>
            
            <div className="flex items-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mr-4 shadow-lg">
                <SettingsIcon size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
                <p className="text-gray-600">Quản lý tài khoản và tùy chỉnh trải nghiệm của bạn</p>
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settingsOptions.map((option, index) => (
              <Card 
                key={index}
                className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${option.color}`}>
                      <option.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {option.title}
                        </h3>
                        {option.comingSoon && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            Sắp có
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {option.description}
                      </p>
                      <Button
                        onClick={() => {
                          if (!option.comingSoon) {
                            router.push(option.href)
                          }
                        }}
                        variant={option.comingSoon ? "outline" : "primary"}
                        size="sm"
                        disabled={option.comingSoon}
                        className={`text-sm ${!option.comingSoon ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700' : ''}`}
                      >
                        {option.comingSoon ? 'Sắp có' : 'Truy cập'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <Card className="mt-8 backdrop-blur-sm bg-white/90 border border-white/20 shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin tài khoản
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tên đăng nhập</p>
                  <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Vai trò</p>
                  <p className="font-medium text-gray-900">
                    {user.role === 'student' ? 'Sinh viên' : user.role === 'teacher' ? 'Giảng viên' : 'Quản trị viên'}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                  <p className="font-medium text-green-600">
                    Hoạt động
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
