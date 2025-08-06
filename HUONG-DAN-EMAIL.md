# 📧 HƯỚNG DẪN CẤU HÌNH EMAIL CHI TIẾT

## Bước 3: Tạo mật khẩu ứng dụng (tiếp tục)

4. **Chọn ứng dụng**: 
   - Click dropdown "Chọn ứng dụng" → Chọn "Mail"
   
5. **Chọn thiết bị**:
   - Click dropdown "Chọn thiết bị" → Chọn "Other (Custom name)"
   - Nhập tên: "EduExam System" hoặc tên bất kỳ

6. **Click "Tạo"** (Generate)

7. **Copy mật khẩu 16 ký tự** được hiển thị (dạng: xxxx xxxx xxxx xxxx)
   ⚠️ QUAN TRỌNG: Lưu lại mật khẩu này, bạn sẽ không thấy lại!

## Bước 4: Cấu hình trong dự án

Mở file `.env` trong thư mục backend và cập nhật:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_character_app_password
```

**Thay thế:**
- `your_gmail@gmail.com` → Email Gmail thực của bạn
- `your_16_character_app_password` → Mật khẩu 16 ký tự vừa tạo (không có dấu cách)

## Ví dụ cụ thể:

```env
SMTP_USER=examSystem2024@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

## Bước 5: Test kết nối

Sau khi cập nhật .env, restart server backend:
```bash
cd "d:\MY PROJECT\Exam-teach-study\backend"
npm start
```

Nếu thấy thông báo "✅ Email service ready" trong console → Thành công!
Nếu thấy "❌ Email service connection failed" → Kiểm tra lại cấu hình.

## Lưu ý bảo mật:

1. ❌ **KHÔNG** commit file .env lên Git
2. ✅ Dùng Gmail riêng cho ứng dụng
3. ✅ Đổi mật khẩu app nếu nghi ngờ bị lộ
4. ✅ Kiểm tra file .gitignore có chứa `.env`

## Nếu gặp lỗi:

**Lỗi "Invalid login":**
- Kiểm tra email và app password
- Đảm bảo đã bật 2FA
- Thử tạo lại app password

**Lỗi "Connection timeout":**
- Kiểm tra kết nối internet
- Kiểm tra firewall/antivirus
- Thử port 465 thay vì 587
