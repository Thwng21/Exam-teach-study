const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');
const emailService = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, studentId, department } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email đã được sử dụng'
    });
  }

  // Validate student ID for students
  if (role === 'student' && !studentId) {
    return res.status(400).json({
      success: false,
      message: 'Mã sinh viên là bắt buộc đối với tài khoản sinh viên'
    });
  }

  // Check if student ID already exists
  if (studentId) {
    const existingStudent = await User.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Mã sinh viên đã được sử dụng'
      });
    }
  }

  // Create user
  const userData = {
    firstName,
    lastName,
    email,
    password,
    role: role || 'student'
  };

  // Add optional fields
  if (studentId) userData.studentId = studentId;
  if (department) userData.department = department;

  const user = await User.create(userData);

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  user.password = undefined;

  res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    data: {
      user,
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập email và mật khẩu'
    });
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không đúng'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Tài khoản đã bị vô hiệu hóa'
    });
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không đúng'
    });
  }

  // Update last login
  await user.updateLastLogin();

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công',
    data: {
      user,
      token
    }
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('courses', 'name code');

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    department: req.body.department
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Cập nhật thông tin thành công',
    data: {
      user
    }
  });
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới'
    });
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu hiện tại không đúng'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Đổi mật khẩu thành công',
    data: {
      token
    }
  });
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email là bắt buộc'
    });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not for security
    return res.status(200).json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi'
    });
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  
  // Save user with reset token
  await user.save({ validateBeforeSave: false });

  try {
    // Send email
    const emailResult = await emailService.sendForgotPasswordEmail(email, resetToken);
    
    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'Email hướng dẫn đặt lại mật khẩu đã được gửi'
      });
    } else {
      throw new Error(emailResult.error);
    }
  } catch (error) {
    // Reset the token if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('❌ Error sending email:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Không thể gửi email. Vui lòng thử lại sau'
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      success: false,
      message: 'Token và mật khẩu là bắt buộc'
    });
  }

  // Get hashed token
  const resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user by reset token and check if not expired
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();

  // Generate new token for automatic login
  const jwtToken = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Đặt lại mật khẩu thành công',
    data: {
      token: jwtToken
    }
  });
});

// @desc    Verify email exists
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email là bắt buộc'
    });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Email không tồn tại trong hệ thống'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Email hợp lệ'
  });
});

// @desc    Reset password directly (without token)
// @route   PUT /api/auth/reset-password-direct
// @access  Public
exports.resetPasswordDirect = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email và mật khẩu mới là bắt buộc'
    });
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Người dùng không tồn tại'
    });
  }

  // Set new password
  user.password = newPassword;
  await user.save();

  // Generate new token for automatic login
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Đặt lại mật khẩu thành công',
    data: {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    }
  });
});
