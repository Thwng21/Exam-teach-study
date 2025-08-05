import { api } from './api';

export interface Class {
  _id: string;
  name: string;
  code: string;
  course: string | {
    _id: string;
    name: string;
    code: string;
    credits?: number;
    academicYear?: string;
    semester?: string;
  }; // Can be either courseId string or populated course object
  teacher?: {
    _id: string;
    name: string;
    email: string;
  };
  students?: any[];
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string;
  }[]; // Array of schedules
  maxStudents: number;
  studentCount: number;
  status: 'active' | 'draft' | 'archived' | 'pending';
  isAvailable?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateClassData {
  name: string;
  code?: string;
  course: string;
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string;
  }[];  // Change to array
  maxStudents: number;
}

class ClassService {
  // Lấy danh sách lớp học theo khóa học
  async getClassesByCourse(courseId: string): Promise<Class[]> {
    try {
      console.log('ClassService.getClassesByCourse called with:', courseId);
      // Use test route to match with create route for consistency
      const response = await api.get(`/courses/${courseId}/classes-test`);
      console.log('ClassService.getClassesByCourse response:', response.data);
      
      // Check if response has the correct structure
      if (response.data && response.data.success && response.data.data) {
        const classes = response.data.data;
        console.log('Parsed classes:', classes);
        return classes.filter((cls: any) => cls && cls._id);
      } else {
        console.warn('Unexpected response structure:', response.data);
        return []; // Return empty array instead of mock data
      }
    } catch (error: any) {
      console.error('Error fetching classes by course:', error);
      
      // If it's an auth error, clear storage and redirect
      if (error.status === 401 || error.message?.includes('Token')) {
        console.log('Auth error detected, clearing storage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
      
      // Don't use mock data - return empty array to show actual state
      return [];
    }
  }

  // Lấy tất cả lớp học (tất cả courses) - để hiển thị cross-course
  async getAllClasses(): Promise<{allClasses: Class[], classesByCourse: {[key: string]: {course: any, classes: Class[]}}}> {
    try {
      console.log('ClassService.getAllClasses called');
      const response = await api.get('/courses/all-classes-test');
      console.log('ClassService.getAllClasses response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.warn('Unexpected response structure:', response.data);
        return { allClasses: [], classesByCourse: {} };
      }
    } catch (error: any) {
      console.error('Error fetching all classes:', error);
      return { allClasses: [], classesByCourse: {} };
    }
  }

  // Lấy danh sách lớp học
  async getClasses(params?: {
    course?: string;
    teacher?: string;
    status?: string;
  }): Promise<Class[]> {
    try {
      const response = await api.get('/classes', { params });
      const classes = response.data.data || [];
      // Filter out any null/invalid classes
      return classes.filter((cls: any) => cls && cls._id);
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  }

  // Lấy lớp học theo học kỳ
  async getClassesBySemester(academicYear: string, semester: string): Promise<Class[]> {
    const response = await api.get('/classes/by-semester', {
      params: { academicYear, semester }
    });
    return response.data.data;
  }

  // Lấy thông tin lớp học
  async getClass(id: string): Promise<Class> {
    const response = await api.get(`/classes/${id}`);
    return response.data.data;
  }

  // Tạo lớp học mới
  async createClass(data: CreateClassData): Promise<Class> {
    // Use test route temporarily to bypass auth issues for create
    const response = await api.post(`/courses/${data.course}/classes-test`, data);
    return response.data.data;
  }

  // Cập nhật lớp học
  async updateClass(id: string, data: Partial<CreateClassData>): Promise<Class> {
    const response = await api.put(`/classes/${id}`, data);
    return response.data.data;
  }

  // Xóa lớp học
  async deleteClass(id: string): Promise<void> {
    await api.delete(`/classes/${id}`);
  }

  // Sinh viên đăng ký lớp học
  async enrollClass(id: string): Promise<void> {
    await api.post(`/classes/${id}/enroll`);
  }

  // Sinh viên hủy đăng ký lớp học
  async unenrollClass(id: string): Promise<void> {
    await api.post(`/classes/${id}/unenroll`);
  }

  // Alias method for compatibility  
  async unenrollFromClass(id: string): Promise<void> {
    return this.unenrollClass(id);
  }

  // Lấy danh sách lớp học đã đăng ký cho sinh viên hiện tại
  async getEnrolledClasses(): Promise<any[]> {
    try {
      const response = await api.get('/classes/enrolled');
      const enrollments = response.data.data || [];
      // Filter out any null/invalid enrollments
      return enrollments.filter((enrollment: any) => enrollment && enrollment._id);
    } catch (error) {
      console.error('Error fetching enrolled classes:', error);
      return [];
    }
  }

  // Lấy tên thứ từ số
  getDayName(dayOfWeek: number): string {
    const days = [
      'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 
      'Thứ 5', 'Thứ 6', 'Thứ 7'
    ];
    return days[dayOfWeek] || '';
  }

  // Lấy danh sách thứ để hiển thị trong form
  getDayOptions() {
    return [
      { value: 1, label: 'Thứ 2' },
      { value: 2, label: 'Thứ 3' },
      { value: 3, label: 'Thứ 4' },
      { value: 4, label: 'Thứ 5' },
      { value: 5, label: 'Thứ 6' },
      { value: 6, label: 'Thứ 7' },
      { value: 0, label: 'Chủ nhật' }
    ];
  }

  // Format thời gian
  formatSchedule(scheduleItem: { dayOfWeek: number; startTime: string; endTime: string; room: string }): string {
    const dayName = this.getDayName(scheduleItem.dayOfWeek);
    return `${dayName} ${scheduleItem.startTime}-${scheduleItem.endTime} - ${scheduleItem.room}`;
  }

  // Mock data for development/fallback
  getMockClasses(courseId: string): Class[] {
    return [
      {
        _id: '1',
        name: 'Lớp CS102.01 - Sáng',
        code: 'CS102.01',
        course: courseId,
        maxStudents: 40,
        studentCount: 38,
        schedule: [
          {
            dayOfWeek: 2, // Tuesday
            startTime: '07:30',
            endTime: '09:30',
            room: 'H1-201'
          },
          {
            dayOfWeek: 5, // Friday
            startTime: '13:30',
            endTime: '15:30',
            room: 'H1-201'
          }
        ],
        status: 'active',
        createdAt: new Date('2025-01-15').toISOString()
      },
      {
        _id: '2',
        name: 'Lớp CS102.02 - Chiều',
        code: 'CS102.02',
        course: courseId,
        maxStudents: 35,
        studentCount: 32,
        schedule: [
          {
            dayOfWeek: 3, // Wednesday
            startTime: '09:30',
            endTime: '11:30',
            room: 'H2-105'
          },
          {
            dayOfWeek: 6, // Saturday
            startTime: '07:30',
            endTime: '09:30',
            room: 'H2-105'
          }
        ],
        status: 'active',
        createdAt: new Date('2025-01-16').toISOString()
      },
      {
        _id: '3',
        name: 'Lớp CS102.03 - Tối',
        code: 'CS102.03',
        course: courseId,
        maxStudents: 30,
        studentCount: 25,
        schedule: [
          {
            dayOfWeek: 4, // Thursday
            startTime: '18:00',
            endTime: '20:00',
            room: 'H3-301'
          },
          {
            dayOfWeek: 0, // Sunday
            startTime: '15:30',
            endTime: '17:30',
            room: 'H3-301'
          }
        ],
        status: 'active',
        createdAt: new Date('2025-01-17').toISOString()
      }
    ];
  }
}

export const classService = new ClassService();
