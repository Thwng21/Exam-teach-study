const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Continuing without database connection...');
    // Don't exit process, allow server to run without DB for demo purposes
    // process.exit(1);
  }
};

module.exports = connectDB;
