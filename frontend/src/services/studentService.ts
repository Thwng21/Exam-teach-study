import { getAuthToken } from '@/lib/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  let token = null
  try {
    token = getAuthToken()
  } catch (error) {
    console.log('No auth token available, proceeding without auth')
  }
  
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

export interface Student {
  _id: string
  firstName: string
  lastName: string
  email: string
  studentId: string
  avatar?: string
  phone?: string
  dateOfBirth?: string
  major?: string
  year?: number
  gpa?: number
  isActive: boolean
  createdAt: string
}

export interface StudentProgress {
  studentId: string
  courseId: string
  completedLessons: number
  totalLessons: number
  percentage: number
  lastAccessed?: string
}

export interface StudentGrade {
  studentId: string
  courseId: string
  assignments: number
  quizzes: number
  midterm?: number
  final?: number
  total: number
}

export interface StudentAttendance {
  studentId: string
  courseId: string
  present: number
  absent: number
  late: number
  excused: number
  total: number
  percentage: number
}

class StudentService {
  // Get student by ID
  async getStudent(studentId: string): Promise<Student> {
    try {
      const response = await apiCall(`/students/${studentId}`)
      return response
    } catch (error) {
      console.error('Error fetching student:', error)
      throw error
    }
  }

  // Get multiple students by IDs
  async getStudents(studentIds: string[]): Promise<Student[]> {
    try {
      if (studentIds.length === 0) return []
      
      const response = await apiCall('/students/batch', {
        method: 'POST',
        body: JSON.stringify({ studentIds })
      })
      return response
    } catch (error) {
      console.error('Error fetching students:', error)
      // Return mock data for demo if API fails
      return this.getMockStudents(studentIds)
    }
  }

  // Get students enrolled in a course
  async getCourseStudents(courseId: string): Promise<Student[]> {
    try {
      const response = await apiCall(`/courses/${courseId}/students`)
      return response
    } catch (error) {
      console.error('Error fetching course students:', error)
      // Always return mock data for demo
      console.log('Returning mock course students for demo')
      return this.getMockCourseStudents(courseId)
    }
  }

  // Get student progress in a course
  async getStudentProgress(courseId: string, studentId: string): Promise<StudentProgress> {
    try {
      const response = await apiCall(`/courses/${courseId}/students/${studentId}/progress`)
      return response
    } catch (error) {
      console.error('Error fetching student progress:', error)
      // Return mock progress
      return {
        studentId,
        courseId,
        completedLessons: Math.floor(Math.random() * 10) + 1,
        totalLessons: 12,
        percentage: Math.floor(Math.random() * 50) + 50,
        lastAccessed: new Date().toISOString()
      }
    }
  }

  // Get student grades in a course
  async getStudentGrades(courseId: string, studentId: string): Promise<StudentGrade> {
    try {
      const response = await apiCall(`/courses/${courseId}/students/${studentId}/grades`)
      return response
    } catch (error) {
      console.error('Error fetching student grades:', error)
      // Return mock grades
      return {
        studentId,
        courseId,
        assignments: Math.floor(Math.random() * 30) + 70,
        quizzes: Math.floor(Math.random() * 30) + 70,
        midterm: Math.floor(Math.random() * 30) + 70,
        total: Math.floor(Math.random() * 30) + 70
      }
    }
  }

  // Get student attendance in a course
  async getStudentAttendance(courseId: string, studentId: string): Promise<StudentAttendance> {
    try {
      const response = await apiCall(`/courses/${courseId}/students/${studentId}/attendance`)
      return response
    } catch (error) {
      console.error('Error fetching student attendance:', error)
      // Return mock attendance
      const total = 20
      const present = Math.floor(Math.random() * 10) + 10
      const absent = Math.floor(Math.random() * 5)
      const late = Math.floor(Math.random() * 3)
      const excused = total - present - absent - late
      
      return {
        studentId,
        courseId,
        present,
        absent,
        late,
        excused: Math.max(0, excused),
        total,
        percentage: Math.round((present / total) * 100)
      }
    }
  }

  // Mock data for demo purposes
  private getMockStudents(studentIds: string[]): Student[] {
    const mockStudents: Student[] = [
      {
        _id: 'student1',
        firstName: 'Nguyễn',
        lastName: 'Văn An',
        email: 'nguyenvanan@email.com',
        studentId: 'SV001',
        phone: '0901234567',
        dateOfBirth: '2000-01-15',
        major: 'Công nghệ thông tin',
        year: 3,
        gpa: 3.2,
        isActive: true,
        createdAt: '2024-01-15T00:00:00.000Z'
      },
      {
        _id: 'student2',
        firstName: 'Trần',
        lastName: 'Thị Bảo',
        email: 'tranthibao@email.com',
        studentId: 'SV002',
        phone: '0912345678',
        dateOfBirth: '2000-03-22',
        major: 'Công nghệ thông tin',
        year: 3,
        gpa: 3.8,
        isActive: true,
        createdAt: '2024-01-16T00:00:00.000Z'
      },
      {
        _id: 'student3',
        firstName: 'Lê',
        lastName: 'Minh Tuấn',
        email: 'leminhtuận@email.com',
        studentId: 'SV003',
        phone: '0923456789',
        dateOfBirth: '1999-12-10',
        major: 'Công nghệ thông tin',
        year: 4,
        gpa: 2.8,
        isActive: true,
        createdAt: '2024-01-18T00:00:00.000Z'
      },
      {
        _id: 'student4',
        firstName: 'Phạm',
        lastName: 'Thu Hương',
        email: 'phamthuhuong@email.com',
        studentId: 'SV004',
        phone: '0934567890',
        dateOfBirth: '2000-07-05',
        major: 'Công nghệ thông tin',
        year: 3,
        gpa: 3.9,
        isActive: true,
        createdAt: '2024-01-20T00:00:00.000Z'
      },
      {
        _id: 'student5',
        firstName: 'Hoàng',
        lastName: 'Văn Đức',
        email: 'hoangvanduc@email.com',
        studentId: 'SV005',
        phone: '0945678901',
        dateOfBirth: '1999-11-28',
        major: 'Công nghệ thông tin',
        year: 4,
        gpa: 2.1,
        isActive: false,
        createdAt: '2024-01-25T00:00:00.000Z'
      }
    ]

    return mockStudents.filter(student => studentIds.includes(student._id))
  }

  private getMockCourseStudents(courseId: string): Student[] {
    return this.getMockStudents(['student1', 'student2', 'student3', 'student4', 'student5'])
  }

  // Helper methods
  calculateAge(dateOfBirth: string): number {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  formatGPA(gpa: number): string {
    return gpa.toFixed(2)
  }

  getGradeFromGPA(gpa: number): { letter: string, description: string } {
    if (gpa >= 3.6) return { letter: 'A', description: 'Xuất sắc' }
    if (gpa >= 3.2) return { letter: 'B', description: 'Giỏi' }
    if (gpa >= 2.5) return { letter: 'C', description: 'Khá' }
    if (gpa >= 2.0) return { letter: 'D', description: 'Trung bình' }
    return { letter: 'F', description: 'Yếu' }
  }

  getYearLabel(year: number): string {
    switch (year) {
      case 1: return 'Năm thứ nhất'
      case 2: return 'Năm thứ hai'
      case 3: return 'Năm thứ ba'
      case 4: return 'Năm thứ tư'
      default: return `Năm ${year}`
    }
  }
}

export const studentService = new StudentService()
