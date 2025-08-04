const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'essay', 'fill-blank'],
    required: [true, 'Vui lòng chọn loại câu hỏi']
  },
  question: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung câu hỏi'],
    trim: true
  },
  options: [{
    type: String,
    trim: true
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // String, Number, or Boolean
    required: function() {
      return this.type !== 'essay'; // Essay questions can have optional answer hints
    }
  },
  points: {
    type: Number,
    required: [true, 'Vui lòng nhập điểm số'],
    min: [0, 'Điểm số không được âm'],
    max: [100, 'Điểm số không được quá 100']
  },
  explanation: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề bài kiểm tra'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được quá 200 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả bài kiểm tra'],
    maxlength: [1000, 'Mô tả không được quá 1000 ký tự']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Bài kiểm tra phải thuộc về một khóa học']
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Bài kiểm tra phải có giảng viên']
  },
  questions: [questionSchema],
  duration: {
    type: Number,
    required: [true, 'Vui lòng nhập thời gian làm bài (phút)'],
    min: [1, 'Thời gian làm bài phải ít nhất 1 phút'],
    max: [480, 'Thời gian làm bài không được quá 8 giờ']
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'completed'],
    default: 'draft'
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  showResultsImmediately: {
    type: Boolean,
    default: false
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total points from questions
examSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  }
  next();
});

// Virtual for submission count
examSchema.virtual('submissionCount', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'exam',
  count: true
});

// Virtual for isActive (compatibility with frontend)
examSchema.virtual('isActive').get(function() {
  return this.status === 'active' || this.status === 'published';
});

// Index for better performance
examSchema.index({ course: 1, status: 1 });
examSchema.index({ teacher: 1, status: 1 });
examSchema.index({ startTime: 1, endTime: 1 });

module.exports = mongoose.model('Exam', examSchema);
