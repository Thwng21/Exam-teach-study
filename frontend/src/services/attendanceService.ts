import { api } from './api'

export interface AttendanceRecord {
  _id: string
  student: {
    _id: string
    firstName: string
    lastName: string
    studentId: string
    email: string
  }
  course: string
  session: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  checkInTime?: string
  checkOutTime?: string
  note?: string
  markedBy: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceSession {
  _id: string
  course: string
  title: string
  date: string
  startTime: string
  endTime: string
  room?: string
  isActive: boolean
  attendanceRecords: AttendanceRecord[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceStats {
  totalSessions: number
  presentCount: number
  absentCount: number
  lateCount: number
  excusedCount: number
  attendanceRate: number
}

export interface CreateSessionData {
  title: string
  date: string
  startTime: string
  endTime: string
  room?: string
}

export interface MarkAttendanceData {
  studentId: string
  status: 'present' | 'absent' | 'late' | 'excused'
  checkInTime?: string
  note?: string
}

class AttendanceService {
  // Get all attendance sessions for a course
  async getAttendanceSessions(courseId: string): Promise<AttendanceSession[]> {
    try {
      // Mock data for development
      console.log('Loading attendance sessions for course:', courseId)
      
      const mockSessions: AttendanceSession[] = [
        {
          _id: '1',
          course: courseId,
          title: 'Buổi học 1: Giới thiệu môn học',
          date: '2025-01-15',
          startTime: '08:00',
          endTime: '10:00',
          room: 'A101',
          isActive: false,
          attendanceRecords: [],
          createdBy: 'teacher1',
          createdAt: new Date('2025-01-15').toISOString(),
          updatedAt: new Date('2025-01-15').toISOString()
        },
        {
          _id: '2',
          course: courseId,
          title: 'Buổi học 2: HTML & CSS',
          date: '2025-01-17',
          startTime: '14:00',
          endTime: '16:00',
          room: 'B205',
          isActive: false,
          attendanceRecords: [],
          createdBy: 'teacher1',
          createdAt: new Date('2025-01-17').toISOString(),
          updatedAt: new Date('2025-01-17').toISOString()
        },
        {
          _id: '3',
          course: courseId,
          title: 'Buổi học 3: JavaScript cơ bản',
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '12:00',
          room: 'C301',
          isActive: true,
          attendanceRecords: [],
          createdBy: 'teacher1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      return mockSessions
      
      // TODO: Replace with actual API call
      // const response = await api.get(`/courses/${courseId}/attendance/sessions`)
      // return response.data
    } catch (error) {
      console.error('Error fetching attendance sessions:', error)
      return []
    }
  }

  // Get attendance session details
  async getAttendanceSession(sessionId: string): Promise<AttendanceSession> {
    try {
      // Mock data for development
      console.log('Loading attendance session:', sessionId)
      
      const mockSession: AttendanceSession = {
        _id: sessionId,
        course: 'course1',
        title: 'Buổi học 3: JavaScript cơ bản',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '12:00',
        room: 'C301',
        isActive: true,
        attendanceRecords: [
          {
            _id: '1',
            student: {
              _id: 'student1',
              firstName: 'Nguyễn',
              lastName: 'Văn A',
              studentId: 'SV001',
              email: 'nguyenvana@email.com'
            },
            course: 'course1',
            session: sessionId,
            date: new Date().toISOString().split('T')[0],
            status: 'present',
            checkInTime: '10:00',
            markedBy: 'teacher1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '2',
            student: {
              _id: 'student2',
              firstName: 'Trần',
              lastName: 'Thị B',
              studentId: 'SV002',
              email: 'tranthib@email.com'
            },
            course: 'course1',
            session: sessionId,
            date: new Date().toISOString().split('T')[0],
            status: 'late',
            checkInTime: '10:15',
            note: 'Đến muộn 15 phút',
            markedBy: 'teacher1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '3',
            student: {
              _id: 'student3',
              firstName: 'Lê',
              lastName: 'Văn C',
              studentId: 'SV003',
              email: 'levanc@email.com'
            },
            course: 'course1',
            session: sessionId,
            date: new Date().toISOString().split('T')[0],
            status: 'absent',
            markedBy: 'teacher1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        createdBy: 'teacher1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return mockSession
      
      // TODO: Replace with actual API call
      // const response = await api.get(`/attendance/sessions/${sessionId}`)
      // return response.data
    } catch (error) {
      console.error('Error fetching attendance session:', error)
      throw error
    }
  }

  // Create new attendance session
  async createSession(courseId: string, sessionData: CreateSessionData): Promise<AttendanceSession> {
    try {
      console.log('Creating attendance session:', sessionData)
      
      // Mock response
      const newSession: AttendanceSession = {
        _id: 'new_' + Date.now(),
        course: courseId,
        title: sessionData.title,
        date: sessionData.date,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        room: sessionData.room,
        isActive: true,
        attendanceRecords: [],
        createdBy: 'teacher1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return newSession
      
      // TODO: Replace with actual API call
      // const response = await api.post(`/courses/${courseId}/attendance/sessions`, sessionData)
      // return response.data
    } catch (error) {
      console.error('Error creating attendance session:', error)
      throw error
    }
  }

  // Mark attendance for a student
  async markAttendance(sessionId: string, attendanceData: MarkAttendanceData): Promise<AttendanceRecord> {
    try {
      console.log('Marking attendance:', attendanceData)
      
      // Mock response
      const record: AttendanceRecord = {
        _id: 'record_' + Date.now(),
        student: {
          _id: attendanceData.studentId,
          firstName: 'Student',
          lastName: 'Name',
          studentId: 'SV' + attendanceData.studentId,
          email: 'student@email.com'
        },
        course: 'course1',
        session: sessionId,
        date: new Date().toISOString().split('T')[0],
        status: attendanceData.status,
        checkInTime: attendanceData.checkInTime,
        note: attendanceData.note,
        markedBy: 'teacher1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return record
      
      // TODO: Replace with actual API call
      // const response = await api.post(`/attendance/sessions/${sessionId}/mark`, attendanceData)
      // return response.data
    } catch (error) {
      console.error('Error marking attendance:', error)
      throw error
    }
  }

  // Get attendance statistics for a student
  async getStudentAttendanceStats(courseId: string, studentId: string): Promise<AttendanceStats> {
    try {
      console.log('Loading attendance stats for student:', studentId)
      
      // Mock stats
      const stats: AttendanceStats = {
        totalSessions: 10,
        presentCount: 8,
        absentCount: 1,
        lateCount: 1,
        excusedCount: 0,
        attendanceRate: 80 // (present + late) / total * 100
      }
      
      return stats
      
      // TODO: Replace with actual API call
      // const response = await api.get(`/courses/${courseId}/attendance/students/${studentId}/stats`)
      // return response.data
    } catch (error) {
      console.error('Error fetching attendance stats:', error)
      throw error
    }
  }

  // Get course attendance summary
  async getCourseAttendanceSummary(courseId: string): Promise<{
    totalSessions: number
    totalStudents: number
    averageAttendanceRate: number
    sessionsData: Array<{
      sessionId: string
      date: string
      title: string
      attendanceRate: number
    }>
  }> {
    try {
      console.log('Loading course attendance summary:', courseId)
      
      // Mock summary
      const summary = {
        totalSessions: 10,
        totalStudents: 25,
        averageAttendanceRate: 85,
        sessionsData: [
          {
            sessionId: '1',
            date: '2025-01-15',
            title: 'Buổi học 1: Giới thiệu',
            attendanceRate: 92
          },
          {
            sessionId: '2', 
            date: '2025-01-17',
            title: 'Buổi học 2: HTML & CSS',
            attendanceRate: 88
          },
          {
            sessionId: '3',
            date: new Date().toISOString().split('T')[0],
            title: 'Buổi học 3: JavaScript',
            attendanceRate: 80
          }
        ]
      }
      
      return summary
      
      // TODO: Replace with actual API call
      // const response = await api.get(`/courses/${courseId}/attendance/summary`)
      // return response.data
    } catch (error) {
      console.error('Error fetching course attendance summary:', error)
      throw error
    }
  }

  // Utility methods
  getStatusColor(status: string): string {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100'
      case 'late': return 'text-yellow-600 bg-yellow-100'
      case 'absent': return 'text-red-600 bg-red-100'
      case 'excused': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'present': return 'Có mặt'
      case 'late': return 'Đi muộn'
      case 'absent': return 'Vắng mặt'
      case 'excused': return 'Vắng có phép'
      default: return 'Chưa điểm danh'
    }
  }

  formatTime(time: string): string {
    return time.substring(0, 5) // HH:MM format
  }

  calculateAttendanceRate(present: number, late: number, total: number): number {
    if (total === 0) return 0
    return Math.round(((present + late) / total) * 100)
  }
}

export const attendanceService = new AttendanceService()
