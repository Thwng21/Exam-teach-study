const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../src/models/Course');
const Class = require('../src/models/Class');
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

const seedAcademicData = async () => {
  try {
    await connectDB();

    // Xóa dữ liệu cũ
    console.log('Cleaning old data...');
    await Class.deleteMany({});
    await Course.deleteMany({});

    // Tìm hoặc tạo teacher
    let teacher = await User.findOne({ role: 'teacher' });
    if (!teacher) {
      teacher = await User.create({
        name: 'Giảng viên Nguyễn Văn A',
        email: 'teacher@exam.local',
        password: 'password123',
        role: 'teacher',
        isActive: true
      });
      console.log('Created teacher account');
    }

    // Tạo các khóa học mẫu
    console.log('Creating sample courses...');
    
    const coursesData = [
      // Năm học 2024-2025, Học kỳ 1
      {
        name: 'Lập trình Web',
        code: 'IT4409',
        description: 'Học lập trình web với HTML, CSS, JavaScript, và các framework hiện đại',
        academicYear: '2024-2025',
        semester: 'HK1',
        credits: 3,
        teacher: teacher._id,
        status: 'active'
      },
      {
        name: 'Cơ sở dữ liệu',
        code: 'IT4408',
        description: 'Thiết kế và quản lý cơ sở dữ liệu',
        academicYear: '2024-2025',
        semester: 'HK1',
        credits: 3,
        teacher: teacher._id,
        status: 'active'
      },
      {
        name: 'Mạng máy tính',
        code: 'IT4407',
        description: 'Tìm hiểu về mạng máy tính và giao thức mạng',
        academicYear: '2024-2025',
        semester: 'HK1',
        credits: 3,
        teacher: teacher._id,
        status: 'active'
      },
      
      // Năm học 2024-2025, Học kỳ 2
      {
        name: 'Trí tuệ nhân tạo',
        code: 'IT4406',
        description: 'Giới thiệu về AI và machine learning',
        academicYear: '2024-2025',
        semester: 'HK2',
        credits: 4,
        teacher: teacher._id,
        status: 'active'
      },
      {
        name: 'Công nghệ phần mềm',
        code: 'IT4405',
        description: 'Phương pháp phát triển phần mềm',
        academicYear: '2024-2025',
        semester: 'HK2',
        credits: 3,
        teacher: teacher._id,
        status: 'active'
      },
      
      // Năm học 2024-2025, Học kỳ hè
      {
        name: 'Thực tập doanh nghiệp',
        code: 'IT4490',
        description: 'Thực tập tại các doanh nghiệp công nghệ',
        academicYear: '2024-2025',
        semester: 'HK_HE',
        credits: 2,
        teacher: teacher._id,
        status: 'active'
      },
      
      // Năm học 2025-2026, Học kỳ 1
      {
        name: 'Học máy nâng cao',
        code: 'IT5409',
        description: 'Các thuật toán học máy nâng cao',
        academicYear: '2025-2026',
        semester: 'HK1',
        credits: 4,
        teacher: teacher._id,
        status: 'draft'
      }
    ];

    const courses = await Course.insertMany(coursesData);
    console.log(`Created ${courses.length} courses`);

    // Tạo các lớp học cho từng khóa học
    console.log('Creating sample classes...');
    
    const classesData = [];
    
    for (const course of courses) {
      // Mỗi khóa học có 2-3 lớp
      const numClasses = Math.floor(Math.random() * 2) + 2; // 2-3 lớp
      
      for (let i = 1; i <= numClasses; i++) {
        const dayOfWeek = Math.floor(Math.random() * 5) + 1; // Thứ 2-6
        const startHour = Math.floor(Math.random() * 6) + 7; // 7-12h
        
        classesData.push({
          name: `${course.name} - Lớp ${i}`,
          code: `${course.code}_L${String(i).padStart(2, '0')}`,
          course: course._id,
          teacher: teacher._id,
          schedule: {
            dayOfWeek: dayOfWeek,
            startTime: `${String(startHour).padStart(2, '0')}:00`,
            endTime: `${String(startHour + 2).padStart(2, '0')}:00`,
            room: `P${100 + Math.floor(Math.random() * 20)}`
          },
          maxStudents: 30 + Math.floor(Math.random() * 20), // 30-49 sinh viên
          status: course.status === 'active' ? 'active' : 'draft'
        });
      }
    }

    const classes = await Class.insertMany(classesData);
    console.log(`Created ${classes.length} classes`);

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Classes: ${classes.length}`);
    console.log(`- Teacher: ${teacher.email}`);
    
    console.log('\n🗓 Academic Years & Semesters:');
    const academicYears = [...new Set(courses.map(c => c.academicYear))];
    for (const year of academicYears) {
      const yearCourses = courses.filter(c => c.academicYear === year);
      const semesters = [...new Set(yearCourses.map(c => c.semester))];
      console.log(`  ${year}: ${semesters.join(', ')}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAcademicData();
