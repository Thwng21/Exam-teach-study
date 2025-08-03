// MongoDB initialization script
db = db.getSiblingDB('exam_system');

// Create collections
db.createCollection('users');
db.createCollection('courses');
db.createCollection('exams');
db.createCollection('submissions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "studentId": 1 }, { sparse: true, unique: true });
db.courses.createIndex({ "code": 1 }, { unique: true });
db.exams.createIndex({ "course": 1 });
db.exams.createIndex({ "teacher": 1 });
db.submissions.createIndex({ "exam": 1, "student": 1 }, { unique: true });

print('Database and collections created successfully!');
