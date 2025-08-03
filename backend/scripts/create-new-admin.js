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

const createNewAdmin = async () => {
  try {
    await connectDB();
    
    const User = require('../src/models/User');
    
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email: 'admin@gmail.com' });
    if (existingUser) {
      console.log('✅ Admin với email admin@gmail.com đã tồn tại');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Họ tên:', existingUser.firstName, existingUser.lastName);
      console.log('🎯 Vai trò:', existingUser.role);
      
      // Reset mật khẩu cho tài khoản hiện tại
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      existingUser.password = hashedPassword;
      await existingUser.save();
      
      console.log('🔑 Mật khẩu đã được reset thành: admin123');
    } else {
      // Tạo admin mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const adminUser = new User({
        email: 'admin@gmail.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'System',
        role: 'admin',
        isVerified: true
      });
      
      await adminUser.save();
      console.log('✅ Tạo admin mới thành công!');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Họ tên:', adminUser.firstName, adminUser.lastName);
      console.log('🎯 Vai trò:', adminUser.role);
    }
    
    console.log('');
    console.log('🔐 THÔNG TIN ĐĂNG NHẬP ADMIN:');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔑 Mật khẩu: admin123');
    console.log('');
    console.log('🌐 Đăng nhập tại: http://localhost:3000');
    console.log('🚀 Sau khi đăng nhập sẽ chuyển đến: /admin/dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi tạo admin:', error);
    process.exit(1);
  }
};

createNewAdmin();
