// API Configuration and Services
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  // Authentication APIs
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return this.handleResponse(response)
  }

  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'teacher' | 'student'
    studentId?: string
    department?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    return this.handleResponse(response)
  }

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Course APIs
  async getCourses() {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async getCourse(id: string) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async createCourse(courseData: {
    name: string
    description: string
    code: string
    credits: number
    semester: string
    year: number
  }) {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData)
    })
    return this.handleResponse(response)
  }

  async updateCourse(id: string, courseData: any) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData)
    })
    return this.handleResponse(response)
  }

  async deleteCourse(id: string) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async enrollStudent(courseId: string, studentEmail: string) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ studentEmail })
    })
    return this.handleResponse(response)
  }

  // Exam APIs
  async getExams(courseId?: string) {
    const url = courseId 
      ? `${API_BASE_URL}/exams?courseId=${courseId}`
      : `${API_BASE_URL}/exams`
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async getExam(id: string) {
    const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async createExam(examData: any) {
    const response = await fetch(`${API_BASE_URL}/exams`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(examData)
    })
    return this.handleResponse(response)
  }

  async updateExam(id: string, examData: any) {
    const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(examData)
    })
    return this.handleResponse(response)
  }

  async deleteExam(id: string) {
    const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Submission APIs
  async getSubmissions(examId?: string) {
    const url = examId 
      ? `${API_BASE_URL}/submissions?examId=${examId}`
      : `${API_BASE_URL}/submissions`
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async getSubmission(id: string) {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async submitExam(examId: string, answers: any) {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ examId, answers })
    })
    return this.handleResponse(response)
  }

  async gradeSubmission(submissionId: string, grades: any) {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/grade`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(grades)
    })
    return this.handleResponse(response)
  }

  // Dashboard APIs
  async getTeacherStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/teacher`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async getStudentStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/student`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // File Upload API
  async uploadFile(file: File, type: 'exam' | 'submission' = 'exam') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    })
    return this.handleResponse(response)
  }
}

export const apiService = new ApiService()

// Auth helper functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token)
}

export const removeAuthToken = () => {
  localStorage.removeItem('token')
}

export const getAuthToken = () => {
  return localStorage.getItem('token')
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}
