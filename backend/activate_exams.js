const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  // Load models
  const Course = require('./src/models/Course');
  const Exam = require('./src/models/Exam');
  
  // Update all exams to have status: 'active'
  const result = await Exam.updateMany(
    { status: 'draft' }, // Find draft exams
    { $set: { status: 'active' } }      // Set status to active
  );
  
  console.log('Updated exams from draft to active:', result.modifiedCount);
  
  // Check updated exams
  const exams = await Exam.find({}).populate('course', 'name code');
  console.log('Total exams after update:', exams.length);
  
  exams.forEach((exam, index) => {
    console.log(`${index + 1}. ${exam.title} - Status: ${exam.status} - Course: ${exam.course?.name || 'No course'}`);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
