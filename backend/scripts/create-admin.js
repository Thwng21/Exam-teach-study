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

const createAdminUser = async () => {
  try {
    await connectDB();
    
    const User = require('../src/models/User');
    
    // Kiểm tra xem đã có admin chưa
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin đã tồn tại:', existingAdmin.email);
      console.log('Thông tin admin:');
      console.log('- Email:', existingAdmin.email);
      console.log('- Họ tên:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('- Vai trò:', existingAdmin.role);
      process.exit(0);
    }
    
    // Tạo admin mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const adminUser = new User({
      email: 'admin@exam.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'admin',
      isVerified: true
    });
    
    await adminUser.save();
    
    console.log('✅ Tạo tài khoản admin thành công!');
    console.log('📧 Email: admin@exam.com');
    console.log('🔑 Mật khẩu: admin123');
    console.log('👤 Vai trò: admin');
    console.log('');
    console.log('🚀 Bạn có thể đăng nhập với thông tin trên để truy cập trang admin!');
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi tạo admin:', error);
    process.exit(1);
  }
};

createAdminUser();
