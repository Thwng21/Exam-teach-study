'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  GraduationCap,
  UserCheck
} from 'lucide-react'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'teacher' | 'student'
  studentId?: string
  department?: string
  isActive: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'student'>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/auth/login')
        return
      }
      
      fetchUsers()
    }
  }, [user, loading, router])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      // Mock data - replace with real API call
      const mockUsers: User[] = [
        {
          _id: '1',
          firstName: 'Nguyễn',
          lastName: 'Văn A',
          email: 'teacher1@example.com',
          role: 'teacher',
          department: 'Khoa Công nghệ thông tin',
          isActive: true,
          createdAt: '2025-01-15T10:00:00Z'
        },
        {
          _id: '2',
          firstName: 'Trần',
          lastName: 'Thị B',
          email: 'student1@example.com',
          role: 'student',
          studentId: 'SV001',
          department: 'Khoa Công nghệ thông tin',
          isActive: true,
          createdAt: '2025-01-20T14:30:00Z'
        }
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email} ${user.studentId || ''}`
      .toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <main className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quản lý tài khoản
          </h1>
          <p className="text-gray-600">
            Tạo và quản lý tài khoản giảng viên, sinh viên
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, mã sinh viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="teacher">Giảng viên</option>
                <option value="student">Sinh viên</option>
              </select>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2"
              >
                <UserPlus size={16} />
                <span>Tạo tài khoản</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Users List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tài khoản</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Vai trò</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Khoa/Bộ môn</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Ngày tạo</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.studentId && (
                          <p className="text-sm text-blue-600">MSV: {user.studentId}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {user.role === 'teacher' ? (
                          <UserCheck size={16} className="text-blue-600" />
                        ) : (
                          <GraduationCap size={16} className="text-green-600" />
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          user.role === 'teacher' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {user.department || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        user.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Không tìm thấy tài khoản nào</p>
              </div>
            )}
          </div>
        </Card>

        {/* Create User Modal - Simple version for now */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tạo tài khoản mới</h3>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Để tạo tài khoản mới, vui lòng sử dụng trang đăng ký hoặc tính năng này sẽ được phát triển thêm.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Đóng
                </Button>
                <Button 
                  onClick={() => router.push('/auth/register')}
                  className="flex-1"
                >
                  Đến trang đăng ký
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </AppLayout>
  )
}
