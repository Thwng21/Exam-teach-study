const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const resetAdminPassword = async () => {
  try {
    await connectDB();
    
    const User = require('../src/models/User');
    
    // Tìm admin hiện tại
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ Không tìm thấy tài khoản admin');
      process.exit(1);
    }
    
    // Mật khẩu mới
    const newPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Cập nhật mật khẩu
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('✅ Đã reset mật khẩu admin thành công!');
    console.log('');
    console.log('🔐 THÔNG TIN ĐĂNG NHẬP ADMIN:');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mật khẩu mới: admin123');
    console.log('👤 Họ tên:', admin.firstName, admin.lastName);
    console.log('🎯 Vai trò:', admin.role);
    console.log('');
    console.log('🌐 Đăng nhập tại: http://localhost:3000');
    console.log('🚀 Sau khi đăng nhập sẽ chuyển đến: /admin/dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi reset mật khẩu:', error);
    process.exit(1);
  }
};

resetAdminPassword();
