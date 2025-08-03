const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập. Vui lòng đăng nhập.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ.'
    });
  }
};

// Authorize roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò ${req.user.role} không có quyền truy cập tài nguyên này.`
      });
    }
    next();
  };
};

// Check if user is teacher of the course
exports.checkCourseOwnership = async (req, res, next) => {
  try {
    const Course = require('../models/Course');
    const courseId = req.params.courseId || req.body.course;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID là bắt buộc.'
      });
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học.'
      });
    }

    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập khóa học này.'
      });
    }

    req.course = course;
    next();
  } catch (error) {
    console.error('Course ownership check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra quyền sở hữu khóa học.'
    });
  }
};

// Check if user is enrolled in course (for students)
exports.checkCourseEnrollment = async (req, res, next) => {
  try {
    const Course = require('../models/Course');
    const courseId = req.params.courseId || req.body.course;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID là bắt buộc.'
      });
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học.'
      });
    }

    // Teachers and admins have access to all courses
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      req.course = course;
      return next();
    }

    // Check if student is enrolled
    if (!course.students.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chưa đăng ký khóa học này.'
      });
    }

    req.course = course;
    next();
  } catch (error) {
    console.error('Course enrollment check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra đăng ký khóa học.'
    });
  }
};
