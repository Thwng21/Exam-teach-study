const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  // Load models
  const Course = require('./src/models/Course');
  const Exam = require('./src/models/Exam');
  
  const exams = await Exam.find({}).populate('course', 'name code');
  
  console.log('Total exams in database:', exams.length);
  console.log('Exams data:');
  
  exams.forEach((exam, index) => {
    console.log(`${index + 1}. ${exam.title} - Active: ${exam.isActive} - Course: ${exam.course?.name || 'No course'}`);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
