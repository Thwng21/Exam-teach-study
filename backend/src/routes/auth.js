const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/error');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Họ phải có từ 1-50 ký tự'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tên phải có từ 1-50 ký tự'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('role')
    .optional()
    .isIn(['teacher', 'student'])
    .withMessage('Vai trò không hợp lệ'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Mã sinh viên không được quá 20 ký tự'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tên khoa/bộ môn không được quá 100 ký tự')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
];

// Routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/password', protect, updatePassword);

module.exports = router;
