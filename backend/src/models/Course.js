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
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Mã khóa học không được quá 20 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả khóa học'],
    maxlength: [1000, 'Mô tả không được quá 1000 ký tự']
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Khóa học phải có giảng viên']
  },
  students: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
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
  },
  maxStudents: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for student count
courseSchema.virtual('studentCount').get(function() {
  return Array.isArray(this.students) ? this.students.length : 0;
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

module.exports = mongoose.model('Course', courseSchema);
