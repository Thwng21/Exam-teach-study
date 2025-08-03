const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Course = require('../src/models/Course');

async function activateCourses() {
  try {
    // Connect to MongoDB
    console.log('🔄 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    // Activate all courses
    const result = await Course.updateMany(
      { isActive: false },
      { isActive: true }
    );

    console.log(`✅ Đã kích hoạt ${result.modifiedCount} khóa học`);

    // Show activated courses
    const courses = await Course.find({ isActive: true })
      .populate('teacher', 'firstName lastName email');

    console.log('\n📚 KHÓA HỌC ĐÃ KÍCH HOẠT:');
    console.log('==================================================');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} (${course.code})`);
      console.log(`   👨‍🏫 Giảng viên: ${course.teacher.firstName} ${course.teacher.lastName}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
  }
}

activateCourses();
