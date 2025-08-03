const rateLimit = require('express-rate-limit');

// General rate limiting
exports.generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes rate limiting
exports.authLimiter = process.env.NODE_ENV === 'development' 
  ? (req, res, next) => next() // Bypass in development
  : rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 50, // limit each IP to 50 requests per windowMs
      message: {
        success: false,
        message: 'Quá nhiều lần đăng nhập/đăng ký từ IP này, vui lòng thử lại sau 5 phút.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

// Exam submission rate limiting
exports.examLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute for exam interactions
  message: {
    success: false,
    message: 'Quá nhiều thao tác với bài kiểm tra, vui lòng chậm lại.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Error handler middleware
exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Tài nguyên không tìm thấy';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Dữ liệu đã tồn tại';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token không hợp lệ';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token đã hết hạn';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Lỗi server'
  });
};

// 404 handler
exports.notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy route ${req.originalUrl}`
  });
};

// Async handler wrapper
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
