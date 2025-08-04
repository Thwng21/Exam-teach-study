import { getAuthToken } from '@/lib/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export interface StudentEnrollment {
  _id: string
  student: {
    _id: string
    firstName: string
    lastName: string
    email: string
    studentId: string
    avatar?: string
    phone?: string
    dateOfBirth?: string
  }
  course: string
  enrolledAt: string
  status: 'active' | 'inactive' | 'completed' | 'dropped'
  progress: {
    completedLessons: number
    totalLessons: number
    percentage: number
  }
  grades: {
    assignments: number
    quizzes: number
    midterm?: number
    final?: number
    total: number
  }
  attendance: {
    present: number
    absent: number
    late: number
    excused: number
    total: number
    percentage: number
  }
  lastAccessed?: string
  notes?: string
}

export interface EnrollmentStats {
  totalStudents: number
  activeStudents: number
  completedStudents: number
  droppedStudents: number
  averageProgress: number
  averageGrade: number
  attendanceRate: number
}

class EnrollmentService {
  // Get all enrollments for a course
  async getCourseEnrollments(courseId: string): Promise<StudentEnrollment[]> {
    try {
      const response = await apiCall(`/courses/${courseId}/enrollments`)
      return response
    } catch (error) {
      console.warn('Failed to fetch course enrollments from API, using mock data:', error)
      // Return mock data for demo purposes
      return this.getMockEnrollments(courseId)
    }
  }

  // Mock data for demo purposes
  private getMockEnrollments(courseId: string): StudentEnrollment[] {
    return [
      {
        _id: '1',
        student: {
          _id: 'student1',
          firstName: 'Nguyễn',
          lastName: 'Văn An',
          email: 'nguyenvanan@email.com',
          studentId: 'SV001',
          avatar: undefined,
          phone: '0901234567',
          dateOfBirth: '2000-01-15'
        },
        course: courseId,
        enrolledAt: '2024-01-15T00:00:00.000Z',
        status: 'active',
        progress: {
          completedLessons: 8,
          totalLessons: 12,
          percentage: 67
        },
        grades: {
          assignments: 85,
          quizzes: 90,
          midterm: 82,
          final: undefined,
          total: 85.7
        },
        attendance: {
          present: 18,
          absent: 2,
          late: 1,
          excused: 0,
          total: 21,
          percentage: 86
        },
        lastAccessed: '2024-03-01T10:30:00.000Z',
        notes: 'Sinh viên tích cực, có tiến bộ tốt'
      },
      {
        _id: '2',
        student: {
          _id: 'student2',
          firstName: 'Trần',
          lastName: 'Thị Bảo',
          email: 'tranthibao@email.com',
          studentId: 'SV002',
          avatar: undefined,
          phone: '0912345678'
        },
        course: courseId,
        enrolledAt: '2024-01-16T00:00:00.000Z',
        status: 'active',
        progress: {
          completedLessons: 10,
          totalLessons: 12,
          percentage: 83
        },
        grades: {
          assignments: 92,
          quizzes: 88,
          midterm: 89,
          final: undefined,
          total: 89.7
        },
        attendance: {
          present: 20,
          absent: 1,
          late: 0,
          excused: 0,
          total: 21,
          percentage: 95
        },
        lastAccessed: '2024-03-01T14:20:00.000Z'
      },
      {
        _id: '3',
        student: {
          _id: 'student3',
          firstName: 'Lê',
          lastName: 'Minh Tuấn',
          email: 'leminhtuấn@email.com',
          studentId: 'SV003',
          avatar: undefined,
          phone: '0923456789'
        },
        course: courseId,
        enrolledAt: '2024-01-18T00:00:00.000Z',
        status: 'active',
        progress: {
          completedLessons: 6,
          totalLessons: 12,
          percentage: 50
        },
        grades: {
          assignments: 75,
          quizzes: 78,
          midterm: 72,
          final: undefined,
          total: 75.0
        },
        attendance: {
          present: 15,
          absent: 4,
          late: 2,
          excused: 0,
          total: 21,
          percentage: 71
        },
        lastAccessed: '2024-02-28T09:15:00.000Z',
        notes: 'Cần cải thiện tính chuyên cần'
      },
      {
        _id: '4',
        student: {
          _id: 'student4',
          firstName: 'Phạm',
          lastName: 'Thu Hương',
          email: 'phamthuhuong@email.com',
          studentId: 'SV004',
          avatar: undefined,
          phone: '0934567890'
        },
        course: courseId,
        enrolledAt: '2024-01-20T00:00:00.000Z',
        status: 'completed',
        progress: {
          completedLessons: 12,
          totalLessons: 12,
          percentage: 100
        },
        grades: {
          assignments: 95,
          quizzes: 96,
          midterm: 94,
          final: 93,
          total: 94.5
        },
        attendance: {
          present: 21,
          absent: 0,
          late: 0,
          excused: 0,
          total: 21,
          percentage: 100
        },
        lastAccessed: '2024-03-01T16:45:00.000Z',
        notes: 'Sinh viên xuất sắc, hoàn thành sớm'
      },
      {
        _id: '5',
        student: {
          _id: 'student5',
          firstName: 'Hoàng',
          lastName: 'Văn Đức',
          email: 'hoangvanduc@email.com',
          studentId: 'SV005',
          avatar: undefined,
          phone: '0945678901'
        },
        course: courseId,
        enrolledAt: '2024-01-25T00:00:00.000Z',
        status: 'dropped',
        progress: {
          completedLessons: 3,
          totalLessons: 12,
          percentage: 25
        },
        grades: {
          assignments: 45,
          quizzes: 50,
          midterm: undefined,
          final: undefined,
          total: 47.5
        },
        attendance: {
          present: 8,
          absent: 10,
          late: 3,
          excused: 0,
          total: 21,
          percentage: 38
        },
        lastAccessed: '2024-02-15T11:30:00.000Z',
        notes: 'Đã bỏ học do không theo kịp'
      }
    ]
  }

  // Get enrollment statistics for a course
  async getCourseEnrollmentStats(courseId: string): Promise<EnrollmentStats> {
    try {
      const response = await apiCall(`/courses/${courseId}/enrollments/stats`)
      return response
    } catch (error) {
      console.warn('Failed to fetch enrollment stats from API, using mock data:', error)
      // Return mock stats for demo purposes
      return {
        totalStudents: 5,
        activeStudents: 3,
        completedStudents: 1,
        droppedStudents: 1,
        averageProgress: 65,
        averageGrade: 78.5,
        attendanceRate: 78
      }
    }
  }

  // Get specific student enrollment
  async getStudentEnrollment(courseId: string, studentId: string): Promise<StudentEnrollment | null> {
    try {
      const response = await apiCall(`/courses/${courseId}/enrollments/${studentId}`)
      return response
    } catch (error) {
      console.error('Error fetching student enrollment:', error)
      return null
    }
  }

  // Enroll student in course
  async enrollStudent(courseId: string, studentData: {
    studentId: string
    email?: string
  }): Promise<StudentEnrollment> {
    try {
      const response = await apiCall(`/courses/${courseId}/enrollments`, {
        method: 'POST',
        body: JSON.stringify(studentData)
      })
      return response
    } catch (error) {
      console.error('Error enrolling student:', error)
      throw error
    }
  }

  // Bulk enroll students
  async bulkEnrollStudents(courseId: string, studentsData: {
    students: string[] // Array of student IDs or emails
  }): Promise<{
    successful: StudentEnrollment[]
    failed: { identifier: string, error: string }[]
  }> {
    try {
      const response = await apiCall(`/courses/${courseId}/enrollments/bulk`, {
        method: 'POST',
        body: JSON.stringify(studentsData)
      })
      return response
    } catch (error) {
      console.error('Error bulk enrolling students:', error)
      throw error
    }
  }

  // Update enrollment status
  async updateEnrollmentStatus(courseId: string, studentId: string, status: string): Promise<StudentEnrollment> {
    try {
      const response = await apiCall(`/courses/${courseId}/enrollments/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
      return response
    } catch (error) {
      console.error('Error updating enrollment status:', error)
      throw error
    }
  }

  // Remove student from course
  async removeStudentFromCourse(courseId: string, studentId: string): Promise<void> {
    try {
      await apiCall(`/courses/${courseId}/enrollments/${studentId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error removing student from course:', error)
      throw error
    }
  }

  // Update student notes
  async updateStudentNotes(courseId: string, studentId: string, notes: string): Promise<StudentEnrollment> {
    try {
      const response = await apiCall(`/courses/${courseId}/enrollments/${studentId}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ notes })
      })
      return response
    } catch (error) {
      console.error('Error updating student notes:', error)
      throw error
    }
  }

  // Export enrollment data
  async exportEnrollmentData(courseId: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enrollments/export?format=${format}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return response.blob()
    } catch (error) {
      console.error('Error exporting enrollment data:', error)
      throw error
    }
  }

  // Get enrollment progress details
  async getEnrollmentProgress(courseId: string, studentId: string): Promise<{
    completedLessons: string[]
    assignmentScores: { assignmentId: string, score: number, maxScore: number }[]
    quizScores: { quizId: string, score: number, maxScore: number }[]
    attendanceRecords: { sessionId: string, status: string, date: string }[]
  }> {
    try {
      const response = await apiCall(`/courses/${courseId}/enrollments/${studentId}/progress`)
      return response
    } catch (error) {
      console.error('Error fetching enrollment progress:', error)
      throw error
    }
  }

  // Calculate student grade
  calculateStudentGrade(grades: StudentEnrollment['grades']): {
    letter: string
    gpa: number
    description: string
  } {
    const total = grades.total
    
    if (total >= 90) return { letter: 'A', gpa: 4.0, description: 'Xuất sắc' }
    if (total >= 85) return { letter: 'B+', gpa: 3.5, description: 'Giỏi' }
    if (total >= 80) return { letter: 'B', gpa: 3.0, description: 'Khá' }
    if (total >= 70) return { letter: 'C+', gpa: 2.5, description: 'Trung bình khá' }
    if (total >= 60) return { letter: 'C', gpa: 2.0, description: 'Trung bình' }
    if (total >= 50) return { letter: 'D', gpa: 1.0, description: 'Yếu' }
    
    return { letter: 'F', gpa: 0.0, description: 'Kém' }
  }

  // Format enrollment status
  formatEnrollmentStatus(status: string): { 
    label: string
    color: string
    bgColor: string
  } {
    switch (status) {
      case 'active':
        return { 
          label: 'Đang học', 
          color: 'text-green-700', 
          bgColor: 'bg-green-100' 
        }
      case 'completed':
        return { 
          label: 'Hoàn thành', 
          color: 'text-blue-700', 
          bgColor: 'bg-blue-100' 
        }
      case 'dropped':
        return { 
          label: 'Đã bỏ học', 
          color: 'text-red-700', 
          bgColor: 'bg-red-100' 
        }
      case 'inactive':
        return { 
          label: 'Tạm ngưng', 
          color: 'text-yellow-700', 
          bgColor: 'bg-yellow-100' 
        }
      default:
        return { 
          label: 'Không xác định', 
          color: 'text-gray-700', 
          bgColor: 'bg-gray-100' 
        }
    }
  }
}

export const enrollmentService = new EnrollmentService()
