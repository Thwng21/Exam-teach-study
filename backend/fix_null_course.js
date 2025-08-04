const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const Course = require('./src/models/Course');
  const User = require('./src/models/User');
  const Exam = require('./src/models/Exam');
  
  // Find exams with null course
  const examsWithNullCourse = await Exam.find({ course: null });
  console.log('Exams with null course:', examsWithNullCourse.length);
  
  if (examsWithNullCourse.length > 0) {
    // Get a valid course to assign
    const validCourse = await Course.findOne({ status: 'active' });
    
    if (validCourse) {
      console.log('Assigning course:', validCourse.name);
      
      // Update exams with null course to use valid course
      const result = await Exam.updateMany(
        { course: null },
        { $set: { course: validCourse._id } }
      );
      
      console.log('Updated exams:', result.modifiedCount);
    } else {
      console.log('No valid course found to assign');
    }
  }
  
  // Check again
  const exams = await Exam.find({}).populate('course', 'name code');
  const stillNullCount = exams.filter(exam => !exam.course).length;
  console.log('Exams still with null course:', stillNullCount);
  
  process.exit(0);
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
