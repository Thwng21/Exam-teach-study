'use client';

import { useState } from 'react';
import { classService, Class } from '@/services/classService';
import Card from './Card';
import Button from './Button';

interface ClassCardProps {
  classInfo: Class;
  isEnrolled?: boolean;
  showEnrollButton?: boolean;
  showTeacherInfo?: boolean;
  onEnrollSuccess?: () => void;
  onUnenrollSuccess?: () => void;
  className?: string;
}

export default function ClassCard({
  classInfo,
  isEnrolled = false,
  showEnrollButton = false,
  showTeacherInfo = true,
  onEnrollSuccess,
  onUnenrollSuccess,
  className = ''
}: ClassCardProps) {
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    try {
      setLoading(true);
      await classService.enrollClass(classInfo._id);
      onEnrollSuccess?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký lớp học');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy đăng ký lớp học này?')) {
      return;
    }

    try {
      setLoading(true);
      await classService.unenrollClass(classInfo._id);
      onUnenrollSuccess?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi hủy đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'draft':
        return 'Nháp';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const isClassFull = classInfo.studentCount >= classInfo.maxStudents;
  const canEnroll = classInfo.status === 'active' && !isClassFull && !isEnrolled;

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-lg text-gray-900">
            {classInfo.name}
          </h4>
          <p className="text-sm text-gray-600 font-mono">
            {classInfo.code}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classInfo.status)}`}>
          {getStatusText(classInfo.status)}
        </span>
      </div>

      {/* Course Info */}
      {classInfo.course && typeof classInfo.course === 'object' && (
        <div className="mb-3 p-2 bg-gray-50 rounded">
          <div className="text-sm font-medium text-gray-900">
            {classInfo.course.name} {classInfo.course.credits ? `(${classInfo.course.credits} tín chỉ)` : ''}
          </div>
          <div className="text-xs text-gray-600">
            {classInfo.course.code} {classInfo.course.academicYear ? `- ${classInfo.course.academicYear}` : ''} - {classService.getDayName(0)}
          </div>
        </div>
      )}

      {/* Schedule Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <span className="w-16 text-gray-600">Lịch học:</span>
          <span className="font-medium">
            {classInfo.schedule && classInfo.schedule.length > 0 
              ? classService.formatSchedule(classInfo.schedule[0])
              : 'Chưa có lịch học'
            }
          </span>
        </div>

        {showTeacherInfo && classInfo.teacher && (
          <div className="flex items-center text-sm">
            <span className="w-16 text-gray-600">Giảng viên:</span>
            <span>{classInfo.teacher.name}</span>
          </div>
        )}

        <div className="flex items-center text-sm">
          <span className="w-16 text-gray-600">Sĩ số:</span>
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${isClassFull ? 'text-red-600' : 'text-green-600'}`}>
              {classInfo.studentCount}/{classInfo.maxStudents}
            </span>
            {isClassFull && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Đã đầy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showEnrollButton && (
        <div className="flex gap-2">
          {!isEnrolled ? (
            <Button
              onClick={handleEnroll}
              disabled={!canEnroll || loading}
              className={`flex-1 ${
                canEnroll 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Đang xử lý...' : 
               isClassFull ? 'Lớp đã đầy' :
               classInfo.status !== 'active' ? 'Không khả dụng' :
               'Đăng ký lớp này'}
            </Button>
          ) : (
            <Button
              onClick={handleUnenroll}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Đang xử lý...' : 'Hủy đăng ký'}
            </Button>
          )}
        </div>
      )}

      {/* Enrolled Badge */}
      {isEnrolled && !showEnrollButton && (
        <div className="mt-2">
          <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
            ✓ Đã đăng ký
          </span>
        </div>
      )}
    </Card>
  );
}
