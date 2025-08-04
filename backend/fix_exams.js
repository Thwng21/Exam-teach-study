const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  // Load models
  const Course = require('./src/models/Course');
  const Exam = require('./src/models/Exam');
  
  // Update all exams to have isActive: true
  const result = await Exam.updateMany(
    { isActive: { $exists: false } }, // Find exams without isActive field
    { $set: { isActive: true } }      // Set isActive to true
  );
  
  console.log('Updated exams:', result.modifiedCount);
  
  // Check updated exams
  const exams = await Exam.find({}).populate('course', 'name code');
  console.log('Total exams after update:', exams.length);
  
  exams.forEach((exam, index) => {
    console.log(`${index + 1}. ${exam.title} - Active: ${exam.isActive} - Course: ${exam.course?.name || 'No course'}`);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
