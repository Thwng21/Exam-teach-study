import { api } from '@/services/api';

export interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  academicYear: string;    // ✅ Thêm mới
  semester: string;        // ✅ Thêm mới
  credits: number;         // ✅ Thêm mới
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  classes?: any[];         // ✅ Thay thế students
  status: string;          // ✅ Thay thế isActive
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  name: string;
  code: string;
  description: string;
  academicYear: string;    // ✅ Thêm mới
  semester: string;        // ✅ Thêm mới
  credits: number;         // ✅ Thêm mới
  status?: string;         // ✅ Thay thế isActive
}

class CourseService {
  // Lấy khóa học với filter
  async getCourses(params?: {
    academicYear?: string;
    semester?: string;
  }): Promise<Course[]> {
    try {
      // Add cache busting
      const queryParams = {
        ...params,
        _t: Date.now()
      }
      
      const apiResponse: any = await api.get('/courses', { params: queryParams });
      const courses = apiResponse?.data?.courses || [];
      
      // Filter out any null/invalid courses
      const validCourses = courses.filter((course: any) => course && course._id);
      return validCourses;
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  // Lấy tất cả khóa học (admin)
  async getAllCourses(): Promise<Course[]> {
    const response = await api.get('/admin/courses');
    return response.data.courses || [];
  }

  // Lấy khóa học có sẵn để đăng ký
  async getAllAvailableCourses(params?: {
    academicYear?: string;
    semester?: string;
  }): Promise<Course[]> {
    const response = await api.get('/courses/available', { params });
    return response.data.data?.courses || [];
  }

  // Lấy khóa học theo học kỳ
  async getCoursesBySemester(academicYear: string, semester: string): Promise<Course[]> {
    const response = await api.get('/courses/by-semester', {
      params: { academicYear, semester }
    });
    return response.data.data || [];
  }

  // Lấy thông tin khóa học
  async getCourse(id: string): Promise<Course> {
    try {
      console.log('CourseService.getCourse called with ID:', id);
      const response = await api.get(`/courses/${id}`);
      console.log('CourseService.getCourse response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('CourseService.getCourse error:', error);
      throw error;
    }
  }

  // Tạo khóa học mới
  async createCourse(courseData: CreateCourseData): Promise<Course> {
    console.log('CourseService.createCourse called with:', courseData)
    const response = await api.post('/courses', courseData);
    console.log('CourseService.createCourse response:', response.data)
    return response.data.data;
  }

  // Cập nhật khóa học
  async updateCourse(id: string, courseData: Partial<CreateCourseData>): Promise<Course> {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data.data;
  }

  // Xóa khóa học
  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  }

  // Lấy khóa học của tôi
  async getMyCourses(): Promise<Course[]> {
    const response = await api.get('/courses/my');
    return response.data.data?.courses || [];
  }

  // ❌ DEPRECATED - Sử dụng classService.enrollClass thay thế
  async enrollCourse(courseId: string): Promise<void> {
    throw new Error('API này đã không còn được sử dụng. Vui lòng đăng ký trực tiếp vào lớp học.');
  }

  // ❌ DEPRECATED - Sử dụng classService.unenrollClass thay thế
  // ❌ DEPRECATED - Sử dụng classService.unenrollClass thay thế
  async unenrollCourse(courseId: string): Promise<void> {
    throw new Error('API này đã không còn được sử dụng. Vui lòng hủy đăng ký trực tiếp khỏi lớp học.');
  }

  // Lấy danh sách năm học
  async getAcademicYears(): Promise<string[]> {
    const response = await api.get('/courses/academic-years');
    return response.data.data;
  }

  // Lấy danh sách học kỳ
  async getSemesters(academicYear?: string): Promise<string[]> {
    const params = academicYear ? { academicYear } : {};
    const response = await api.get('/courses/semesters', { params });
    return response.data.data;
  }

  // Helper: Lấy tên học kỳ
  getSemesterName(semester: string): string {
    const names: { [key: string]: string } = {
      'HK1': 'Học kỳ 1',
      'HK2': 'Học kỳ 2',
      'HK_HE': 'Học kỳ hè'
    };
    return names[semester] || semester;
  }

  // Helper: Lấy danh sách học kỳ để hiển thị trong form
  getSemesterOptions() {
    return [
      { value: 'HK1', label: 'Học kỳ 1' },
      { value: 'HK2', label: 'Học kỳ 2' },
      { value: 'HK_HE', label: 'Học kỳ hè' }
    ];
  }
}

export const courseService = new CourseService();
