const Course = require('../models/Course');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = asyncHandler(async (req, res) => {
  let query = {};

  // If user is teacher, only show their courses
  if (req.user.role === 'teacher') {
    query.teacher = req.user._id;
  }
  // If user is student, only show enrolled courses
  else if (req.user.role === 'student') {
    query.students = req.user._id;
  }

  const courses = await Course.find(query)
    .populate('teacher', 'name email')
    .populate('students', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: {
      courses
    }
  });
});

// @desc    Get all available courses (for student enrollment)
// @route   GET /api/courses/available
// @access  Private
exports.getAllAvailableCourses = asyncHandler(async (req, res) => {
  // Get all active courses
  const courses = await Course.find({ status: 'active' })
    .populate('teacher', 'firstName lastName name email')
    .populate('students', 'firstName lastName name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: {
      courses
    }
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('teacher', 'name email')
    .populate('students', 'name email')
    .populate('exams');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy khóa học'
    });
  }

  // Check access permissions
  const hasAccess = 
    req.user.role === 'admin' ||
    course.teacher._id.toString() === req.user._id.toString() ||
    course.students.some(student => student._id.toString() === req.user._id.toString());

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập khóa học này'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      course
    }
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Teacher, Admin)
exports.createCourse = asyncHandler(async (req, res) => {
  // Add teacher to req.body
  req.body.teacher = req.user._id;

  // Convert isActive to status for compatibility
  if (req.body.isActive !== undefined) {
    req.body.status = req.body.isActive ? 'active' : 'draft';
    delete req.body.isActive;
  }

  const course = await Course.create(req.body);

  // Populate teacher info
  await course.populate('teacher', 'name email');

  res.status(201).json({
    success: true,
    message: 'Tạo khóa học thành công',
    data: {
      course
    }
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Course owner, Admin)
exports.updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy khóa học'
    });
  }

  // Check ownership
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền chỉnh sửa khóa học này'
    });
  }

  // Convert isActive to status for compatibility
  if (req.body.isActive !== undefined) {
    req.body.status = req.body.isActive ? 'active' : 'draft';
    delete req.body.isActive;
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('teacher', 'name email');

  res.status(200).json({
    success: true,
    message: 'Cập nhật khóa học thành công',
    data: {
      course
    }
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Course owner, Admin)
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy khóa học'
    });
  }

  // Check ownership
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xóa khóa học này'
    });
  }

  await Course.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Xóa khóa học thành công'
  });
});

// @desc    Enroll student in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
exports.enrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy khóa học'
    });
  }

  // Check if course is active
  if (course.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Khóa học chưa được kích hoạt'
    });
  }

  // Check if already enrolled
  if (course.students.includes(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'Bạn đã đăng ký khóa học này'
    });
  }

  // Check max students limit
  if (course.students.length >= course.maxStudents) {
    return res.status(400).json({
      success: false,
      message: 'Khóa học đã đầy'
    });
  }

  // Add student to course
  course.students.push(req.user._id);
  await course.save();

  // Add course to user's courses
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { courses: course._id }
  });

  res.status(200).json({
    success: true,
    message: 'Đăng ký khóa học thành công'
  });
});

// @desc    Unenroll student from course
// @route   DELETE /api/courses/:id/enroll
// @access  Private (Student)
exports.unenrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy khóa học'
    });
  }

  // Check if enrolled
  if (!course.students.includes(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'Bạn chưa đăng ký khóa học này'
    });
  }

  // Remove student from course
  course.students = course.students.filter(
    student => student.toString() !== req.user._id.toString()
  );
  await course.save();

  // Remove course from user's courses
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { courses: course._id }
  });

  res.status(200).json({
    success: true,
    message: 'Hủy đăng ký khóa học thành công'
  });
});

// @desc    Get course students
// @route   GET /api/courses/:id/students
// @access  Private (Course owner, Admin)
exports.getCourseStudents = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('students', 'name email lastLogin createdAt');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy khóa học'
    });
  }

  // Check ownership
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xem danh sách sinh viên'
    });
  }

  res.status(200).json({
    success: true,
    count: course.students.length,
    data: course.students
  });
});
