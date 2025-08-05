const express = require('express');
const { body } = require('express-validator');
const {
  getCourses,
  getCoursesDebug,
  getAllAvailableCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
  getCourseStudents,
  getAcademicYears,
  getSemesters,
  getCoursesBySemester
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
  body('academicYear')
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Năm học phải có định dạng YYYY-YYYY (ví dụ: 2024-2025)'),
  body('semester')
    .isIn(['HK1', 'HK2', 'HK_HE'])
    .withMessage('Học kỳ phải là HK1, HK2 hoặc HK_HE'),
  body('credits')
    .isInt({ min: 1, max: 10 })
    .withMessage('Số tín chỉ phải từ 1-10'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'archived'])
    .withMessage('Trạng thái phải là draft, active hoặc archived')
];

// Routes - Đặt các routes specific trước routes với parameter
// Debug route
router.get('/debug', protect, getCoursesDebug);

// New routes for academic year and semester management
router.get('/academic-years', getAcademicYears);
router.get('/semesters', getSemesters);
router.get('/by-semester', getCoursesBySemester);

// Get all available courses (for student enrollment)
router.get('/available', protect, getAllAvailableCourses);

// Get courses for current user (teacher: owned courses, student: enrolled courses)
router.get('/my', protect, getCourses);

// GET /courses/all-classes-test - Get all classes for debugging/cross-course view
router.get('/all-classes-test', async (req, res) => {
  try {
    console.log('=== GET /courses/all-classes-test START ===');
    
    const Class = require('../models/Class');
    const Course = require('../models/Course');
    
    // Get all classes with course info populated
    const allClasses = await Class.find()
      .populate({
        path: 'course',
        select: 'name code _id'
      })
      .populate({
        path: 'teacher',
        select: 'name email _id'
      })
      .sort({ createdAt: -1 });

    console.log('Total classes found:', allClasses.length);
    
    // Group classes by course
    const classesByCourse = {};
    allClasses.forEach(cls => {
      const courseId = cls.course?._id?.toString() || 'unknown';
      if (!classesByCourse[courseId]) {
        classesByCourse[courseId] = {
          course: cls.course,
          classes: []
        };
      }
      classesByCourse[courseId].classes.push(cls);
    });

    console.log('Classes grouped by course:', Object.keys(classesByCourse).length, 'courses');
    console.log('=== GET /courses/all-classes-test END ===');

    res.json({
      success: true,
      data: {
        allClasses,
        classesByCourse
      }
    });
  } catch (error) {
    console.error('Error in GET /courses/all-classes-test:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

router.route('/')
  .get(protect, getCourses)
  .post(protect, authorize('teacher', 'admin'), courseValidation, createCourse);

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

// Get classes for a specific course (temp without auth for testing)
router.get('/:id/classes-test', async (req, res) => {
  try {
    console.log('=== GET /courses/:id/classes-test START ===');
    console.log('GET /courses/:id/classes-test called with ID:', req.params.id);
    const Course = require('../models/Course');
    const Class = require('../models/Class');
    
    // Get ALL classes in database first
    const allClasses = await Class.find({});
    console.log('Total classes in database:', allClasses.length);
    allClasses.forEach(cls => {
      console.log('- Class:', cls.name, 'Code:', cls.code, 'Course:', cls.course.toString());
    });
    
    // Get classes for this specific course
    console.log('Looking for classes with course ID:', req.params.id);
    const classes = await Class.find({ course: req.params.id })
      .populate('teacher', 'name email')
      .populate('course', 'name code')
      .sort({ createdAt: -1 });

    console.log('Classes found for this course:', classes.length);
    console.log('Classes data (test route):', classes);
    console.log('=== GET /courses/:id/classes-test END ===');

    res.status(200).json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error in GET /courses/:id/classes-test:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get classes for a specific course
router.get('/:id/classes', protect, async (req, res) => {
  try {
    console.log('GET /courses/:id/classes called with ID:', req.params.id);
    const Course = require('../models/Course');
    
    // Check if course exists and user has access
    const course = await Course.findById(req.params.id);
    if (!course) {
      console.log('Course not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }
    
    console.log('Course found:', course.name);
    
    // Check access permissions
    const hasAccess = 
      req.user.role === 'admin' ||
      course.teacher.toString() === req.user._id.toString() ||
      course.students.includes(req.user._id);

    if (!hasAccess) {
      console.log('Access denied for user:', req.user._id, 'Course teacher:', course.teacher);
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập khóa học này'
      });
    }
    
    // Get classes for this course from database
    const Class = require('../models/Class');
    const classes = await Class.find({ course: req.params.id })
      .populate('teacher', 'name email')
      .populate('course', 'name code')
      .sort({ createdAt: -1 });

    console.log('Classes found:', classes.length);
    console.log('Classes data:', classes);

    res.status(200).json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error in GET /courses/:id/classes:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// POST /courses/:id/classes-test - Create new class for a course (no auth for testing)
router.post('/:id/classes-test', async (req, res) => {
  try {
    console.log('POST /courses/:id/classes-test called with ID:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const Course = require('../models/Course');
    const Class = require('../models/Class');
    
    // Check if course exists
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    const { name, code, schedule, maxStudents } = req.body;

    // Validate required fields
    if (!name || !code || !schedule) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin: tên lớp, mã lớp, lịch học'
      });
    }

    // Check if class code already exists
    const existingClass = await Class.findOne({ code: code.toUpperCase() });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Mã lớp học đã tồn tại'
      });
    }

    // Create new class
    const newClass = new Class({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      course: req.params.id,
      teacher: course.teacher, // Use course teacher
      schedule: schedule, // Now supports array
      maxStudents: maxStudents || 30,
      status: 'active'
    });

    await newClass.save();

    // Populate course and teacher info for response
    await newClass.populate([
      { path: 'course', select: 'name code' },
      { path: 'teacher', select: 'name email' }
    ]);

    console.log('Class created successfully:', newClass);

    res.status(201).json({
      success: true,
      data: newClass,
      message: 'Tạo lớp học thành công'
    });
  } catch (error) {
    console.error('Error creating class (test):', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ: ' + errors.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// POST /courses/:id/classes - Create new class for a course
router.post('/:id/classes', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const Course = require('../models/Course');
    const Class = require('../models/Class');
    
    // Check if course exists and user has access
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    // Check if user is teacher of this course or admin
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền tạo lớp học cho khóa học này'
      });
    }

    const { name, code, schedule, maxStudents } = req.body;

    // Validate required fields
    if (!name || !code || !schedule) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin: tên lớp, mã lớp, lịch học'
      });
    }

    // Check if class code already exists
    const existingClass = await Class.findOne({ code: code.toUpperCase() });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Mã lớp học đã tồn tại'
      });
    }

    // Create new class
    const newClass = new Class({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      course: req.params.id,
      teacher: course.teacher, // Use course teacher
      schedule: schedule, // Now supports array
      maxStudents: maxStudents || 30,
      status: 'active'
    });

    await newClass.save();

    // Populate course and teacher info for response
    await newClass.populate([
      { path: 'course', select: 'name code' },
      { path: 'teacher', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: newClass,
      message: 'Tạo lớp học thành công'
    });
  } catch (error) {
    console.error('Error creating class:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ: ' + errors.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

router.get('/:id/students', protect, authorize('teacher', 'admin'), getCourseStudents);

module.exports = router;
