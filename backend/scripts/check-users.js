// Script kiểm tra và hiển thị tài khoản trong database
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');

async function checkUsers() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy tất cả tài khoản giảng viên
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    console.log('\n👨‍🏫 GIẢNG VIÊN TRONG DATABASE:');
    console.log('=' .repeat(50));
    
    if (teachers.length === 0) {
      console.log('❌ Không có tài khoản giảng viên nào trong database');
    } else {
      teachers.forEach((teacher, index) => {
        console.log(`${index + 1}. ${teacher.firstName} ${teacher.lastName}`);
        console.log(`   📧 Email: ${teacher.email}`);
        console.log(`   🏢 Khoa: ${teacher.department || 'Chưa có'}`);
        console.log(`   📅 Tạo lúc: ${teacher.createdAt}`);
        console.log('');
      });
    }

    // Lấy tất cả tài khoản sinh viên
    const students = await User.find({ role: 'student' }).select('-password');
    console.log('\n👨‍🎓 SINH VIÊN TRONG DATABASE:');
    console.log('=' .repeat(50));
    
    if (students.length === 0) {
      console.log('❌ Không có tài khoản sinh viên nào trong database');
    } else {
      students.forEach((student, index) => {
        console.log(`${index + 1}. ${student.firstName} ${student.lastName}`);
        console.log(`   📧 Email: ${student.email}`);
        console.log(`   🎓 MSSV: ${student.studentId || 'Chưa có'}`);
        console.log(`   🏢 Khoa: ${student.department || 'Chưa có'}`);
        console.log(`   📅 Tạo lúc: ${student.createdAt}`);
        console.log('');
      });
    }

    // Lấy tất cả tài khoản admin
    const admins = await User.find({ role: 'admin' }).select('-password');
    console.log('\n👨‍💼 ADMIN TRONG DATABASE:');
    console.log('=' .repeat(50));
    
    if (admins.length === 0) {
      console.log('❌ Không có tài khoản admin nào trong database');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.firstName} ${admin.lastName}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   📅 Tạo lúc: ${admin.createdAt}`);
        console.log('');
      });
    }

    console.log('\n📊 TỔNG KẾT:');
    console.log(`👨‍🏫 Giảng viên: ${teachers.length}`);
    console.log(`👨‍🎓 Sinh viên: ${students.length}`);
    console.log(`👨‍💼 Admin: ${admins.length}`);
    console.log(`📝 Tổng cộng: ${teachers.length + students.length + admins.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
