// Script tạo khóa học cho giảng viên thật
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Course = require('../src/models/Course');

async function createCourses() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Tìm giảng viên thật (Phạm Gwouth)
    const teacher = await User.findOne({ email: 't@gmail.com', role: 'teacher' });
    if (!teacher) {
      console.log('❌ Không tìm thấy tài khoản giảng viên t@gmail.com');
      process.exit(1);
    }

    console.log(`✅ Tìm thấy giảng viên: ${teacher.firstName} ${teacher.lastName}`);

    // Tìm sinh viên để thêm vào khóa học
    const students = await User.find({ role: 'student' });
    const studentIds = students.map(s => s._id);

    // Danh sách khóa học cho Công Nghệ Phần Mềm
    const coursesData = [
      {
        name: 'Lập trình hướng đối tượng',
        code: 'SE101',
        description: 'Khóa học về lập trình hướng đối tượng với Java và C++. Học về class, object, inheritance, polymorphism, encapsulation.',
        teacher: teacher._id,
        students: studentIds,
        isActive: true
      },
      {
        name: 'Công nghệ phần mềm',
        code: 'SE201',
        description: 'Khóa học về quy trình phát triển phần mềm, phân tích yêu cầu, thiết kế hệ thống, testing và maintenance.',
        teacher: teacher._id,
        students: studentIds,
        isActive: true
      },
      {
        name: 'Phát triển ứng dụng Web',
        code: 'SE301',
        description: 'Khóa học về phát triển web full-stack với HTML, CSS, JavaScript, React, Node.js và MongoDB.',
        teacher: teacher._id,
        students: studentIds,
        isActive: true
      },
      {
        name: 'Cơ sở dữ liệu nâng cao',
        code: 'SE202',
        description: 'Khóa học về thiết kế CSDL, SQL nâng cao, NoSQL, tối ưu hóa truy vấn và quản trị CSDL.',
        teacher: teacher._id,
        students: studentIds,
        isActive: true
      },
      {
        name: 'Kiến trúc phần mềm',
        code: 'SE401',
        description: 'Khóa học về design patterns, microservices, clean architecture, và các nguyên tắc thiết kế phần mềm.',
        teacher: teacher._id,
        students: studentIds,
        isActive: true
      },
      {
        name: 'Phát triển ứng dụng Mobile',
        code: 'SE302',
        description: 'Khóa học về phát triển ứng dụng di động với React Native, Flutter, và các công nghệ mobile hiện đại.',
        teacher: teacher._id,
        students: studentIds,
        isActive: true
      },
      {
        name: 'DevOps và CI/CD',
        code: 'SE402',
        description: 'Khóa học về Docker, Kubernetes, Jenkins, automated testing, deployment và monitoring hệ thống.',
        teacher: teacher._id,
        students: studentIds,
        isActive: true
      },
      {
        name: 'An toàn và bảo mật phần mềm',
        code: 'SE403',
        description: 'Khóa học về security vulnerabilities, encryption, authentication, authorization và secure coding practices.',
        teacher: teacher._id,
        students: studentIds,
        isActive: true
      }
    ];

    console.log('\n📚 Đang tạo khóa học...');
    console.log('=' .repeat(60));

    let createdCount = 0;
    let existingCount = 0;

    for (const courseData of coursesData) {
      const existingCourse = await Course.findOne({ code: courseData.code });
      if (!existingCourse) {
        const course = await Course.create(courseData);
        console.log(`✅ Tạo thành công: ${course.name} (${course.code})`);
        createdCount++;
      } else {
        console.log(`⚠️  Đã tồn tại: ${courseData.name} (${courseData.code})`);
        existingCount++;
      }
    }

    console.log('\n📊 KẾT QUẢ:');
    console.log('=' .repeat(40));
    console.log(`✅ Khóa học mới tạo: ${createdCount}`);
    console.log(`⚠️  Khóa học đã tồn tại: ${existingCount}`);
    console.log(`📝 Tổng cộng: ${coursesData.length}`);

    // Hiển thị tất cả khóa học của giảng viên này
    const allCourses = await Course.find({ teacher: teacher._id });
    console.log(`\n📚 Tất cả khóa học của ${teacher.firstName} ${teacher.lastName}:`);
    console.log('=' .repeat(60));
    allCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} (${course.code})`);
      console.log(`   📝 ${course.description}`);
      console.log(`   👥 Sinh viên: ${course.students.length}`);
      console.log(`   📅 Tạo lúc: ${course.createdAt}`);
      console.log('');
    });

    console.log('🎉 Hoàn thành tạo khóa học!');
    console.log('\n💡 Bạn có thể đăng nhập với:');
    console.log(`📧 Email: t@gmail.com`);
    console.log(`🔑 Password: (mật khẩu bạn đã đặt)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createCourses();
