'use client'

import { useState, useEffect } from 'react'
import { studentService, Student } from '@/services/studentService'
import Card from '@/components/Card'

export default function TestStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      console.log('Starting to load students...')
      setLoading(true)
      setError('')
      
      // Test mock data directly
      const mockStudents: Student[] = [
        {
          _id: 'student1',
          firstName: 'Nguyễn',
          lastName: 'Văn An',
          email: 'nguyenvanan@email.com',
          studentId: 'SV001',
          phone: '0901234567',
          major: 'Công nghệ thông tin',
          year: 3,
          gpa: 3.2,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'student2',
          firstName: 'Trần',
          lastName: 'Thị Bảo',
          email: 'tranthibao@email.com',
          studentId: 'SV002',
          phone: '0912345678',
          major: 'Công nghệ thông tin',
          year: 3,
          gpa: 3.8,
          isActive: true,
          createdAt: new Date().toISOString(),
        }
      ]
      
      console.log('Mock students:', mockStudents)
      setStudents(mockStudents)
      
      // Also test service
      try {
        const serviceStudents = await studentService.getCourseStudents('test-course')
        console.log('Service students:', serviceStudents)
        if (serviceStudents.length > 0) {
          setStudents(serviceStudents)
        }
      } catch (serviceError: any) {
        console.error('Service error:', serviceError)
        setError('Service error: ' + serviceError.message)
      }
      
    } catch (error: any) {
      console.error('Error loading students:', error)
      setError('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Students Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-blue-600">Loading students...</div>
      ) : (
        <div>
          <p className="mb-4 text-green-600">Found {students.length} students</p>
          
          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student._id} className="p-4 border border-gray-200">
                <h3 className="font-semibold text-lg">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  {student.studentId} • {student.email}
                </p>
                <p className="text-sm text-gray-500">
                  {student.major} - {student.year ? `Năm ${student.year}` : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  GPA: {student.gpa || 'N/A'} • Phone: {student.phone || 'N/A'}
                </p>
                <p className="text-sm text-gray-400">
                  Status: {student.isActive ? 'Active' : 'Inactive'}
                </p>
              </Card>
            ))}
          </div>
          
          {students.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              No students found. Check console for errors.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
