import { getAuthToken } from '@/lib/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Helper function for API calls
const apiCall = async (endpoint: string, data?: any, options: RequestInit = {}) => {
  const token = getAuthToken()
  const url = `${API_BASE_URL}${endpoint}`
  
  // If data is provided and it's FormData, use it as body
  // If data is an object, JSON stringify it
  let body = undefined;
  let headers: Record<string, string> = { ...options.headers as Record<string, string> };
  
  if (data) {
    if (data instanceof FormData) {
      body = data;
      // Don't set Content-Type for FormData, let browser set it
      delete headers['Content-Type'];
    } else {
      body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
    }
  }
  
  const response = await fetch(url, {
    method: options.method || (data ? 'POST' : 'GET'),
    headers: {
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body,
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export interface Material {
  _id: string
  name: string
  type: 'file' | 'image' | 'video' | 'link'
  url: string
  size?: number
  mimeType?: string
  lesson?: string
  course: string
  uploadedBy: string
  uploadedAt: string
  isPublic: boolean
}

export interface UploadMaterialResponse {
  material: Material
  message: string
}

class MaterialService {
  // Get all materials for a course
  async getMaterials(courseId: string): Promise<Material[]> {
    try {
      const response = await apiCall(`/courses/${courseId}/materials`)
      return response
    } catch (error) {
      console.warn('Failed to fetch materials from API, using mock data:', error)
      return this.getMockMaterials(courseId)
    }
  }

  // Mock materials for demo
  private getMockMaterials(courseId: string): Material[] {
    return [
      {
        _id: 'material1',
        name: 'Bài giảng Chương 1.pdf',
        type: 'file',
        url: '/mock-files/chapter1.pdf',
        size: 2048000,
        mimeType: 'application/pdf',
        course: courseId,
        uploadedBy: 'teacher1',
        uploadedAt: new Date().toISOString(),
        isPublic: true
      },
      {
        _id: 'material2',
        name: 'Video hướng dẫn thực hành',
        type: 'video',
        url: '/mock-files/tutorial.mp4',
        size: 52428800,
        mimeType: 'video/mp4',
        course: courseId,
        uploadedBy: 'teacher1',
        uploadedAt: new Date().toISOString(),
        isPublic: true
      },
      {
        _id: 'material3',
        name: 'Slide bài giảng',
        type: 'file',
        url: '/mock-files/slides.pptx',
        size: 5242880,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        course: courseId,
        uploadedBy: 'teacher1',
        uploadedAt: new Date().toISOString(),
        isPublic: false
      }
    ]
  }

  // Get materials for a specific lesson
  async getLessonMaterials(lessonId: string): Promise<Material[]> {
    try {
      const response = await apiCall(`/lessons/${lessonId}/materials`)
      return response.data
    } catch (error) {
      console.warn('Failed to fetch lesson materials from API, using mock data:', error)
      return this.getMockMaterials(lessonId).slice(0, 2) // Return subset for lesson
    }
  }

  // Upload material to course
  async uploadCourseMaterial(courseId: string, file: File): Promise<UploadMaterialResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('courseId', courseId)
      
      const response = await apiCall('/materials/upload', formData, {
        method: 'POST',
      })
      return response.data
    } catch (error) {
      console.error('Error uploading material:', error)
      throw error
    }
  }

  // Upload material to lesson
  async uploadLessonMaterial(lessonId: string, file: File): Promise<UploadMaterialResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('lessonId', lessonId)
      
      const response = await apiCall('/materials/upload', formData, {
        method: 'POST',
      })
      return response.data
    } catch (error) {
      console.error('Error uploading lesson material:', error)
      throw error
    }
  }

  // Upload multiple materials
  async uploadMultipleMaterials(
    courseId: string, 
    files: FileList, 
    lessonId?: string
  ): Promise<UploadMaterialResponse[]> {
    try {
      const uploadPromises = Array.from(files).map(file => {
        if (lessonId) {
          return this.uploadLessonMaterial(lessonId, file)
        } else {
          return this.uploadCourseMaterial(courseId, file)
        }
      })
      
      const results = await Promise.all(uploadPromises)
      return results
    } catch (error) {
      console.error('Error uploading multiple materials:', error)
      throw error
    }
  }

  // Add link material
  async addLinkMaterial(courseId: string, materialData: {
    name: string
    url: string
    lessonId?: string
  }): Promise<Material> {
    try {
      const response = await apiCall('/materials/link', {
        ...materialData,
        courseId
      }, { method: 'POST' })
      return response.data
    } catch (error) {
      console.error('Error adding link material:', error)
      throw error
    }
  }

  // Get material by ID
  async getMaterial(materialId: string): Promise<Material> {
    try {
      const response = await apiCall(`/materials/${materialId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching material:', error)
      throw error
    }
  }

  // Download material
  async downloadMaterial(materialId: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/${materialId}/download`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to download material');
      }
      return await response.blob();
    } catch (error) {
      console.error('Error downloading material:', error)
      throw error
    }
  }

  // Delete material
  async deleteMaterial(materialId: string): Promise<void> {
    try {
      await apiCall(`/materials/${materialId}`, null, { method: 'DELETE' })
    } catch (error) {
      console.error('Error deleting material:', error)
      throw error
    }
  }

  // Update material info
  async updateMaterial(materialId: string, updateData: {
    name?: string
    isPublic?: boolean
  }): Promise<Material> {
    try {
      const response = await apiCall(`/materials/${materialId}`, updateData, { method: 'PUT' })
      return response.data
    } catch (error) {
      console.error('Error updating material:', error)
      throw error
    }
  }

  // Get material download URL
  getDownloadUrl(materialId: string): string {
    return `${process.env.NEXT_PUBLIC_API_URL}/materials/${materialId}/download`
  }

  // Get material preview URL (for images, videos)
  getPreviewUrl(materialId: string): string {
    return `${process.env.NEXT_PUBLIC_API_URL}/materials/${materialId}/preview`
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file icon based on type
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️'
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️'
    
    return '📁'
  }
}

export const materialService = new MaterialService()
