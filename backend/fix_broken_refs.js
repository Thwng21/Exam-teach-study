const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const Course = require('./src/models/Course');
  const User = require('./src/models/User');
  const Exam = require('./src/models/Exam');
  
  // Find all exams and check their course references
  const exams = await Exam.find({});
  
  for (let exam of exams) {
    console.log(`Exam: ${exam.title}`);
    console.log(`Course ID: ${exam.course}`);
    
    if (exam.course) {
      const course = await Course.findById(exam.course);
      if (!course) {
        console.log(`  -> Course reference broken! Updating...`);
        // Get a valid course
        const validCourse = await Course.findOne({ status: 'active' });
        if (validCourse) {
          await Exam.findByIdAndUpdate(exam._id, { course: validCourse._id });
          console.log(`  -> Updated to course: ${validCourse.name}`);
        }
      } else {
        console.log(`  -> Course: ${course.name}`);
      }
    } else {
      console.log(`  -> NULL COURSE! Updating...`);
      // Get a valid course
      const validCourse = await Course.findOne({ status: 'active' });
      if (validCourse) {
        await Exam.findByIdAndUpdate(exam._id, { course: validCourse._id });
        console.log(`  -> Updated to course: ${validCourse.name}`);
      }
    }
    console.log('---');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
