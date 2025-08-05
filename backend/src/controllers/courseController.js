const Course = require('../models/Course');
const Class = require('../models/Class');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');

// @desc    Get all courses for debugging
// @route   GET /api/courses/debug
// @access  Private
exports.getCoursesDebug = asyncHandler(async (req, res) => {
  console.log('getCoursesDebug called')
  
  const courses = await Course.find({})
    .populate('teacher', 'name email')
    .sort({ createdAt: -1 });

  console.log('All courses in database:', courses.map(c => ({ 
    id: c._id, 
    name: c.name, 
    code: c.code, 
    academicYear: c.academicYear, 
    semester: c.semester,
    teacher: c.teacher?.name,
    createdAt: c.createdAt
  })))

  res.status(200).json({
    success: true,
    count: courses.length,
    data: {
      courses
    }
  });
});

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = asyncHandler(async (req, res) => {
  console.log('getCourses called with query params:', req.query)
  let query = {};

  // Filter theo năm học và học kỳ
  if (req.query.academicYear) {
    query.academicYear = req.query.academicYear;
    console.log('Filtering by academicYear:', req.query.academicYear)
  }
  if (req.query.semester) {
    query.semester = req.query.semester;
    console.log('Filtering by semester:', req.query.semester)
  }

  // If user is teacher, only show their courses
  if (req.user.role === 'teacher') {
    query.teacher = req.user._id;
    console.log('Filtering by teacher:', req.user._id)
  }

  console.log('Final query:', query)

  const courses = await Course.find(query)
    .populate('teacher', 'firstName lastName name email')
    .populate('classes', 'name code maxStudents studentCount status schedule')
    .sort({ academicYear: -1, semester: 1, code: 1 });

  console.log('Found courses:', courses.length)
  console.log('Courses data:', courses.map(c => ({ 
    id: c._id, 
    name: c.name, 
    code: c.code, 
    academicYear: c.academicYear, 
    semester: c.semester,
    teacher: c.teacher?._id 
  })))

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
  const { academicYear, semester } = req.query;
  
  let query = { status: 'active' };
  
  if (academicYear) {
    query.academicYear = academicYear;
  }
  if (semester) {
    query.semester = semester;
  }

  // Get all active courses
  const courses = await Course.find(query)
    .populate('teacher', 'firstName lastName name email')
    .populate('classes', 'name code maxStudents studentCount status schedule')
    .sort({ code: 1 });

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
    .populate('classes', 'name code maxStudents studentCount status schedule')
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
  console.log('Creating course with data:', req.body)
  console.log('User:', { id: req.user._id, role: req.user.role })
  
  // Add teacher to req.body
  req.body.teacher = req.user._id;

  // Convert isActive to status for compatibility
  if (req.body.isActive !== undefined) {
    req.body.status = req.body.isActive ? 'active' : 'draft';
    delete req.body.isActive;
  }

  const course = await Course.create(req.body);
  console.log('Course created successfully:', course)

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
// @desc    Enroll student in course (Deprecated - Sử dụng class enrollment thay thế)
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
exports.enrollCourse = asyncHandler(async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'API này đã không còn được sử dụng. Vui lòng đăng ký trực tiếp vào lớp học thông qua /api/classes/:id/enroll'
  });
});

// @desc    Unenroll student from course (Deprecated - Sử dụng class unenrollment thay thế)
// @route   DELETE /api/courses/:id/enroll
// @access  Private (Student)
exports.unenrollCourse = asyncHandler(async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'API này đã không còn được sử dụng. Vui lòng hủy đăng ký trực tiếp khỏi lớp học thông qua /api/classes/:id/unenroll'
  });
});

// @desc    Get course students
// @route   GET /api/courses/:id/students
// @access  Private (Course owner, Admin)
exports.getCourseStudents = asyncHandler(async (req, res) => {
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
      message: 'Bạn không có quyền xem danh sách sinh viên'
    });
  }

  // Lấy tất cả lớp học của khóa học này
  const classes = await Class.find({ course: req.params.id })
    .populate('students', 'name email lastLogin createdAt')
    .sort({ code: 1 });

  // Tổng hợp tất cả sinh viên từ các lớp học
  const allStudents = [];
  const studentIds = new Set();

  classes.forEach(cls => {
    cls.students.forEach(student => {
      if (!studentIds.has(student._id.toString())) {
        studentIds.add(student._id.toString());
        allStudents.push({
          ...student.toObject(),
          className: cls.name,
          classCode: cls.code
        });
      }
    });
  });

  res.status(200).json({
    success: true,
    count: allStudents.length,
    data: {
      students: allStudents,
      classes: classes.map(cls => ({
        _id: cls._id,
        name: cls.name,
        code: cls.code,
        studentCount: cls.studentCount,
        maxStudents: cls.maxStudents
      }))
    }
  });
});

// @desc    Get academic years
// @route   GET /api/courses/academic-years
// @access  Public
exports.getAcademicYears = asyncHandler(async (req, res) => {
  const academicYears = await Course.distinct('academicYear');
  
  // Sắp xếp theo năm giảm dần
  academicYears.sort((a, b) => b.localeCompare(a));

  res.status(200).json({
    success: true,
    data: academicYears
  });
});

// @desc    Get semesters by academic year
// @route   GET /api/courses/semesters
// @access  Public
exports.getSemesters = asyncHandler(async (req, res) => {
  const query = {};
  
  if (req.query.academicYear) {
    query.academicYear = req.query.academicYear;
  }
  
  const semesters = await Course.distinct('semester', query);
  
  // Sắp xếp theo thứ tự HK1, HK2, HK_HE
  const semesterOrder = { 'HK1': 1, 'HK2': 2, 'HK_HE': 3 };
  semesters.sort((a, b) => semesterOrder[a] - semesterOrder[b]);

  res.status(200).json({
    success: true,
    data: semesters
  });
});

// @desc    Get courses by academic year and semester (for students)
// @route   GET /api/courses/by-semester
// @access  Public
exports.getCoursesBySemester = asyncHandler(async (req, res) => {
  const { academicYear, semester } = req.query;

  if (!academicYear || !semester) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp năm học và học kỳ'
    });
  }

  const courses = await Course.find({
    academicYear,
    semester,
    status: 'active'
  })
    .populate('teacher', 'name email')
    .populate('classes', 'name code maxStudents studentCount status schedule')
    .sort({ code: 1 });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});
