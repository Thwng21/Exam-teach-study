import { api } from '@/services/api';

export interface Submission {
  _id: string;
  exam: {
    _id: string;
    title: string;
    course: {
      _id: string;
      name: string;
      code: string;
    };
    maxScore: number;
  };
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    studentId: string;
  };
  answers: Array<{
    questionIndex: number;
    question: string;
    studentAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    points: number;
  }>;
  score: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface SubmitExamData {
  examId: string;
  answers: number[];
}

export interface GradeSubmissionData {
  score: number;
  feedback?: string;
}

class SubmissionService {
  async submitExam(data: SubmitExamData): Promise<Submission> {
    const response = await api.post('/submissions', data);
    return response.data.submission;
  }

  async getSubmissions(): Promise<Submission[]> {
    const response = await api.get('/submissions');
    return response.data.submissions;
  }

  async getSubmission(id: string): Promise<Submission> {
    const response = await api.get(`/submissions/${id}`);
    return response.data.submission;
  }

  async gradeSubmission(id: string, data: GradeSubmissionData): Promise<Submission> {
    const response = await api.put(`/submissions/${id}/grade`, data);
    return response.data.submission;
  }

  async getExamSubmissions(examId: string): Promise<Submission[]> {
    const response = await api.get(`/submissions/exam/${examId}`);
    return response.data.submissions;
  }
}

export const submissionService = new SubmissionService();
