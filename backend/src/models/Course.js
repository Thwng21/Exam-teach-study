const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên khóa học'],
    trim: true,
    maxlength: [200, 'Tên khóa học không được quá 200 ký tự']
  },
  code: {
    type: String,
    required: [true, 'Vui lòng nhập mã khóa học'],
    uppercase: true,
    trim: true,
    maxlength: [20, 'Mã khóa học không được quá 20 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả khóa học'],
    maxlength: [1000, 'Mô tả không được quá 1000 ký tự']
  },
  // Thông tin năm học và học kỳ
  academicYear: {
    type: String,
    required: [true, 'Vui lòng chọn năm học'],
    match: [/^\d{4}-\d{4}$/, 'Năm học phải có định dạng YYYY-YYYY (ví dụ: 2024-2025)']
  },
  semester: {
    type: String,
    required: [true, 'Vui lòng chọn học kỳ'],
    enum: {
      values: ['HK1', 'HK2', 'HK_HE'],
      message: 'Học kỳ phải là HK1, HK2 hoặc HK_HE'
    }
  },
  // Thông tin chi tiết khóa học
  credits: {
    type: Number,
    required: [true, 'Vui lòng nhập số tín chỉ'],
    min: [1, 'Số tín chỉ phải lớn hơn 0'],
    max: [10, 'Số tín chỉ không được quá 10']
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Khóa học phải có giảng viên']
  },
  // Bỏ students khỏi Course vì students sẽ thuộc về Class
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for classes
courseSchema.virtual('classes', {
  ref: 'Class',
  localField: '_id',
  foreignField: 'course'
});

// Virtual for total students (tính từ tất cả các lớp)
courseSchema.virtual('totalStudents').get(function() {
  if (!this.classes || !Array.isArray(this.classes)) return 0;
  return this.classes.reduce((total, cls) => total + (cls.studentCount || 0), 0);
});

// Virtual for student count (compatibility)
courseSchema.virtual('studentCount').get(function() {
  return this.totalStudents;
});

// Virtual for isActive (compatibility)
courseSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Virtual for exams
courseSchema.virtual('exams', {
  ref: 'Exam',
  localField: '_id',
  foreignField: 'course'
});

// Index for better performance
courseSchema.index({ teacher: 1, status: 1 });
courseSchema.index({ academicYear: 1, semester: 1 });
courseSchema.index({ academicYear: 1, semester: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);
