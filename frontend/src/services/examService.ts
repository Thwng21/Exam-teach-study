import { api } from '@/services/api';

export interface Exam {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    name: string;
    code: string;
  };
  teacher: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  questions: Array<{
    question: string;
    type: 'multiple-choice' | 'true-false' | 'essay' | 'fill-blank';
    options: string[];
    correctAnswer: number | string;
    points: number;
  }>;
  duration: number;
  maxScore: number;
  passingScore: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  allowRetake: boolean;
  showResults: boolean;
  createdAt: string;
}

export interface CreateExamData {
  title: string;
  description: string;
  course: string;
  questions: Array<{
    question: string;
    type: 'multiple-choice' | 'true-false' | 'essay' | 'fill-blank';
    options: string[];
    correctAnswer: number | string;
    points: number;
  }>;
  duration: number;
  passingScore: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  allowRetake: boolean;
  showResults: boolean;
}

export interface ExamStats {
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
}

class ExamService {
  async getExams(): Promise<Exam[]> {
    const response = await api.get('/exams');
    return response.data.exams;
  }

  async getAllExams(): Promise<Exam[]> {
    const response = await api.get('/admin/exams');
    return response.data.exams || [];
  }

  async getExam(id: string): Promise<Exam> {
    const response = await api.get(`/exams/${id}`);
    return response.data.exam;
  }

  async createExam(examData: CreateExamData): Promise<Exam> {
    const response = await api.post('/exams', examData);
    return response.data.exam;
  }

  async updateExam(id: string, examData: Partial<CreateExamData>): Promise<Exam> {
    const response = await api.put(`/exams/${id}`, examData);
    return response.data.exam;
  }

  async deleteExam(id: string): Promise<void> {
    await api.delete(`/exams/${id}`);
  }

  async getExamStats(id: string): Promise<{ stats: ExamStats; submissions: any[] }> {
    const response = await api.get(`/exams/${id}/stats`);
    return response.data;
  }

  // Get exams by course ID
  async getExamsByCourse(courseId: string): Promise<Exam[]> {
    const response = await api.get(`/courses/${courseId}/exams`);
    return response.data.exams;
  }
}

export const examService = new ExamService();
