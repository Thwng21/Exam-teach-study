const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const Course = require('./src/models/Course');
  const User = require('./src/models/User');
  const Exam = require('./src/models/Exam');
  
  // Update first exam to be available now
  const now = new Date();
  const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
  
  const result = await Exam.findOneAndUpdate(
    { title: 'Bài kiểm tra thực hành' },
    { 
      startTime: now,
      endTime: endTime,
      status: 'active',
      duration: 30 // 30 minutes
    },
    { new: true }
  );
  
  if (result) {
    console.log('Updated exam:', result.title);
    console.log('Start time:', result.startTime);
    console.log('End time:', result.endTime);
    console.log('Duration:', result.duration, 'minutes');
  } else {
    console.log('No exam found to update');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
