const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Kết nối MongoDB thành công');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
};

const activateAllCourses = async () => {
  try {
    await connectDB();
    
    const Course = require('../src/models/Course');
    
    console.log('=== KÍCH HOẠT TẤT CẢ KHÓA HỌC ===');
    
    // Hiển thị trạng thái hiện tại
    const allCourses = await Course.find({}).select('name code status');
    console.log('\nTrạng thái hiện tại:');
    allCourses.forEach(course => {
      console.log(`- ${course.name} (${course.code}): status = ${course.status}`);
    });
    
    // Cập nhật tất cả khóa học thành active
    const updateResult = await Course.updateMany(
      {}, // Tất cả khóa học
      { status: 'active' }
    );
    
    console.log(`\n✅ Đã cập nhật ${updateResult.modifiedCount} khóa học thành trạng thái 'active'`);
    
    // Hiển thị trạng thái sau khi cập nhật
    const updatedCourses = await Course.find({}).select('name code status');
    console.log('\nTrạng thái sau khi cập nhật:');
    updatedCourses.forEach(course => {
      console.log(`- ${course.name} (${course.code}): status = ${course.status}`);
    });
    
    // Kiểm tra số lượng khóa học active
    const activeCourses = await Course.find({ status: 'active' });
    console.log(`\n📊 Tổng số khóa học đang hoạt động: ${activeCourses.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
};

activateAllCourses();
