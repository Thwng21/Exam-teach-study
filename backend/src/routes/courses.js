const express = require('express');
const { body } = require('express-validator');
const {
  getCourses,
  getAllAvailableCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
  getCourseStudents
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const courseValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Tên khóa học phải có từ 2-200 ký tự'),
  body('code')
    .trim()
    .isLength({ min: 2, max: 20 })
    .isAlphanumeric()
    .withMessage('Mã khóa học phải có từ 2-20 ký tự và chỉ chứa chữ và số'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Mô tả không được vượt quá 1000 ký tự'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái hoạt động phải là true hoặc false')
];

// Routes
router.route('/')
  .get(protect, getCourses)
  .post(protect, authorize('teacher', 'admin'), courseValidation, createCourse);

// Get all available courses (for student enrollment)
router.get('/available', protect, getAllAvailableCourses);

// Get courses for current user (teacher: owned courses, student: enrolled courses)
router.get('/my', protect, getCourses);

router.route('/:id')
  .get(protect, getCourse)
  .put(protect, authorize('teacher', 'admin'), updateCourse)
  .delete(protect, authorize('teacher', 'admin'), deleteCourse);

// Get exams for a specific course
router.get('/:id/exams', protect, async (req, res) => {
  try {
    const Exam = require('../models/Exam');
    const Course = require('../models/Course');
    
    // Check if course exists and user has access
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }
    
    // Check access permissions
    const hasAccess = 
      req.user.role === 'admin' ||
      course.teacher.toString() === req.user._id.toString() ||
      course.students.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập khóa học này'
      });
    }
    
    // Get exams for this course
    const exams = await Exam.find({ course: req.params.id })
      .populate('teacher', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        exams
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

router.route('/:id/enroll')
  .post(protect, authorize('student'), enrollCourse)
  .delete(protect, authorize('student'), unenrollCourse);

router.get('/:id/students', protect, authorize('teacher', 'admin'), getCourseStudents);

module.exports = router;
