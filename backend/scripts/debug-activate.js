const mongoose = require('mongoose');
require('dotenv').config();

async function debugCourses() {
  try {
    // Connect to MongoDB
    console.log('🔄 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    // Get course schema
    const courseSchema = new mongoose.Schema({
      name: { type: String, required: true },
      code: { type: String, required: true, unique: true },
      description: String,
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    });

    const Course = mongoose.model('Course', courseSchema);

    // Update courses individually
    const courses = await Course.find();
    console.log(`📚 Tìm thấy ${courses.length} khóa học`);

    for (let course of courses) {
      course.isActive = true;
      await course.save();
      console.log(`✅ Đã kích hoạt: ${course.name}`);
    }

    console.log('\n🎉 Hoàn thành kích hoạt tất cả khóa học!');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
  }
}

debugCourses();
