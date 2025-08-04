import { getAuthToken } from '@/lib/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export interface Lesson {
  _id: string
  title: string
  description?: string
  content?: string
  order: number
  duration?: number
  type: 'video' | 'document' | 'quiz' | 'assignment'
  materials?: Material[]
  isPublished: boolean
  course: string
  createdAt: string
  updatedAt: string
}

export interface Material {
  _id: string
  name: string
  type: 'file' | 'image' | 'video' | 'link'
  url: string
  size?: number
  lesson?: string
  course: string
  uploadedAt: string
}

export interface CreateLessonData {
  title: string
  description?: string
  content?: string
  type: 'video' | 'document' | 'quiz' | 'assignment'
  duration?: number
  order?: number
}

export interface UpdateLessonData {
  title?: string
  description?: string
  content?: string
  type?: 'video' | 'document' | 'quiz' | 'assignment'
  duration?: number
  order?: number
  isPublished?: boolean
}

class LessonService {
  // Get all lessons for a course
  async getLessons(courseId: string): Promise<Lesson[]> {
    try {
      const response = await apiCall(`/courses/${courseId}/lessons`)
      return response
    } catch (error) {
      console.warn('Failed to fetch lessons from API, using mock data:', error)
      return this.getMockLessons(courseId)
    }
  }

  // Mock lessons for demo
  private getMockLessons(courseId: string): Lesson[] {
    return [
      {
        _id: 'lesson1',
        title: 'Bài 1: Giới thiệu về khóa học',
        description: 'Tổng quan về nội dung và mục tiêu của khóa học',
        content: 'Nội dung chi tiết bài học...',
        type: 'document',
        duration: 60,
        course: courseId,
        order: 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'lesson2',
        title: 'Bài 2: Kiến thức cơ bản',
        description: 'Các khái niệm và nguyên lý cơ bản',
        content: 'Nội dung chi tiết bài học...',
        type: 'video',
        duration: 90,
        course: courseId,
        order: 2,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }

  // Get a specific lesson
  async getLesson(lessonId: string): Promise<Lesson> {
    try {
      const response = await apiCall(`/lessons/${lessonId}`)
      return response
    } catch (error) {
      console.error('Error fetching lesson:', error)
      throw error
    }
  }

  // Create a new lesson
  async createLesson(courseId: string, lessonData: CreateLessonData): Promise<Lesson> {
    try {
      const response = await apiCall(`/courses/${courseId}/lessons`, {
        method: 'POST',
        body: JSON.stringify(lessonData)
      })
      return response
    } catch (error) {
      console.error('Error creating lesson:', error)
      throw error
    }
  }

  // Update a lesson
  async updateLesson(lessonId: string, lessonData: UpdateLessonData): Promise<Lesson> {
    try {
      const response = await apiCall(`/lessons/${lessonId}`, {
        method: 'PUT',
        body: JSON.stringify(lessonData)
      })
      return response
    } catch (error) {
      console.error('Error updating lesson:', error)
      throw error
    }
  }

  // Delete a lesson
  async deleteLesson(lessonId: string): Promise<void> {
    try {
      await apiCall(`/lessons/${lessonId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error deleting lesson:', error)
      throw error
    }
  }

  // Reorder lessons
  async reorderLessons(courseId: string, lessonIds: string[]): Promise<void> {
    try {
      await apiCall(`/courses/${courseId}/lessons/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ lessonIds })
      })
    } catch (error) {
      console.error('Error reordering lessons:', error)
      throw error
    }
  }

  // Publish/unpublish lesson
  async togglePublishLesson(lessonId: string, isPublished: boolean): Promise<Lesson> {
    try {
      const response = await apiCall(`/lessons/${lessonId}/publish`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished })
      })
      return response
    } catch (error) {
      console.error('Error toggling lesson publication:', error)
      throw error
    }
  }
}

export const lessonService = new LessonService()
