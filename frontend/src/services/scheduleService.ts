import { api } from './api'

export interface Schedule {
  _id: string
  course: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  room?: string
  instructor?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateScheduleData {
  dayOfWeek: number
  startTime: string
  endTime: string
  room?: string
}

export interface UpdateScheduleData {
  dayOfWeek?: number
  startTime?: string
  endTime?: string
  room?: string
  isActive?: boolean
}

class ScheduleService {
  // Get all schedules for a course
  async getSchedules(courseId: string): Promise<Schedule[]> {
    try {
      // Temporarily return mock data until backend API is ready
      console.log('Loading schedules for course:', courseId)
      
      // Mock data for development
      const mockSchedules: Schedule[] = [
        {
          _id: '1',
          course: courseId,
          dayOfWeek: 1, // Monday
          startTime: '08:00',
          endTime: '10:00',
          room: 'A101',
          instructor: 'teacher1',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          course: courseId,
          dayOfWeek: 3, // Wednesday
          startTime: '14:00',
          endTime: '16:00',
          room: 'B205',
          instructor: 'teacher1',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          course: courseId,
          dayOfWeek: 5, // Friday
          startTime: '10:00',
          endTime: '12:00',
          room: 'C301',
          instructor: 'teacher1',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      return mockSchedules
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.get(`/courses/${courseId}/schedules`)
      // return response.data
    } catch (error) {
      console.error('Error fetching schedules:', error)
      return [] // Return empty array instead of throwing error
    }
  }

  // Get a specific schedule
  async getSchedule(scheduleId: string): Promise<Schedule> {
    try {
      const response = await api.get(`/schedules/${scheduleId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching schedule:', error)
      throw error
    }
  }

  // Create a new schedule
  async createSchedule(courseId: string, scheduleData: CreateScheduleData): Promise<Schedule> {
    try {
      const response = await api.post(`/courses/${courseId}/schedules`, scheduleData)
      return response.data
    } catch (error) {
      console.error('Error creating schedule:', error)
      throw error
    }
  }

  // Update a schedule
  async updateSchedule(scheduleId: string, scheduleData: UpdateScheduleData): Promise<Schedule> {
    try {
      const response = await api.put(`/schedules/${scheduleId}`, scheduleData)
      return response.data
    } catch (error) {
      console.error('Error updating schedule:', error)
      throw error
    }
  }

  // Delete a schedule
  async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      await api.delete(`/schedules/${scheduleId}`)
    } catch (error) {
      console.error('Error deleting schedule:', error)
      throw error
    }
  }

  // Get schedules for a teacher
  async getTeacherSchedules(teacherId: string): Promise<Schedule[]> {
    try {
      const response = await api.get(`/teachers/${teacherId}/schedules`)
      return response.data
    } catch (error) {
      console.error('Error fetching teacher schedules:', error)
      throw error
    }
  }

  // Get current week schedule
  async getCurrentWeekSchedule(courseId: string): Promise<Schedule[]> {
    try {
      const response = await api.get(`/courses/${courseId}/schedules/current-week`)
      return response.data
    } catch (error) {
      console.error('Error fetching current week schedule:', error)
      throw error
    }
  }

  // Check schedule conflicts
  async checkConflicts(scheduleData: CreateScheduleData): Promise<{
    hasConflict: boolean
    conflictingSchedules: Schedule[]
  }> {
    try {
      const response = await api.post('/schedules/check-conflicts', scheduleData)
      return response.data
    } catch (error) {
      console.error('Error checking schedule conflicts:', error)
      throw error
    }
  }

  // Utility methods
  getDayName(dayOfWeek: number): string {
    const days = [
      'Chủ nhật',
      'Thứ 2', 
      'Thứ 3', 
      'Thứ 4', 
      'Thứ 5', 
      'Thứ 6', 
      'Thứ 7'
    ]
    return days[dayOfWeek] || 'Không xác định'
  }

  getDayShortName(dayOfWeek: number): string {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    return days[dayOfWeek] || '--'
  }

  formatTime(time: string): string {
    // Convert HH:mm to formatted time
    try {
      const [hours, minutes] = time.split(':')
      return `${hours}:${minutes}`
    } catch (error) {
      return time
    }
  }

  getTimeSlotDuration(startTime: string, endTime: string): number {
    try {
      const [startHours, startMinutes] = startTime.split(':').map(Number)
      const [endHours, endMinutes] = endTime.split(':').map(Number)
      
      const startTotalMinutes = startHours * 60 + startMinutes
      const endTotalMinutes = endHours * 60 + endMinutes
      
      return endTotalMinutes - startTotalMinutes
    } catch (error) {
      return 0
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} phút`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (remainingMinutes === 0) {
      return `${hours} giờ`
    }
    
    return `${hours} giờ ${remainingMinutes} phút`
  }

  // Validate schedule data
  validateScheduleTime(startTime: string, endTime: string): {
    isValid: boolean
    error?: string
  } {
    try {
      const [startHours, startMinutes] = startTime.split(':').map(Number)
      const [endHours, endMinutes] = endTime.split(':').map(Number)
      
      if (startHours < 0 || startHours > 23 || endHours < 0 || endHours > 23) {
        return { isValid: false, error: 'Giờ phải từ 0-23' }
      }
      
      if (startMinutes < 0 || startMinutes > 59 || endMinutes < 0 || endMinutes > 59) {
        return { isValid: false, error: 'Phút phải từ 0-59' }
      }
      
      const startTotalMinutes = startHours * 60 + startMinutes
      const endTotalMinutes = endHours * 60 + endMinutes
      
      if (startTotalMinutes >= endTotalMinutes) {
        return { isValid: false, error: 'Thời gian kết thúc phải sau thời gian bắt đầu' }
      }
      
      if (endTotalMinutes - startTotalMinutes < 30) {
        return { isValid: false, error: 'Buổi học phải ít nhất 30 phút' }
      }
      
      return { isValid: true }
    } catch (error) {
      return { isValid: false, error: 'Định dạng thời gian không hợp lệ' }
    }
  }

  // Generate schedule summary
  generateScheduleSummary(schedules: Schedule[]): string {
    if (schedules.length === 0) return 'Chưa có lịch học'
    
    const summary = schedules
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      .map(schedule => {
        const duration = this.getTimeSlotDuration(schedule.startTime, schedule.endTime)
        return `${this.getDayShortName(schedule.dayOfWeek)} ${this.formatTime(schedule.startTime)}-${this.formatTime(schedule.endTime)}`
      })
      .join(', ')
    
    return summary
  }
}

export const scheduleService = new ScheduleService()
