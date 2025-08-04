'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Trash2,
  Users,
  Clock,
  MoreVertical,
  Calendar,
  FileText
} from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'
import { Exam, EXAM_STATUS } from '@/lib/types'

// Mock data
const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Kiểm tra giữa kỳ - Lập trình Web',
    description: 'Kiểm tra kiến thức về HTML, CSS, JavaScript cơ bản',
    courseId: 'cs101',
    courseName: 'Lập trình Web (CS101)',
    duration: 90,
    totalPoints: 100,
    questions: [],
    status: EXAM_STATUS.ACTIVE,
    startTime: '2025-08-05T09:00:00Z',
    endTime: '2025-08-05T12:00:00Z',
    createdAt: '2025-07-20T10:00:00Z',
    submissionCount: 45
  },
  {
    id: '2',
    title: 'Quiz - JavaScript Cơ bản',
    description: 'Câu hỏi trắc nghiệm về syntax và functions trong JavaScript',
    courseId: 'cs101',
    courseName: 'Lập trình Web (CS101)',
    duration: 30,
    totalPoints: 50,
    questions: [],
    status: EXAM_STATUS.COMPLETED,
    startTime: '2025-08-01T14:00:00Z',
    endTime: '2025-08-01T15:00:00Z',
    createdAt: '2025-07-25T14:00:00Z',
    submissionCount: 48
  },
  {
    id: '3',
    title: 'Bài tập lớn - Cơ sở dữ liệu',
    description: 'Thiết kế và triển khai cơ sở dữ liệu cho hệ thống quản lý thư viện',
    courseId: 'cs201',
    courseName: 'Cơ sở dữ liệu (CS201)',
    duration: 180,
    totalPoints: 150,
    questions: [],
    status: EXAM_STATUS.PUBLISHED,
    startTime: '2025-08-10T08:00:00Z',
    endTime: '2025-08-10T23:59:00Z',
    createdAt: '2025-07-30T09:00:00Z',
    submissionCount: 0
  },
  {
    id: '4',
    title: 'Thực hành SQL',
    description: 'Bài tập thực hành về truy vấn SQL',
    courseId: 'cs201',
    courseName: 'Cơ sở dữ liệu (CS201)',
    duration: 60,
    totalPoints: 75,
    questions: [],
    status: EXAM_STATUS.DRAFT,
    createdAt: '2025-08-01T16:00:00Z',
    submissionCount: 0
  }
]

export default function TeacherExamsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const userInfo = {
    userRole: 'teacher' as const,
    userName: 'TS. Nguyễn Văn A',
    userEmail: 'teacher@university.edu.vn'
  }

  const filteredExams = mockExams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      [EXAM_STATUS.DRAFT]: 'bg-gray-100 text-gray-700',
      [EXAM_STATUS.PUBLISHED]: 'bg-blue-100 text-blue-700',
      [EXAM_STATUS.ACTIVE]: 'bg-green-100 text-green-700',
      [EXAM_STATUS.COMPLETED]: 'bg-purple-100 text-purple-700'
    }
    
    const labels: Record<string, string> = {
      [EXAM_STATUS.DRAFT]: 'Nháp',
      [EXAM_STATUS.PUBLISHED]: 'Đã xuất bản',
      [EXAM_STATUS.ACTIVE]: 'Đang diễn ra',
      [EXAM_STATUS.COMPLETED]: 'Đã kết thúc'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Quản lý Bài kiểm tra
            </h1>
            <p className="text-gray-600">
              Tạo và quản lý các bài kiểm tra cho sinh viên
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} className="mr-2" />
            Tạo bài kiểm tra
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Tìm kiếm bài kiểm tra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value={EXAM_STATUS.DRAFT}>Nháp</option>
                <option value={EXAM_STATUS.PUBLISHED}>Đã xuất bản</option>
                <option value={EXAM_STATUS.ACTIVE}>Đang diễn ra</option>
                <option value={EXAM_STATUS.COMPLETED}>Đã kết thúc</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Exams List */}
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                    {getStatusBadge(exam.status)}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{exam.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {exam.courseName}
                    </span>
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatDuration(exam.duration)}
                    </span>
                    <span className="flex items-center">
                      <Users size={14} className="mr-1" />
                      {exam.submissionCount} bài nộp
                    </span>
                    {exam.startTime && (
                      <span>
                        Bắt đầu: {formatDate(exam.startTime)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye size={14} className="mr-1" />
                    Xem
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit size={14} className="mr-1" />
                    Sửa
                  </Button>
                  {exam.submissionCount > 0 && (
                    <Button size="sm" variant="secondary">
                      <Users size={14} className="mr-1" />
                      Kết quả ({exam.submissionCount})
                    </Button>
                  )}
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {filteredExams.length === 0 && (
            <Card>
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy bài kiểm tra nào
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Thử thay đổi bộ lọc để xem thêm kết quả' 
                    : 'Bắt đầu bằng cách tạo bài kiểm tra đầu tiên'}
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus size={16} className="mr-2" />
                  Tạo bài kiểm tra
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Tạo bài kiểm tra mới
            </h2>
            <div className="space-y-4">
              <Input label="Tiêu đề" placeholder="Nhập tiêu đề bài kiểm tra" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Nhập mô tả bài kiểm tra"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khóa học
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Chọn khóa học</option>
                  <option value="cs101">CS101 - Lập trình Web</option>
                  <option value="cs201">CS201 - Cơ sở dữ liệu</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Hủy
              </Button>
              <Button onClick={() => setShowCreateModal(false)}>
                Tạo bài kiểm tra
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
