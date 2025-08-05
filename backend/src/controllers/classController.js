const Class = require('../models/Class');
const Course = require('../models/Course');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');

// @desc    Get all classes (với filter)
// @route   GET /api/classes
// @access  Public
exports.getClasses = asyncHandler(async (req, res, next) => {
  let query = {};
  
  // Filter theo course
  if (req.query.course) {
    query.course = req.query.course;
  }
  
  // Filter theo teacher
  if (req.query.teacher) {
    query.teacher = req.query.teacher;
  }
  
  // Filter theo status
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  const classes = await Class.find(query)
    .populate('course', 'name code academicYear semester')
    .populate('teacher', 'name email')
    .populate('students', 'name email studentId')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: classes.length,
    data: classes
  });
});

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Public
exports.getClass = asyncHandler(async (req, res, next) => {
  const classData = await Class.findById(req.params.id)
    .populate('course', 'name code academicYear semester description')
    .populate('teacher', 'name email')
    .populate('students', 'name email studentId');

  if (!classData) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lớp học'
    });
  }

  res.status(200).json({
    success: true,
    data: classData
  });
});

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Teacher/Admin)
exports.createClass = asyncHandler(async (req, res, next) => {
  // Kiểm tra course có tồn tại không
  const course = await Course.findById(req.body.course);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy khóa học'
    });
  }

  // Thêm teacher từ user đăng nhập
  req.body.teacher = req.user.id;

  // Tạo mã lớp tự động nếu không có
  if (!req.body.code) {
    const classCount = await Class.countDocuments({ course: req.body.course });
    req.body.code = `${course.code}_L${String(classCount + 1).padStart(2, '0')}`;
  }

  const classData = await Class.create(req.body);

  // Populate thông tin để trả về
  await classData.populate('course', 'name code academicYear semester');
  await classData.populate('teacher', 'name email');

  res.status(201).json({
    success: true,
    data: classData
  });
});

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Teacher/Admin)
exports.updateClass = asyncHandler(async (req, res, next) => {
  let classData = await Class.findById(req.params.id);

  if (!classData) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lớp học'
    });
  }

  // Kiểm tra quyền (chỉ teacher của lớp hoặc admin mới được sửa)
  if (classData.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền chỉnh sửa lớp học này'
    });
  }

  classData = await Class.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('course', 'name code academicYear semester')
    .populate('teacher', 'name email')
    .populate('students', 'name email studentId');

  res.status(200).json({
    success: true,
    data: classData
  });
});

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Teacher/Admin)
exports.deleteClass = asyncHandler(async (req, res, next) => {
  const classData = await Class.findById(req.params.id);

  if (!classData) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lớp học'
    });
  }

  // Kiểm tra quyền
  if (classData.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền xóa lớp học này'
    });
  }

  await Class.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Đã xóa lớp học thành công'
  });
});

// @desc    Enroll student to class
// @route   POST /api/classes/:id/enroll
// @access  Private (Student)
exports.enrollClass = asyncHandler(async (req, res, next) => {
  const classData = await Class.findById(req.params.id);

  if (!classData) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lớp học'
    });
  }

  // Kiểm tra lớp có còn chỗ không
  if (classData.studentCount >= classData.maxStudents) {
    return res.status(400).json({
      success: false,
      message: 'Lớp học đã đầy'
    });
  }

  // Kiểm tra sinh viên đã đăng ký chưa
  if (classData.students.includes(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: 'Bạn đã đăng ký lớp học này rồi'
    });
  }

  // Thêm sinh viên vào lớp
  classData.students.push(req.user.id);
  await classData.save();

  res.status(200).json({
    success: true,
    message: 'Đăng ký lớp học thành công'
  });
});

// @desc    Unenroll student from class
// @route   POST /api/classes/:id/unenroll
// @access  Private (Student)
exports.unenrollClass = asyncHandler(async (req, res, next) => {
  const classData = await Class.findById(req.params.id);

  if (!classData) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy lớp học'
    });
  }

  // Kiểm tra sinh viên có trong lớp không
  if (!classData.students.includes(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: 'Bạn chưa đăng ký lớp học này'
    });
  }

  // Xóa sinh viên khỏi lớp
  classData.students = classData.students.filter(
    student => student.toString() !== req.user.id
  );
  await classData.save();

  res.status(200).json({
    success: true,
    message: 'Hủy đăng ký lớp học thành công'
  });
});

// @desc    Get classes by academic year and semester
// @route   GET /api/classes/by-semester
// @access  Public
exports.getClassesBySemester = asyncHandler(async (req, res, next) => {
  const { academicYear, semester } = req.query;

  if (!academicYear || !semester) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp năm học và học kỳ'
    });
  }

  const classes = await Class.find({
    status: 'active'
  })
    .populate({
      path: 'course',
      match: { academicYear, semester, status: 'active' },
      select: 'name code academicYear semester credits description'
    })
    .populate('teacher', 'name email')
    .sort({ 'course.code': 1, code: 1 });

  // Lọc bỏ các lớp có course = null (không match với filter)
  const validClasses = classes.filter(cls => cls.course !== null);

  res.status(200).json({
    success: true,
    count: validClasses.length,
    data: validClasses
  });
});
