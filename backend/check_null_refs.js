const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const Course = require('./src/models/Course');
  const User = require('./src/models/User');
  const Exam = require('./src/models/Exam');
  
  const exams = await Exam.find({}).populate('course', 'name code').populate('teacher', 'firstName lastName');
  
  console.log('Checking exams for null references:');
  exams.forEach((exam, index) => {
    console.log(`${index + 1}. ${exam.title}`);
    console.log(`   Course: ${exam.course ? exam.course.name : 'NULL'}`);
    console.log(`   Teacher: ${exam.teacher ? (exam.teacher.firstName + ' ' + exam.teacher.lastName) : 'NULL'}`);
    console.log(`   StartTime: ${exam.startTime || 'NULL'}`);
    console.log(`   EndTime: ${exam.endTime || 'NULL'}`);
    console.log(`   Questions: ${exam.questions ? exam.questions.length : 'NULL'}`);
    console.log('---');
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
