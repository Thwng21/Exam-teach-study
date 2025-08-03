const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Course = require('../src/models/Course');
const User = require('../src/models/User');

async function activateAllCourses() {
  try {
    // Connect to MongoDB
    console.log('🔄 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    // Update all courses to be active
    const result = await Course.updateMany(
      {},
      { isActive: true }
    );

    console.log(`✅ Đã cập nhật ${result.modifiedCount} khóa học`);

    // Show all courses status
    const courses = await Course.find()
      .populate('teacher', 'firstName lastName email');

    console.log('\n📚 TẤT CẢ KHÓA HỌC:');
    console.log('==================================================');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} (${course.code}) - ${course.isActive ? '✅ Hoạt động' : '❌ Tạm dừng'}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
  }
}

activateAllCourses();
