# Hệ thống Thi Trực Tuyến

Hệ thống thi trực tuyến dành cho giảng viên và sinh viên với đầy đủ tính năng quản lý bài thi, làm bài và chấm điểm.

## 🚀 Cài đặt và Chạy dự án

### 1. Clone repository
```bash
git clone <your-repo-url>
cd Exam
```

### 2. Cấu hình môi trường
```bash
# Copy file .env.example thành .env và cấu hình
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

### 3. Cài đặt dependencies
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 4. Khởi chạy ứng dụng
```bash
# Terminal 1: Backend
cd backend/src
node server.js

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Tạo tài khoản admin
```bash
cd backend
node scripts/create-new-admin.js
```

## 🔐 Bảo mật

**⚠️ QUAN TRỌNG:** File `.env` chứa thông tin nhạy cảm và đã được thêm vào `.gitignore`. 
Không bao giờ push file `.env` lên GitHub!

## Tính năng chính

### Dành cho Giảng viên
- ✅ Tạo và quản lý bài thi
- ✅ Thiết kế câu hỏi trắc nghiệm
- ✅ Quản lý thời gian thi
- ✅ Xem thống kê và kết quả
- ✅ Chấm điểm và phản hồi

### Dành cho Sinh viên  
- ✅ Xem danh sách bài thi khả dụng
- ✅ Làm bài thi trực tuyến
- ✅ Xem kết quả và điểm số
- ✅ Lịch sử bài thi đã làm

### Dành cho Admin
- ✅ Quản lý người dùng
- ✅ Phân quyền hệ thống
- ✅ Thống kê tổng quan

## Công nghệ sử dụng

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Lucide Icons** - Icon library

### Backend  
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Cài đặt và chạy

### 1. Clone repository
\`\`\`bash
git clone <repository-url>
cd Exam
\`\`\`

### 2. Chạy với Docker (Khuyến nghị)
\`\`\`bash
# Chạy toàn bộ hệ thống
docker-compose up -d

# Xem logs
docker-compose logs -f
\`\`\`

Truy cập:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 3. Chạy thủ công

#### Backend
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Cập nhật thông tin database trong .env
npm run dev
\`\`\`

#### Frontend
\`\`\`bash
cd frontend  
npm install
cp .env.example .env.local
# Cập nhật API URL trong .env.local
npm run dev
\`\`\`

## Cấu trúc dự án

\`\`\`
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── config/         # Configuration files
│   ├── uploads/           # File uploads
│   └── scripts/           # Database scripts
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   └── services/      # API services
│   └── public/           # Static files
└── docker-compose.yml    # Docker configuration
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập  
- `GET /api/auth/me` - Thông tin user
- `PUT /api/auth/me` - Cập nhật profile
- `POST /api/auth/logout` - Đăng xuất

### Exams
- `GET /api/exams` - Danh sách bài thi
- `POST /api/exams` - Tạo bài thi mới
- `GET /api/exams/:id` - Chi tiết bài thi
- `PUT /api/exams/:id` - Cập nhật bài thi
- `DELETE /api/exams/:id` - Xóa bài thi
- `GET /api/exams/:id/stats` - Thống kê bài thi

### Submissions
- `POST /api/submissions` - Nộp bài thi
- `GET /api/submissions` - Danh sách bài nộp
- `GET /api/submissions/:id` - Chi tiết bài nộp
- `PUT /api/submissions/:id/grade` - Chấm điểm

### Courses
- `GET /api/courses` - Danh sách khóa học
- `POST /api/courses` - Tạo khóa học mới
- `GET /api/courses/:id` - Chi tiết khóa học

## Tài khoản mặc định

Sau khi khởi tạo, bạn có thể tạo tài khoản admin đầu tiên thông qua API hoặc trực tiếp trong database.

## Environment Variables

### Backend (.env)
\`\`\`
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/exam_system
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
\`\`\`

### Frontend (.env.local)
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Hệ thống thi trực tuyến
\`\`\`

## Deployment

### Sử dụng Docker
\`\`\`bash
# Production build
docker-compose -f docker-compose.yml up -d
\`\`\`

### Manual Deployment
1. Build frontend: \`npm run build\`
2. Deploy backend với PM2 hoặc similar
3. Cấu hình reverse proxy (Nginx)
4. Setup SSL certificate

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes  
4. Push và tạo Pull Request

## License

MIT License - xem file LICENSE để biết thêm chi tiết.
