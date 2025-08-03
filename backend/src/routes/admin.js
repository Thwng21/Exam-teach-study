const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Exam = require('../models/Exam');
const { protect: auth } = require('../middleware/auth');

// Middleware kiểm tra quyền admin
const adminAuth = (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes working!' });
});

// Lấy tất cả người dùng
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Lấy thông tin một người dùng
router.get('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Cập nhật thông tin người dùng
router.put('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, role, isVerified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, role, isVerified },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Xóa người dùng
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Tạo người dùng mới
router.post('/users', auth, adminAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      isVerified: true
    });
    
    await user.save();
    
    const userResponse = await User.findById(user._id).select('-password');
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Lấy tất cả khóa học
router.get('/courses', auth, adminAuth, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Lấy tất cả bài thi
router.get('/exams', auth, adminAuth, async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('course', 'name code')
      .populate('teacher', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({ exams });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Thống kê tổng quan
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalExams,
      totalSubmissions,
      students,
      teachers,
      activeCourses,
      activeExams
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Exam.countDocuments(),
      Submission.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Course.countDocuments({ isActive: true }),
      Exam.countDocuments({ isActive: true })
    ]);
    
    res.json({
      totalUsers,
      totalCourses,
      totalExams,
      totalSubmissions,
      totalStudents: students,
      totalTeachers: teachers,
      activeCourses,
      activeExams
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
