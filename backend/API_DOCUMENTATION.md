# API Documentation - Hệ thống Năm học/Học kỳ/Khóa học/Lớp học

## Tổng quan luồng hoạt động

```
Năm học (2024-2025) 
  └── Học kỳ (HK1, HK2, HK_HE)
      └── Khóa học (IT4409 - Lập trình Web)
          └── Lớp học (IT4409_L01, IT4409_L02)
              └── Sinh viên đăng ký vào lớp học cụ thể
```

## API Endpoints

### 1. Academic Overview APIs

#### GET /api/academic/overview
Lấy tổng quan tất cả năm học và học kỳ
```json
{
  "success": true,
  "data": [
    {
      "academicYear": "2025-2026",
      "semesters": [
        {
          "semester": "HK1",
          "semesterName": "Học kỳ 1",
          "courseCount": 1,
          "classCount": 3
        }
      ]
    },
    {
      "academicYear": "2024-2025",
      "semesters": [
        {
          "semester": "HK1",
          "semesterName": "Học kỳ 1",
          "courseCount": 3,
          "classCount": 8
        },
        {
          "semester": "HK2",
          "semesterName": "Học kỳ 2",
          "courseCount": 2,
          "classCount": 5
        },
        {
          "semester": "HK_HE",
          "semesterName": "Học kỳ hè",
          "courseCount": 1,
          "classCount": 3
        }
      ]
    }
  ]
}
```

#### GET /api/academic/semester-data?academicYear=2024-2025&semester=HK1
Lấy tất cả khóa học và lớp học của một học kỳ
```json
{
  "success": true,
  "data": {
    "academicYear": "2024-2025",
    "semester": "HK1",
    "semesterName": "Học kỳ 1",
    "courses": [
      {
        "_id": "...",
        "name": "Lập trình Web",
        "code": "IT4409",
        "credits": 3,
        "teacher": {...},
        "classes": [
          {
            "_id": "...",
            "name": "Lập trình Web - Lớp 1",
            "code": "IT4409_L01",
            "schedule": {
              "dayOfWeek": 2,
              "startTime": "08:00",
              "endTime": "10:00",
              "room": "P101"
            },
            "maxStudents": 35,
            "studentCount": 0
          }
        ]
      }
    ],
    "summary": {
      "totalCourses": 3,
      "totalClasses": 8,
      "totalStudentSlots": 312,
      "occupiedSlots": 0
    }
  }
}
```

### 2. Course APIs

#### GET /api/courses/academic-years
Lấy danh sách năm học
```json
{
  "success": true,
  "data": ["2025-2026", "2024-2025"]
}
```

#### GET /api/courses/semesters?academicYear=2024-2025
Lấy danh sách học kỳ theo năm học
```json
{
  "success": true,
  "data": ["HK1", "HK2", "HK_HE"]
}
```

#### GET /api/courses/by-semester?academicYear=2024-2025&semester=HK1
Lấy khóa học theo năm học và học kỳ
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

#### POST /api/courses (Protected - Teacher/Admin)
Tạo khóa học mới
```json
{
  "name": "Lập trình Web",
  "code": "IT4409",
  "description": "Học lập trình web...",
  "academicYear": "2024-2025",
  "semester": "HK1",
  "credits": 3
}
```

### 3. Class APIs

#### GET /api/classes/by-semester?academicYear=2024-2025&semester=HK1
Lấy lớp học theo năm học và học kỳ
```json
{
  "success": true,
  "count": 8,
  "data": [...]
}
```

#### GET /api/classes?course=COURSE_ID
Lấy lớp học theo khóa học

#### POST /api/classes (Protected - Teacher/Admin)
Tạo lớp học mới
```json
{
  "name": "Lập trình Web - Lớp 1",
  "code": "IT4409_L01",
  "course": "COURSE_ID",
  "schedule": {
    "dayOfWeek": 2,
    "startTime": "08:00",
    "endTime": "10:00",
    "room": "P101"
  },
  "maxStudents": 35
}
```

#### POST /api/classes/:id/enroll (Protected - Student)
Sinh viên đăng ký lớp học

#### POST /api/classes/:id/unenroll (Protected - Student)
Sinh viên hủy đăng ký lớp học

### 4. Student Enrollment API

#### GET /api/academic/student-enrollment (Protected - Student)
Lấy thông tin đăng ký lớp học của sinh viên
```json
{
  "success": true,
  "data": {
    "enrolledClasses": [...],
    "enrollmentByTerm": [
      {
        "academicYear": "2024-2025",
        "semester": "HK1",
        "semesterName": "Học kỳ 1",
        "classes": [...],
        "totalCredits": 9
      }
    ],
    "summary": {
      "totalClasses": 3,
      "totalCredits": 9
    }
  }
}
```

## Luồng sử dụng cho Frontend

### Cho Sinh viên:
1. **Trang chọn học kỳ**: Gọi `/api/academic/overview` để hiển thị danh sách năm học/học kỳ
2. **Trang khóa học**: Gọi `/api/academic/semester-data` để hiển thị khóa học và lớp học
3. **Đăng ký lớp**: Gọi `/api/classes/:id/enroll` để đăng ký
4. **Xem đăng ký**: Gọi `/api/academic/student-enrollment` để xem lớp đã đăng ký

### Cho Giảng viên:
1. **Tạo khóa học**: Gọi `/api/courses` với dữ liệu năm học/học kỳ
2. **Tạo lớp học**: Gọi `/api/classes` với course_id
3. **Quản lý**: Gọi `/api/courses?academicYear=...&semester=...` để xem khóa học của mình

## Lưu ý quan trọng:
- **Sinh viên đăng ký vào LỚPP HỌC**, không phải khóa học
- **Khóa học** chứa thông tin chung (tín chỉ, mô tả...)
- **Lớp học** chứa thông tin cụ thể (lịch học, phòng, sinh viên...)
- **Bài kiểm tra** thuộc về lớp học cụ thể
