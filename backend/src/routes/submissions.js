const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { examLimiter } = require('../middleware/error');

// Import controllers
const {
  submitExam,
  getSubmissions,
  getSubmission,
  gradeSubmission,
  getExamSubmissions,
  startExam,
  submitExamAnswers
} = require('../controllers/submissionController');

const router = express.Router();

// Validation rules
const submissionValidation = [
  body('examId')
    .isMongoId()
    .withMessage('Exam ID không hợp lệ'),
  body('answers')
    .isArray()
    .withMessage('Answers phải là một mảng')
];

// Routes
router.route('/')
  .get(protect, getSubmissions)
  .post(protect, authorize('student'), submissionValidation, submitExam);

router.route('/:id')
  .get(protect, getSubmission);

router.put('/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);

// Submit answers for a specific submission
router.post('/:submissionId/submit', protect, authorize('student'), submitExamAnswers);

// Get submissions for specific exam
router.get('/exam/:examId', protect, authorize('teacher', 'admin'), getExamSubmissions);

module.exports = router;
