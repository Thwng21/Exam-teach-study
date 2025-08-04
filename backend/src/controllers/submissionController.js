const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const { asyncHandler } = require('../middleware/error');

// @desc    Submit exam answers
// @route   POST /api/submissions
// @access  Private (Student only)
exports.submitExam = asyncHandler(async (req, res) => {
  const { examId, answers } = req.body;

  // Check if exam exists and is active
  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài thi'
    });
  }

  if (!exam.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Bài thi không còn hoạt động'
    });
  }

  // Check if exam time is valid
  const now = new Date();
  if (now < exam.startTime || now > exam.endTime) {
    return res.status(400).json({
      success: false,
      message: 'Bài thi không trong thời gian cho phép'
    });
  }

  // Check if student already submitted
  const existingSubmission = await Submission.findOne({
    exam: examId,
    student: req.user.id
  });

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: 'Bạn đã nộp bài thi này rồi'
    });
  }

  // Calculate score
  let score = 0;
  const detailedAnswers = [];

  exam.questions.forEach((question, index) => {
    const studentAnswer = answers[index];
    const isCorrect = studentAnswer === question.correctAnswer;
    
    if (isCorrect) {
      score += question.points || 1;
    }

    detailedAnswers.push({
      questionIndex: index,
      question: question.question,
      studentAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      points: isCorrect ? (question.points || 1) : 0
    });
  });

  // Create submission
  const submission = await Submission.create({
    exam: examId,
    student: req.user.id,
    answers: detailedAnswers,
    score,
    submittedAt: new Date()
  });

  await submission.populate('exam', 'title maxScore');

  res.status(201).json({
    success: true,
    message: 'Nộp bài thành công',
    data: {
      submission
    }
  });
});

// @desc    Get student's submissions
// @route   GET /api/submissions
// @access  Private
exports.getSubmissions = asyncHandler(async (req, res) => {
  let query = {};

  // If student, only show their submissions
  if (req.user.role === 'student') {
    query.student = req.user.id;
  }

  // If teacher, show submissions for their exams
  if (req.user.role === 'teacher') {
    const teacherExams = await Exam.find({ teacher: req.user.id }).select('_id');
    const examIds = teacherExams.map(exam => exam._id);
    query.exam = { $in: examIds };
  }

  const submissions = await Submission.find(query)
    .populate('exam', 'title course maxScore')
    .populate('student', 'firstName lastName studentId')
    .populate({
      path: 'exam',
      populate: {
        path: 'course',
        select: 'name code'
      }
    })
    .sort({ submittedAt: -1 });

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: {
      submissions
    }
  });
});

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmission = asyncHandler(async (req, res) => {
  let submission = await Submission.findById(req.params.id)
    .populate('exam', 'title course maxScore')
    .populate('student', 'firstName lastName studentId')
    .populate({
      path: 'exam',
      populate: {
        path: 'course',
        select: 'name code'
      }
    });

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài nộp'
    });
  }

  // Check permissions
  const exam = await Exam.findById(submission.exam._id);
  
  if (req.user.role === 'student') {
    // Students can only see their own submissions
    if (submission.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem bài nộp này'
      });
    }
  } else if (req.user.role === 'teacher') {
    // Teachers can only see submissions for their exams
    if (exam.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem bài nộp này'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      submission
    }
  });
});

// @desc    Update submission score (manual grading)
// @route   PUT /api/submissions/:id/grade
// @access  Private (Teacher only)
exports.gradeSubmission = asyncHandler(async (req, res) => {
  const { score, feedback } = req.body;

  const submission = await Submission.findById(req.params.id)
    .populate('exam');

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài nộp'
    });
  }

  // Check if teacher owns the exam
  const exam = await Exam.findById(submission.exam._id);
  if (exam.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền chấm điểm bài nộp này'
    });
  }

  submission.score = score;
  submission.feedback = feedback;
  submission.gradedAt = new Date();
  submission.gradedBy = req.user.id;

  await submission.save();

  res.status(200).json({
    success: true,
    message: 'Chấm điểm thành công',
    data: {
      submission
    }
  });
});

// @desc    Get submissions for specific exam
// @route   GET /api/exams/:examId/submissions
// @access  Private (Teacher only)
exports.getExamSubmissions = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.examId);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài thi'
    });
  }

  // Check if teacher owns the exam
  if (exam.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xem bài nộp của bài thi này'
    });
  }

  const submissions = await Submission.find({ exam: req.params.examId })
    .populate('student', 'firstName lastName studentId')
    .sort({ submittedAt: -1 });

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: {
      submissions
    }
  });
});

// @desc    Start taking an exam
// @route   GET /api/exams/:examId/take
// @access  Private (Student only)
exports.startExam = asyncHandler(async (req, res) => {
  const examId = req.params.id;

  // Check if exam exists and is active
  const exam = await Exam.findById(examId).populate('course', 'name code');
  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài thi'
    });
  }

  if (exam.status !== 'active' && exam.status !== 'published') {
    return res.status(400).json({
      success: false,
      message: 'Bài thi không còn hoạt động'
    });
  }

  // Check if exam time is valid
  const now = new Date();
  if (exam.startTime && exam.endTime) {
    if (now < exam.startTime) {
      return res.status(400).json({
        success: false,
        message: 'Bài thi chưa bắt đầu'
      });
    }
    if (now > exam.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Bài thi đã kết thúc'
      });
    }
  }

  // Check if student already has a submission
  const existingSubmission = await Submission.findOne({
    exam: examId,
    student: req.user.id
  });

  if (existingSubmission && existingSubmission.status === 'submitted') {
    // Calculate time spent if available
    const timeSpent = existingSubmission.startedAt && existingSubmission.submittedAt 
      ? Math.round((existingSubmission.submittedAt - existingSubmission.startedAt) / (1000 * 60)) 
      : null;

    return res.status(400).json({
      success: false,
      message: 'Bạn đã nộp bài thi này rồi',
      data: {
        submission: {
          _id: existingSubmission._id,
          score: existingSubmission.score,
          submittedAt: existingSubmission.submittedAt,
          timeSpent: timeSpent
        }
      }
    });
  }

  // Create or update submission with start time
  let submission;
  if (existingSubmission && existingSubmission.status === 'in_progress') {
    submission = existingSubmission;
  } else {
    submission = await Submission.create({
      exam: examId,
      student: req.user.id,
      startedAt: new Date(),
      status: 'in_progress'
    });
  }

  // Return exam data without correct answers
  const examData = {
    _id: exam._id,
    title: exam.title,
    description: exam.description,
    course: exam.course,
    duration: exam.duration,
    questions: exam.questions.map((q, index) => ({
      _id: q._id,
      type: q.type,
      question: q.question,
      options: q.options,
      points: q.points,
      order: index
    })),
    startTime: exam.startTime,
    endTime: exam.endTime,
    submissionId: submission._id,
    startedAt: submission.startedAt
  };

  res.status(200).json({
    success: true,
    data: {
      exam: examData
    }
  });
});

// @desc    Submit exam with time tracking
// @route   POST /api/submissions/:submissionId/submit
// @access  Private (Student only)
exports.submitExamAnswers = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  const submissionId = req.params.submissionId;

  // Find submission
  const submission = await Submission.findById(submissionId).populate('exam');
  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài làm'
    });
  }

  // Check ownership
  if (submission.student.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền nộp bài làm này'
    });
  }

  // Check if already submitted
  if (submission.status === 'submitted') {
    return res.status(400).json({
      success: false,
      message: 'Bài làm đã được nộp rồi'
    });
  }

  const exam = submission.exam;
  const now = new Date();

  // Check if exam time is still valid
  if (exam.endTime && now > exam.endTime) {
    submission.status = 'late';
    submission.isLate = true;
  } else {
    submission.status = 'submitted';
  }

  // Calculate time spent
  const timeSpent = Math.floor((now - submission.startedAt) / (1000 * 60)); // in minutes
  submission.timeSpent = timeSpent;
  submission.submittedAt = now;

  // Calculate score
  let totalScore = 0;
  let totalPoints = 0;
  const detailedAnswers = [];

  exam.questions.forEach((question, index) => {
    const studentAnswer = answers[index];
    let isCorrect = false;
    let points = 0;

    totalPoints += question.points || 1;

    // Check answer based on question type
    if (question.type === 'multiple-choice') {
      isCorrect = parseInt(studentAnswer) === parseInt(question.correctAnswer);
    } else if (question.type === 'true-false') {
      isCorrect = studentAnswer === question.correctAnswer;
    } else if (question.type === 'fill-blank') {
      isCorrect = studentAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
    }

    if (isCorrect) {
      points = question.points || 1;
      totalScore += points;
    }

    detailedAnswers.push({
      questionId: question._id,
      answer: studentAnswer,
      isCorrect,
      points
    });
  });

  submission.answers = detailedAnswers;
  submission.score = totalScore;
  submission.totalPoints = totalPoints;
  submission.percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;

  await submission.save();

  res.status(200).json({
    success: true,
    message: submission.isLate ? 'Nộp bài trễ thành công' : 'Nộp bài thành công',
    data: {
      submission: {
        _id: submission._id,
        score: submission.score,
        totalPoints: submission.totalPoints,
        percentage: submission.percentage,
        timeSpent: submission.timeSpent,
        submittedAt: submission.submittedAt,
        isLate: submission.isLate,
        status: submission.status
      }
    }
  });
});
