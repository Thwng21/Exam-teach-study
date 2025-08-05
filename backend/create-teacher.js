const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function createTeacher() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    const existing = await User.findOne({email: 'teacher@exam.com'});
    if (existing) {
      console.log('Teacher already exists');
      process.exit(0);
      return;
    }

    const hashedPassword = await bcrypt.hash('teacher123', 10);
    const teacher = await User.create({
      name: 'Giáo viên Test',
      email: 'teacher@exam.com',
      password: hashedPassword,
      role: 'teacher',
      studentId: null
    });

    console.log('✅ Teacher created successfully!');
    console.log('📧 Email:', teacher.email);
    console.log('🔑 Password: teacher123');
    console.log('👤 Role:', teacher.role);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating teacher:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createTeacher();
