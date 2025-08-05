const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên lớp học'],
    trim: true,
    maxlength: [100, 'Tên lớp học không được quá 100 ký tự']
  },
  code: {
    type: String,
    required: [true, 'Vui lòng nhập mã lớp học'],
    trim: true,
    maxlength: [20, 'Mã lớp học không được quá 20 ký tự']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Lớp học phải thuộc về một khóa học']
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Lớp học phải có giảng viên']
  },
  students: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  schedule: [{
    dayOfWeek: {
      type: Number,
      min: 1,
      max: 7, // 1 = Chủ nhật, 2 = Thứ 2, ..., 7 = Thứ 7
      required: [true, 'Vui lòng chọn thứ trong tuần']
    },
    startTime: {
      type: String,
      required: [true, 'Vui lòng nhập giờ bắt đầu'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ không hợp lệ (HH:MM)']
    },
    endTime: {
      type: String,
      required: [true, 'Vui lòng nhập giờ kết thúc'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ không hợp lệ (HH:MM)']
    },
    room: {
      type: String,
      required: [true, 'Vui lòng nhập phòng học'],
      trim: true,
      maxlength: [50, 'Tên phòng học không được quá 50 ký tự']
    }
  }],
  maxStudents: {
    type: Number,
    default: 50,
    min: [1, 'Số lượng sinh viên tối đa phải lớn hơn 0']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for student count
classSchema.virtual('studentCount').get(function() {
  return Array.isArray(this.students) ? this.students.length : 0;
});

// Virtual for availability
classSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.studentCount < this.maxStudents;
});

// Compound index for uniqueness within course
classSchema.index({ course: 1, code: 1 }, { unique: true });
classSchema.index({ teacher: 1, status: 1 });

module.exports = mongoose.model('Class', classSchema);
