import { api } from './api';

export interface AcademicYear {
  academicYear: string;
  semesters: {
    semester: string;
    semesterName: string;
    courseCount: number;
    classCount: number;
  }[];
}

export interface SemesterData {
  academicYear: string;
  semester: string;
  semesterName: string;
  courses: CourseWithClasses[];
  summary: {
    totalCourses: number;
    totalClasses: number;
    totalStudentSlots: number;
    occupiedSlots: number;
  };
}

export interface CourseWithClasses {
  _id: string;
  name: string;
  code: string;
  description: string;
  academicYear: string;
  semester: string;
  credits: number;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  classes: ClassInfo[];
  status: string;
}

export interface ClassInfo {
  _id: string;
  name: string;
  code: string;
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string;
  };
  maxStudents: number;
  studentCount: number;
  status: string;
  isAvailable: boolean;
}

export interface StudentEnrollment {
  enrolledClasses: any[];
  enrollmentByTerm: {
    academicYear: string;
    semester: string;
    semesterName: string;
    classes: any[];
    totalCredits: number;
  }[];
  summary: {
    totalClasses: number;
    totalCredits: number;
  };
}

class AcademicService {
  // Lấy tổng quan hệ thống
  async getOverview(): Promise<AcademicYear[]> {
    try {
      const response = await api.get('/academic/overview');
      const data = response.data.data || [];
      // Filter out any null/invalid academic years
      return data.filter((year: any) => year && year.academicYear);
    } catch (error) {
      console.error('Error fetching academic overview:', error);
      return [];
    }
  }

  // Lấy tổng quan cho sinh viên
  async getStudentOverview(): Promise<{
    totalCourses: number;
    enrolledClasses: number;
    totalCredits: number;
    averageGrade?: number;
    semesters: Array<{
      academicYear: string;
      semester: number;
      courseCount: number;
    }>;
  }> {
    try {
      const response = await api.get('/academic/overview');
      const data = response.data.data || [];
      
      // Transform the data to match the expected format
      const semesters = data.flatMap((year: AcademicYear) =>
        year.semesters?.map(sem => ({
          academicYear: year.academicYear,
          semester: parseInt(sem.semester),
          courseCount: sem.courseCount
        })) || []
      ).filter((sem: any) => sem.academicYear && sem.semester);

      return {
        totalCourses: semesters.reduce((sum: number, sem: any) => sum + (sem.courseCount || 0), 0),
        enrolledClasses: 0, // This would come from actual enrollment data
        totalCredits: 0,
        semesters
      };
    } catch (error) {
      console.error('Error fetching student overview:', error);
      return {
        totalCourses: 0,
        enrolledClasses: 0,
        totalCredits: 0,
        semesters: []
      };
    }
  }

  // Lấy danh sách năm học
  async getAcademicYears(): Promise<string[]> {
    const response = await api.get('/courses/academic-years');
    return response.data.data;
  }

  // Lấy danh sách học kỳ theo năm học
  async getSemesters(academicYear?: string): Promise<string[]> {
    const params = academicYear ? { academicYear } : {};
    const response = await api.get('/courses/semesters', { params });
    return response.data.data;
  }

  // Lấy dữ liệu học kỳ (khóa học và lớp học)
  async getSemesterData(academicYear: string, semester: string): Promise<SemesterData> {
    const response = await api.get('/academic/semester-data', {
      params: { academicYear, semester }
    });
    return response.data.data;
  }

  // Lấy thông tin đăng ký của sinh viên
  async getStudentEnrollment(): Promise<StudentEnrollment> {
    const response = await api.get('/academic/student-enrollment');
    return response.data.data;
  }

  // Lấy tên thứ từ số
  getDayName(dayOfWeek: number): string {
    const days = [
      'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 
      'Thứ 5', 'Thứ 6', 'Thứ 7'
    ];
    return days[dayOfWeek] || '';
  }

  // Lấy tên học kỳ
  getSemesterName(semester: string): string {
    const names: { [key: string]: string } = {
      'HK1': 'Học kỳ 1',
      'HK2': 'Học kỳ 2',
      'HK_HE': 'Học kỳ hè'
    };
    return names[semester] || semester;
  }
}

export const academicService = new AcademicService();
