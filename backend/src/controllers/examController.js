const Exam = require('../models/Exam');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const { asyncHandler } = require('../middleware/error');

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private (Teacher only)
exports.createExam = asyncHandler(async (req, res) => {
  // Add teacher ID to req.body
  req.body.teacher = req.user.id;

  // Verify course belongs to teacher
  const course = await Course.findById(req.body.course);
  if (!course || course.teacher.toString() !== req.user.id) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy khóa học hoặc bạn không có quyền'
    });
  }

  const exam = await Exam.create(req.body);
  await exam.populate('course', 'name code');

  res.status(201).json({
    success: true,
    message: 'Tạo bài thi thành công',
    data: {
      exam
    }
  });
});

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
exports.getExams = asyncHandler(async (req, res) => {
  let query = {};

  // If student, show all active exams (simplified for now)
  if (req.user.role === 'student') {
    query = {
      status: { $in: ['active', 'published'] }
    };
    
    console.log('Query for student exams (simplified):', query);
  }
  
  // If teacher, only show their exams
  if (req.user.role === 'teacher') {
    query.teacher = req.user.id;
  }

  const exams = await Exam.find(query)
    .populate('course', 'name code')
    .populate('teacher', 'firstName lastName')
    .sort({ createdAt: -1 });

  console.log('Found exams:', exams.length);
  console.log('Exams data:', exams);

  res.status(200).json({
    success: true,
    count: exams.length,
    data: {
      exams
    }
  });
});

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Private
exports.getExam = asyncHandler(async (req, res) => {
  let exam = await Exam.findById(req.params.id)
    .populate('course', 'name code')
    .populate('teacher', 'firstName lastName');

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài thi'
    });
  }

  // Check permissions
  if (req.user.role === 'student') {
    // Students can only see active exams
    if (!exam.isActive || exam.endTime < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Bài thi không khả dụng'
      });
    }
    
    // Remove correct answers for students
    exam.questions = exam.questions.map(q => ({
      ...q.toObject(),
      correctAnswer: undefined
    }));
  } else if (req.user.role === 'teacher' && exam.teacher.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập bài thi này'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      exam
    }
  });
});

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Teacher only)
exports.updateExam = asyncHandler(async (req, res) => {
  let exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài thi'
    });
  }

  // Check if user owns the exam
  if (exam.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền cập nhật bài thi này'
    });
  }

  exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('course', 'name code');

  res.status(200).json({
    success: true,
    message: 'Cập nhật bài thi thành công',
    data: {
      exam
    }
  });
});

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Teacher only)
exports.deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài thi'
    });
  }

  // Check if user owns the exam
  if (exam.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xóa bài thi này'
    });
  }

  await exam.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Xóa bài thi thành công'
  });
});

// @desc    Get exam statistics
// @route   GET /api/exams/:id/stats
// @access  Private (Teacher only)
exports.getExamStats = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài thi'
    });
  }

  if (exam.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xem thống kê bài thi này'
    });
  }

  const submissions = await Submission.find({ exam: req.params.id })
    .populate('student', 'firstName lastName studentId');

  const stats = {
    totalSubmissions: submissions.length,
    averageScore: submissions.length > 0 
      ? submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length 
      : 0,
    highestScore: submissions.length > 0 
      ? Math.max(...submissions.map(sub => sub.score)) 
      : 0,
    lowestScore: submissions.length > 0 
      ? Math.min(...submissions.map(sub => sub.score)) 
      : 0,
    passRate: submissions.length > 0 
      ? (submissions.filter(sub => sub.score >= (exam.passingScore || 5)).length / submissions.length) * 100 
      : 0
  };

  res.status(200).json({
    success: true,
    data: {
      stats,
      submissions
    }
  });
});
