export const USER_ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student'
} as const

export const EXAM_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ACTIVE: 'active',
  COMPLETED: 'completed'
} as const

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]
export type ExamStatus = typeof EXAM_STATUS[keyof typeof EXAM_STATUS]
export type QuestionType = typeof QUESTION_TYPES[keyof typeof QUESTION_TYPES]

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface Course {
  id: string
  name: string
  code: string
  description: string
  teacherId: string
  students: number
  createdAt: string
}

export interface Question {
  id: string
  type: QuestionType
  question: string
  options?: string[]
  correctAnswer?: string | number
  points: number
}

export interface Exam {
  id: string
  title: string
  description: string
  courseId: string
  courseName: string
  duration: number // in minutes
  totalPoints: number
  questions: Question[]
  status: ExamStatus
  startTime?: string
  endTime?: string
  createdAt: string
  submissionCount: number
}

export interface ExamSubmission {
  id: string
  examId: string
  studentId: string
  studentName: string
  answers: Record<string, any>
  score?: number
  submittedAt: string
  timeSpent: number // in minutes
}
