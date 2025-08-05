# Frontend Migration Guide - Chuyển từ Course-based sang Class-based System

## ❌ Các thay đổi BREAKING CHANGES

### 1. Course Model Changes
```javascript
// ❌ CŨ - Course có students
{
  _id: "...",
  name: "Lập trình Web",
  code: "IT4409",
  students: [...], // ❌ Đã bị xóa
  maxStudents: 100  // ❌ Đã bị xóa
}

// ✅ MỚI - Course không có students
{
  _id: "...",
  name: "Lập trình Web", 
  code: "IT4409",
  academicYear: "2024-2025", // ✅ Mới thêm
  semester: "HK1",           // ✅ Mới thêm
  credits: 3,                // ✅ Mới thêm
  classes: [...]             // ✅ Virtual field chứa các lớp học
}
```

### 2. Class Model (Hoàn toàn mới)
```javascript
{
  _id: "...",
  name: "Lập trình Web - Lớp 1",
  code: "IT4409_L01",
  course: "COURSE_ID",        // Liên kết với Course
  teacher: "TEACHER_ID",
  students: [...],            // ✅ Sinh viên thuộc về Class
  schedule: {
    dayOfWeek: 2,             // 0=CN, 1=T2, ..., 6=T7
    startTime: "08:00",
    endTime: "10:00", 
    room: "P101"
  },
  maxStudents: 35,            // ✅ Giới hạn sinh viên của lớp
  studentCount: 0             // ✅ Virtual field
}
```

## 🔄 API Changes

### Course APIs
```javascript
// ❌ CŨ - Enroll vào course
POST /api/courses/:id/enroll     // ❌ Deprecated
DELETE /api/courses/:id/enroll   // ❌ Deprecated

// ✅ MỚI - Thêm filter theo năm học/học kỳ
GET /api/courses?academicYear=2024-2025&semester=HK1
GET /api/courses/academic-years
GET /api/courses/semesters?academicYear=2024-2025
GET /api/courses/by-semester?academicYear=2024-2025&semester=HK1
```

### Class APIs (Hoàn toàn mới)
```javascript
// ✅ MỚI - Enroll vào class
POST /api/classes/:id/enroll     // ✅ Sử dụng thay thế
POST /api/classes/:id/unenroll   // ✅ Sử dụng thay thế

GET /api/classes/by-semester?academicYear=2024-2025&semester=HK1
GET /api/classes?course=COURSE_ID
POST /api/classes                // Tạo lớp học mới
PUT /api/classes/:id
DELETE /api/classes/:id
```

### Academic APIs (Hoàn toàn mới)
```javascript
GET /api/academic/overview          // Tổng quan hệ thống
GET /api/academic/semester-data     // Dữ liệu học kỳ
GET /api/academic/student-enrollment // Lớp học đã đăng ký
```

## 🎯 Frontend Updates Required

### 1. Student Flow - Chọn lớp học thay vì khóa học

#### A. Trang chọn học kỳ (MỚI)
```typescript
// components/SemesterSelector.tsx
const SemesterSelector = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  
  // Gọi API mới
  useEffect(() => {
    fetch('/api/academic/overview')
      .then(res => res.json())
      .then(data => setAcademicYears(data.data));
  }, []);
  
  return (
    <div>
      <select onChange={(e) => setSelectedYear(e.target.value)}>
        {academicYears.map(year => (
          <option key={year.academicYear} value={year.academicYear}>
            {year.academicYear}
          </option>
        ))}
      </select>
      
      <select onChange={(e) => setSelectedSemester(e.target.value)}>
        {semesters.map(sem => (
          <option key={sem.semester} value={sem.semester}>
            {sem.semesterName}
          </option>
        ))}
      </select>
    </div>
  );
};
```

#### B. Trang hiển thị khóa học và lớp học
```typescript
// ❌ CŨ - Enroll trực tiếp vào course
const enrollCourse = async (courseId) => {
  await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' });
};

// ✅ MỚI - Hiển thị classes và enroll vào class
const CourseList = ({ academicYear, semester }) => {
  const [semesterData, setSemesterData] = useState(null);
  
  useEffect(() => {
    fetch(`/api/academic/semester-data?academicYear=${academicYear}&semester=${semester}`)
      .then(res => res.json())
      .then(data => setSemesterData(data.data));
  }, [academicYear, semester]);
  
  const enrollClass = async (classId) => {
    await fetch(`/api/classes/${classId}/enroll`, { method: 'POST' });
  };
  
  return (
    <div>
      {semesterData?.courses.map(course => (
        <div key={course._id}>
          <h3>{course.name} ({course.credits} tín chỉ)</h3>
          <div>
            {course.classes.map(cls => (
              <div key={cls._id}>
                <h4>{cls.name}</h4>
                <p>Lịch: {getDayName(cls.schedule.dayOfWeek)} {cls.schedule.startTime}-{cls.schedule.endTime}</p>
                <p>Phòng: {cls.schedule.room}</p>
                <p>Sĩ số: {cls.studentCount}/{cls.maxStudents}</p>
                <button onClick={() => enrollClass(cls._id)}>
                  Đăng ký lớp này
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
```

#### C. Trang xem lớp học đã đăng ký
```typescript
// ✅ MỚI - API xem enrollment
const MyClasses = () => {
  const [enrollment, setEnrollment] = useState(null);
  
  useEffect(() => {
    fetch('/api/academic/student-enrollment')
      .then(res => res.json())
      .then(data => setEnrollment(data.data));
  }, []);
  
  return (
    <div>
      <h2>Lớp học đã đăng ký</h2>
      {enrollment?.enrollmentByTerm.map(term => (
        <div key={`${term.academicYear}-${term.semester}`}>
          <h3>{term.academicYear} - {term.semesterName}</h3>
          <p>Tổng tín chỉ: {term.totalCredits}</p>
          {term.classes.map(cls => (
            <div key={cls._id}>
              <h4>{cls.course.name} - {cls.name}</h4>
              <p>Lịch: {getDayName(cls.schedule.dayOfWeek)} {cls.schedule.startTime}-{cls.schedule.endTime}</p>
              <p>Phòng: {cls.schedule.room}</p>
              <button onClick={() => unenrollClass(cls._id)}>
                Hủy đăng ký
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

### 2. Teacher Flow - Tạo khóa học và lớp học

#### A. Form tạo khóa học (CẬP NHẬT)
```typescript
// ✅ THÊM fields mới
const CreateCourseForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    academicYear: '',      // ✅ MỚI
    semester: '',          // ✅ MỚI  
    credits: 3             // ✅ MỚI
  });
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Existing fields */}
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="code" value={formData.code} onChange={handleChange} />
      <textarea name="description" value={formData.description} onChange={handleChange} />
      
      {/* ✅ NEW fields */}
      <select name="academicYear" value={formData.academicYear} onChange={handleChange}>
        <option value="2024-2025">2024-2025</option>
        <option value="2025-2026">2025-2026</option>
      </select>
      
      <select name="semester" value={formData.semester} onChange={handleChange}>
        <option value="HK1">Học kỳ 1</option>
        <option value="HK2">Học kỳ 2</option>
        <option value="HK_HE">Học kỳ hè</option>
      </select>
      
      <input type="number" name="credits" min="1" max="10" 
             value={formData.credits} onChange={handleChange} />
      
      <button type="submit">Tạo khóa học</button>
    </form>
  );
};
```

#### B. Form tạo lớp học (HOÀN TOÀN MỚI)
```typescript
const CreateClassForm = ({ courseId }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    schedule: {
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '10:00',
      room: ''
    },
    maxStudents: 35
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        course: courseId
      })
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Tên lớp học" />
      <input name="code" placeholder="Mã lớp (tự động nếu để trống)" />
      
      <select name="schedule.dayOfWeek">
        <option value={1}>Thứ 2</option>
        <option value={2}>Thứ 3</option>
        {/* ... */}
      </select>
      
      <input type="time" name="schedule.startTime" />
      <input type="time" name="schedule.endTime" />
      <input name="schedule.room" placeholder="Phòng học" />
      <input type="number" name="maxStudents" min="1" />
      
      <button type="submit">Tạo lớp học</button>
    </form>
  );
};
```

### 3. Admin Dashboard Updates

```typescript
// ✅ Dashboard với thống kê mới
const AdminDashboard = () => {
  const [overview, setOverview] = useState([]);
  
  useEffect(() => {
    fetch('/api/academic/overview')
      .then(res => res.json())
      .then(data => setOverview(data.data));
  }, []);
  
  return (
    <div>
      <h1>Tổng quan hệ thống</h1>
      {overview.map(year => (
        <div key={year.academicYear}>
          <h2>Năm học {year.academicYear}</h2>
          {year.semesters.map(sem => (
            <div key={sem.semester}>
              <h3>{sem.semesterName}</h3>
              <p>Khóa học: {sem.courseCount}</p>
              <p>Lớp học: {sem.classCount}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

## 🚨 Migration Checklist

### Backend ✅ DONE
- [x] Course model updated
- [x] Class model created  
- [x] API endpoints updated
- [x] Data migration script
- [x] Documentation

### Frontend 🚧 TODO
- [ ] Update student enrollment flow
- [ ] Add semester selector component
- [ ] Update course display to show classes
- [ ] Create class management for teachers
- [ ] Update admin dashboard
- [ ] Remove old course enrollment APIs
- [ ] Add class enrollment APIs
- [ ] Test all user flows

### Database 🎯 PRIORITY
- [ ] Run migration script on production
- [ ] Create classes for existing courses
- [ ] Manually enroll students into classes
- [ ] Verify data integrity

## 📞 Support
Nếu có vấn đề gì trong quá trình migration, vui lòng liên hệ để được hỗ trợ!
