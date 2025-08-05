'use client';

import { useState, useEffect } from 'react';
import { academicService, SemesterData } from '@/services/academicService';
import { classService } from '@/services/classService';
import ModernSemesterSelector from './ModernSemesterSelector';
import ClassCard from './ClassCard';
import Card from './Card';

interface CourseWithClassesProps {
  academicYear?: string;
  semester?: string;
  showEnrollButton?: boolean;
  userRole?: 'student' | 'teacher' | 'admin';
  className?: string;
}

export default function CourseWithClasses({
  academicYear: propAcademicYear,
  semester: propSemester,
  showEnrollButton = false,
  userRole = 'student',
  className = ''
}: CourseWithClassesProps) {
  const [semesterData, setSemesterData] = useState<SemesterData | null>(null);
  const [enrolledClasses, setEnrolledClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  useEffect(() => {
    if (userRole === 'student') {
      loadEnrolledClasses();
    }
    // Load data when academicYear/semester props change
    if (propAcademicYear && propSemester) {
      setSelectedYear(propAcademicYear);
      setSelectedSemester(propSemester);
      loadSemesterData(propAcademicYear, propSemester);
    }
  }, [userRole, propAcademicYear, propSemester]);

  const loadEnrolledClasses = async () => {
    try {
      const enrollment = await academicService.getStudentEnrollment();
      const classIds = enrollment.enrolledClasses.map((cls: any) => cls._id);
      setEnrolledClasses(classIds);
    } catch (error) {
      console.error('Failed to load enrolled classes:', error);
    }
  };

  const loadSemesterData = async (academicYear: string, semester: string) => {
    try {
      setLoading(true);
      const data = await academicService.getSemesterData(academicYear, semester);
      setSemesterData(data);
    } catch (error) {
      console.error('Failed to load semester data:', error);
      setSemesterData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterSelect = (academicYear: string, semester: string) => {
    setSelectedYear(academicYear);
    setSelectedSemester(semester);
    loadSemesterData(academicYear, semester);
  };

  const handleEnrollSuccess = () => {
    // Refresh data
    if (selectedYear && selectedSemester) {
      loadSemesterData(selectedYear, selectedSemester);
      if (userRole === 'student') {
        loadEnrolledClasses();
      }
    }
  };

  return (
    <div className={className}>
      {/* Semester Selector */}
      <div className="mb-6">
        <ModernSemesterSelector 
          selectedYear={selectedYear} 
          selectedSemester={selectedSemester}
          onYearChange={setSelectedYear}
          onSemesterChange={setSelectedSemester}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Semester Data */}
      {semesterData && !loading && (
        <div>
          {/* Summary */}
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-2">
              {semesterData.academicYear} - {semesterData.semesterName}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold text-blue-800">Khóa học</div>
                <div className="text-blue-600">{semesterData.summary.totalCourses}</div>
              </div>
              <div>
                <div className="font-semibold text-blue-800">Lớp học</div>
                <div className="text-blue-600">{semesterData.summary.totalClasses}</div>
              </div>
              <div>
                <div className="font-semibold text-blue-800">Tổng chỗ</div>
                <div className="text-blue-600">{semesterData.summary.totalStudentSlots}</div>
              </div>
              <div>
                <div className="font-semibold text-blue-800">Đã đăng ký</div>
                <div className="text-blue-600">{semesterData.summary.occupiedSlots}</div>
              </div>
            </div>
          </Card>

          {/* Courses and Classes */}
          {semesterData.courses.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-medium mb-2">Chưa có khóa học nào</h3>
                <p>Không có khóa học nào trong học kỳ này.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {semesterData.courses.filter(course => course && course._id).map((course) => (
                <Card key={course._id} className="p-6">
                  {/* Course Header */}
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {course.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {course.code}
                          </span>
                          <span>{course.credits} tín chỉ</span>
                          {course.teacher && (
                            <span>GV: {course.teacher.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {course.status === 'active' ? 'Đang hoạt động' : course.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2">{course.description}</p>
                  </div>

                  {/* Classes */}
                  {course.classes && course.classes.length > 0 ? (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Danh sách lớp học ({course.classes.length} lớp)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {course.classes.filter(classInfo => classInfo && classInfo._id).map((classInfo) => (
                          <ClassCard
                            key={classInfo._id}
                            classInfo={{
                              ...classInfo,
                              course: {
                                _id: course._id,
                                name: course.name,
                                code: course.code,
                                academicYear: course.academicYear,
                                semester: course.semester,
                                credits: course.credits
                              },
                              teacher: course.teacher,
                              students: [], // Will be populated by API if needed
                              schedule: Array.isArray(classInfo.schedule) ? classInfo.schedule : [classInfo.schedule],
                              status: (classInfo.status as any) || 'active',
                              createdAt: (classInfo as any).createdAt || new Date().toISOString()
                            }}
                            isEnrolled={enrolledClasses.includes(classInfo._id)}
                            showEnrollButton={showEnrollButton && userRole === 'student'}
                            showTeacherInfo={false} // Already shown in course header
                            onEnrollSuccess={handleEnrollSuccess}
                            onUnenrollSuccess={handleEnrollSuccess}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-2xl mb-2">🏫</div>
                      <p>Chưa có lớp học nào</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No semester selected */}
      {!selectedYear && !selectedSemester && !loading && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium mb-2">Chọn học kỳ</h3>
            <p>Vui lòng chọn năm học và học kỳ để xem danh sách khóa học.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
