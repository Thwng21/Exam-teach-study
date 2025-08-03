# Exam System Backend

Backend API cho hệ thống thi trực tuyến được xây dựng với Node.js, Express và MongoDB.

## Tính năng

- 🔐 **Authentication & Authorization** - JWT-based với role-based access control
- 👥 **User Management** - Quản lý giảng viên và sinh viên
- 📚 **Course Management** - Tạo và quản lý khóa học
- 📝 **Exam System** - Tạo bài kiểm tra với nhiều loại câu hỏi
- 📊 **Submission & Grading** - Nộp bài và chấm điểm tự động/thủ công
- 🛡️ **Security** - Rate limiting, input validation, CORS
- 📈 **Performance** - Database indexing, efficient queries

## Cài đặt

### Yêu cầu hệ thống

- Node.js >= 14.0.0
- MongoDB >= 4.4
- npm hoặc yarn

### Cài đặt dependencies

```bash
cd backend
npm install
```

### Cấu hình môi trường

1. Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

2. Cập nhật các biến môi trường trong file `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/exam_system

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Khởi chạy server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại `http://localhost:5000`

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Đăng ký tài khoản | Public |
| POST | `/api/auth/login` | Đăng nhập | Public |
| GET | `/api/auth/me` | Lấy thông tin user | Private |
| PUT | `/api/auth/me` | Cập nhật thông tin | Private |
| PUT | `/api/auth/password` | Đổi mật khẩu | Private |

### Course Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/courses` | Lấy danh sách khóa học | Private |
| POST | `/api/courses` | Tạo khóa học mới | Teacher/Admin |
| GET | `/api/courses/:id` | Lấy chi tiết khóa học | Private |
| PUT | `/api/courses/:id` | Cập nhật khóa học | Owner/Admin |
| DELETE | `/api/courses/:id` | Xóa khóa học | Owner/Admin |
| POST | `/api/courses/:id/enroll` | Đăng ký khóa học | Student |

### Exam Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/exams` | Lấy danh sách bài kiểm tra | Private |
| POST | `/api/exams` | Tạo bài kiểm tra | Teacher/Admin |
| GET | `/api/exams/:id` | Lấy chi tiết bài kiểm tra | Private |
| PUT | `/api/exams/:id` | Cập nhật bài kiểm tra | Owner/Admin |
| PUT | `/api/exams/:id/publish` | Xuất bản bài kiểm tra | Owner/Admin |

### Submission Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/submissions/start/:examId` | Bắt đầu làm bài | Student |
| PUT | `/api/submissions/answer/:id` | Lưu câu trả lời | Student |
| POST | `/api/submissions/submit/:id` | Nộp bài | Student |
| PUT | `/api/submissions/grade/:id` | Chấm điểm | Teacher/Admin |

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['teacher', 'student', 'admin'],
  avatar: String,
  isActive: Boolean,
  lastLogin: Date,
  courses: [ObjectId]
}
```

### Course Model
```javascript
{
  name: String,
  code: String (unique),
  description: String,
  teacher: ObjectId,
  students: [ObjectId],
  status: ['draft', 'active', 'archived'],
  maxStudents: Number
}
```

### Exam Model
```javascript
{
  title: String,
  description: String,
  course: ObjectId,
  teacher: ObjectId,
  questions: [QuestionSchema],
  duration: Number,
  totalPoints: Number,
  status: ['draft', 'published', 'active', 'completed'],
  startTime: Date,
  endTime: Date
}
```

### Submission Model
```javascript
{
  exam: ObjectId,
  student: ObjectId,
  answers: [AnswerSchema],
  score: Number,
  percentage: Number,
  timeSpent: Number,
  status: ['in_progress', 'submitted', 'graded'],
  submittedAt: Date
}
```

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt với salt rounds 12
- **Rate Limiting** - Giới hạn request per IP
- **Input Validation** - express-validator
- **CORS Configuration** - Chỉ cho phép frontend domain
- **Helmet** - Security headers
- **Role-based Authorization** - Phân quyền theo vai trò

## Error Handling

API trả về response format nhất quán:

```javascript
// Success
{
  "success": true,
  "data": {...},
  "message": "Success message"
}

// Error
{
  "success": false,
  "message": "Error message"
}
```

## Development

### Chạy tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Database seeding
```bash
npm run seed
```

## Deployment

### Docker
```bash
docker build -t exam-backend .
docker run -p 5000:5000 exam-backend
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-super-secure-secret
FRONTEND_URL=https://your-frontend-domain.com
```

## Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.
