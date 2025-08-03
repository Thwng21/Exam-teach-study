const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed, // Can be String, Number, Boolean, or Array
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 0
  }
});

const submissionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.ObjectId,
    ref: 'Exam',
    required: [true, 'Bài nộp phải thuộc về một bài kiểm tra']
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Bài nộp phải có sinh viên']
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'graded', 'late'],
    default: 'in_progress'
  },
  attempt: {
    type: Number,
    default: 1,
    min: 1
  },
  isLate: {
    type: Boolean,
    default: false
  },
  gradedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  gradedAt: {
    type: Date,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate score and percentage
submissionSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    this.score = this.answers.reduce((total, answer) => total + (answer.points || 0), 0);
    
    if (this.totalPoints > 0) {
      this.percentage = Math.round((this.score / this.totalPoints) * 100);
    }
  }
  next();
});

// Update submitted time and status
submissionSchema.methods.submit = function() {
  this.submittedAt = new Date();
  this.status = 'submitted';
  
  // Calculate time spent
  if (this.startedAt) {
    this.timeSpent = Math.round((this.submittedAt - this.startedAt) / (1000 * 60)); // minutes
  }
  
  return this.save();
};

// Grade submission
submissionSchema.methods.grade = function(graderId, feedback = '') {
  this.status = 'graded';
  this.gradedBy = graderId;
  this.gradedAt = new Date();
  this.feedback = feedback;
  
  return this.save();
};

// Index for better performance
submissionSchema.index({ exam: 1, student: 1 });
submissionSchema.index({ student: 1, submittedAt: -1 });
submissionSchema.index({ exam: 1, status: 1 });

// Ensure unique submission per exam per student per attempt
submissionSchema.index({ exam: 1, student: 1, attempt: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
