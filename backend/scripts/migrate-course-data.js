const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../src/models/Course');
const User = require('../src/models/User');

// Load env vars
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const migrateCourseData = async () => {
  try {
    await connectDB();

    console.log('🔄 Starting Course Migration...');

    // Tìm các course cũ chưa có academicYear và semester
    const oldCourses = await Course.find({
      $or: [
        { academicYear: { $exists: false } },
        { semester: { $exists: false } },
        { credits: { $exists: false } }
      ]
    });

    console.log(`Found ${oldCourses.length} courses need migration`);

    if (oldCourses.length === 0) {
      console.log('✅ No courses need migration');
      process.exit(0);
    }

    // Cập nhật từng course
    for (const course of oldCourses) {
      const updateData = {};

      // Thêm academicYear nếu chưa có
      if (!course.academicYear) {
        updateData.academicYear = '2024-2025'; // Mặc định
      }

      // Thêm semester nếu chưa có
      if (!course.semester) {
        updateData.semester = 'HK1'; // Mặc định
      }

      // Thêm credits nếu chưa có
      if (!course.credits) {
        updateData.credits = 3; // Mặc định
      }

      // Xóa field students nếu có (vì đã chuyển sang Class)
      if (course.students && course.students.length > 0) {
        console.log(`⚠️  Course ${course.code} has ${course.students.length} students - will be lost in migration`);
        console.log('   Please create classes and manually enroll students');
      }

      // Cập nhật course
      await Course.findByIdAndUpdate(course._id, {
        $set: updateData,
        $unset: { students: "" } // Xóa field students
      });

      console.log(`✅ Updated course: ${course.code} - ${course.name}`);
    }

    // Kiểm tra User model có field courses không và xóa nếu có
    const usersWithCourses = await User.find({ courses: { $exists: true } });
    if (usersWithCourses.length > 0) {
      console.log(`\n🔄 Found ${usersWithCourses.length} users with old courses field`);
      await User.updateMany({}, { $unset: { courses: "" } });
      console.log('✅ Removed courses field from all users');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Create classes for each course using the Class model');
    console.log('2. Enroll students into specific classes');
    console.log('3. Update frontend to use the new class-based enrollment system');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateCourseData();
