import { api } from '@/services/api';

export interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  teacher: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  students: string[];
  isActive: boolean;
  createdAt: string;
}

export interface CreateCourseData {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

class CourseService {
  async getCourses(): Promise<Course[]> {
    const response = await api.get('/courses');
    return response.data.courses || [];
  }

  async getAllCourses(): Promise<Course[]> {
    const response = await api.get('/admin/courses');
    return response.data.courses || [];
  }

  async getAllAvailableCourses(): Promise<Course[]> {
    const response = await api.get('/courses/available');
    return response.data.courses || [];
  }

  async getCourse(id: string): Promise<Course> {
    const response = await api.get(`/courses/${id}`);
    return response.data.course;
  }

  async createCourse(courseData: CreateCourseData): Promise<Course> {
    const response = await api.post('/courses', courseData);
    return response.data.course;
  }

  async updateCourse(id: string, courseData: Partial<CreateCourseData>): Promise<Course> {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data.course;
  }

  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  }

  // Get courses for current user (teacher: owned courses, student: enrolled courses)
  async getMyCourses(): Promise<Course[]> {
    const response = await api.get('/courses/my');
    return response.data.courses || [];
  }

  // Enroll in a course (for students)
  async enrollCourse(courseId: string): Promise<void> {
    await api.post(`/courses/${courseId}/enroll`);
  }

  // Unenroll from a course (for students)
  async unenrollCourse(courseId: string): Promise<void> {
    await api.delete(`/courses/${courseId}/enroll`);
  }
}

export const courseService = new CourseService();
