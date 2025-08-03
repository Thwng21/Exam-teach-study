// Script tạo dữ liệu mẫu cho hệ thống
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Course = require('../src/models/Course');

async function seedData() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu cũ (nếu muốn)
    // await User.deleteMany({});
    // await Course.deleteMany({});

    // Tạo teacher mẫu
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    let teacher = await User.findOne({ email: 'teacher@example.com' });
    if (!teacher) {
      teacher = await User.create({
        firstName: 'Nguyễn',
        lastName: 'Văn Giáo',
        email: 'teacher@example.com',
        password: hashedPassword,
        role: 'teacher',
        department: 'Khoa Công nghệ Thông tin'
      });
      console.log('✅ Created teacher user');
    }

    // Tạo student mẫu
    let student = await User.findOne({ email: 'student@example.com' });
    if (!student) {
      student = await User.create({
        firstName: 'Trần',
        lastName: 'Văn Học',
        email: 'student@example.com',
        password: hashedPassword,
        role: 'student',
        studentId: 'SV001',
        department: 'Khoa Công nghệ Thông tin'
      });
      console.log('✅ Created student user');
    }

    // Tạo admin mẫu
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      admin = await User.create({
        firstName: 'Quản',
        lastName: 'Trị Viên',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Created admin user');
    }

    // Tạo courses mẫu
    const coursesData = [
      {
        name: 'Lập trình Web',
        code: 'IT301',
        description: 'Khóa học về phát triển ứng dụng web với HTML, CSS, JavaScript',
        teacher: teacher._id,
        students: [student._id],
        isActive: true
      },
      {
        name: 'Cơ sở dữ liệu',
        code: 'IT302',
        description: 'Khóa học về thiết kế và quản lý cơ sở dữ liệu',
        teacher: teacher._id,
        students: [student._id],
        isActive: true
      },
      {
        name: 'Thuật toán và Cấu trúc dữ liệu',
        code: 'IT303',
        description: 'Khóa học về các thuật toán cơ bản và cấu trúc dữ liệu',
        teacher: teacher._id,
        students: [student._id],
        isActive: true
      }
    ];

    for (const courseData of coursesData) {
      const existingCourse = await Course.findOne({ code: courseData.code });
      if (!existingCourse) {
        await Course.create(courseData);
        console.log(`✅ Created course: ${courseData.name}`);
      }
    }

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📚 Sample accounts:');
    console.log('👨‍🏫 Teacher: teacher@example.com / 123456');
    console.log('👨‍🎓 Student: student@example.com / 123456');
    console.log('👨‍💼 Admin: admin@example.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
