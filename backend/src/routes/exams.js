const express = require('express');
const { body } = require('express-validator');
const { protect, authorize, checkCourseOwnership } = require('../middleware/auth');

// Import controllers
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getExamStats
} = require('../controllers/examController');

const { startExam } = require('../controllers/submissionController');

const router = express.Router();

// Validation rules
const examValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Tiêu đề phải có từ 5-200 ký tự'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Mô tả phải có từ 10-1000 ký tự'),
  body('course')
    .isMongoId()
    .withMessage('Course ID không hợp lệ'),
  body('duration')
    .isInt({ min: 1, max: 480 })
    .withMessage('Thời gian làm bài phải từ 1-480 phút'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Phải có ít nhất 1 câu hỏi')
];

// Routes
router.route('/')
  .get(protect, getExams)
  .post(protect, authorize('teacher', 'admin'), examValidation, createExam);

router.route('/:id')
  .get(protect, getExam)
  .put(protect, authorize('teacher', 'admin'), updateExam)
  .delete(protect, authorize('teacher', 'admin'), deleteExam);

// Take exam endpoint
router.get('/:id/take', protect, authorize('student'), startExam);

router.get('/:id/stats', protect, authorize('teacher', 'admin'), getExamStats);

module.exports = router;
