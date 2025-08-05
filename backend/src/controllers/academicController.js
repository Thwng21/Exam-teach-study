const Course = require('../models/Course');
const Class = require('../models/Class');
const { asyncHandler } = require('../middleware/error');

// @desc    Get academic system overview
// @route   GET /api/academic/overview
// @access  Public
exports.getAcademicOverview = asyncHandler(async (req, res) => {
  // Lấy tất cả năm học
  const academicYears = await Course.distinct('academicYear');
  console.log('Academic years found:', academicYears);
  academicYears.sort((a, b) => b.localeCompare(a)); // Sắp xếp giảm dần

  const overview = [];

  for (const year of academicYears) {
    if (!year) continue; // Skip null/undefined years
    console.log('Processing year:', year);
    
    // Lấy các học kỳ của năm học này
    const semesters = await Course.distinct('semester', { academicYear: year });
    console.log('Semesters for', year, ':', semesters);
    semesters.sort((a, b) => {
      const order = { 'HK1': 1, 'HK2': 2, 'HK_HE': 3 };
      return order[a] - order[b];
    });

    const yearData = {
      academicYear: year,
      semesters: []
    };

    for (const semester of semesters) {
      if (!semester) continue; // Skip null/undefined semesters
      console.log('Processing semester:', semester);
      
      // Lấy số lượng khóa học và lớp học
      const courseCount = await Course.countDocuments({
        academicYear: year,
        semester: semester,
        status: 'active'
      });
      console.log('Course count for', year, semester, ':', courseCount);

      const courses = await Course.find({
        academicYear: year,
        semester: semester,
        status: 'active'
      }).select('_id');

      const courseIds = courses.map(c => c._id).filter(id => id != null); // Filter null/undefined IDs
      console.log('Course IDs:', courseIds);
      
      const classCount = await Class.countDocuments({
        course: { $in: courseIds },
        status: 'active'
      });
      console.log('Class count for', year, semester, ':', classCount);

      const semesterData = {
        semester,
        semesterName: getSemesterName(semester),
        courseCount,
        classCount
      };
      console.log('Adding semester data:', semesterData);
      
      yearData.semesters.push(semesterData);
    }

    console.log('Final year data:', yearData);
    overview.push(yearData);
  }

  console.log('Final overview:', overview);
  const filteredOverview = overview.filter(year => year.academicYear);
  console.log('Filtered overview:', filteredOverview);

  res.status(200).json({
    success: true,
    data: filteredOverview // Filter out invalid years
  });
});

// @desc    Get courses and classes by semester
// @route   GET /api/academic/semester-data
// @access  Public
exports.getSemesterData = asyncHandler(async (req, res) => {
  const { academicYear, semester } = req.query;

  if (!academicYear || !semester) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp năm học và học kỳ'
    });
  }

  // Lấy tất cả khóa học trong học kỳ
  const courses = await Course.find({
    academicYear,
    semester,
    status: 'active'
  })
    .populate('teacher', 'name email')
    .sort({ code: 1 });

  // Lấy tất cả lớp học của các khóa học này
  const courseIds = courses.map(c => c._id);
  const classes = await Class.find({
    course: { $in: courseIds },
    status: 'active'
  })
    .populate('course', 'name code credits')
    .populate('teacher', 'name email')
    .sort({ 'course.code': 1, code: 1 });

  // Nhóm lớp học theo khóa học
  const coursesWithClasses = courses.map(course => ({
    ...course.toObject(),
    classes: classes.filter(cls => cls.course._id.toString() === course._id.toString())
  }));

  res.status(200).json({
    success: true,
    data: {
      academicYear,
      semester,
      semesterName: getSemesterName(semester),
      courses: coursesWithClasses,
      summary: {
        totalCourses: courses.length,
        totalClasses: classes.length,
        totalStudentSlots: classes.reduce((sum, cls) => sum + cls.maxStudents, 0),
        occupiedSlots: classes.reduce((sum, cls) => sum + cls.studentCount, 0)
      }
    }
  });
});

// @desc    Get student enrollment data
// @route   GET /api/academic/student-enrollment
// @access  Private (Student)
exports.getStudentEnrollment = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Lấy tất cả lớp học mà sinh viên đã đăng ký
  const enrolledClasses = await Class.find({
    students: studentId,
    status: 'active'
  })
    .populate('course', 'name code credits academicYear semester')
    .populate('teacher', 'name email')
    .sort({ 'course.academicYear': -1, 'course.semester': 1 });

  // Nhóm theo năm học và học kỳ
  const enrollmentByTerm = {};

  enrolledClasses.forEach(cls => {
    const key = `${cls.course.academicYear}-${cls.course.semester}`;
    if (!enrollmentByTerm[key]) {
      enrollmentByTerm[key] = {
        academicYear: cls.course.academicYear,
        semester: cls.course.semester,
        semesterName: getSemesterName(cls.course.semester),
        classes: [],
        totalCredits: 0
      };
    }
    enrollmentByTerm[key].classes.push(cls);
    enrollmentByTerm[key].totalCredits += cls.course.credits;
  });

  res.status(200).json({
    success: true,
    data: {
      enrolledClasses,
      enrollmentByTerm: Object.values(enrollmentByTerm),
      summary: {
        totalClasses: enrolledClasses.length,
        totalCredits: enrolledClasses.reduce((sum, cls) => sum + cls.course.credits, 0)
      }
    }
  });
});

// Helper function
function getSemesterName(semester) {
  const names = {
    'HK1': 'Học kỳ 1',
    'HK2': 'Học kỳ 2', 
    'HK_HE': 'Học kỳ hè'
  };
  return names[semester] || semester;
}
