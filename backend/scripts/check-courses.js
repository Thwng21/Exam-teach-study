const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Course = require('../src/models/Course');
const User = require('../src/models/User');

async function checkCourses() {
  try {
    // Connect to MongoDB
    console.log('🔄 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    // Get all courses
    const courses = await Course.find()
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email');

    console.log('📚 KHÓA HỌC TRONG DATABASE:');
    console.log('==================================================');
    
    if (courses.length === 0) {
      console.log('❌ Chưa có khóa học nào trong database');
    } else {
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.name}`);
        console.log(`   📝 Mã: ${course.code}`);
        console.log(`   👨‍🏫 Giảng viên: ${course.teacher.firstName} ${course.teacher.lastName} (${course.teacher.email})`);
        console.log(`   👨‍🎓 Sinh viên: ${course.students.length} người`);
        console.log(`   📖 Mô tả: ${course.description || 'Chưa có mô tả'}`);
        console.log(`   🔄 Trạng thái: ${course.isActive ? 'Hoạt động' : 'Tạm dừng'}`);
        console.log(`   📅 Tạo lúc: ${course.createdAt}`);
        console.log('');
      });
    }

    console.log('📊 TỔNG KẾT:');
    console.log(`📚 Tổng khóa học: ${courses.length}`);
    console.log(`✅ Khóa học hoạt động: ${courses.filter(c => c.isActive).length}`);
    console.log(`⏸️ Khóa học tạm dừng: ${courses.filter(c => !c.isActive).length}`);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
  }
}

checkCourses();
