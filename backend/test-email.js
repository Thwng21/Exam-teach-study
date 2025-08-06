require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testEmail() {
  console.log('🔍 Đang kiểm tra cấu hình email...\n');

  // Kiểm tra biến môi trường
  console.log('📋 Cấu hình hiện tại:');
  console.log(`   SMTP_USER: ${process.env.SMTP_USER || '❌ Chưa cấu hình'}`);
  console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Đã cấu hình (' + process.env.SMTP_PASS.length + ' ký tự)' : '❌ Chưa cấu hình'}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || '❌ Chưa cấu hình'}\n`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ Vui lòng cấu hình SMTP_USER và SMTP_PASS trong file .env');
    return;
  }

  try {
    // Test kết nối
    console.log('🔗 Đang test kết nối email...');
    const connectionTest = await emailService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Kết nối email thành công!\n');
      
      // Hỏi có muốn gửi email test không
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('📧 Nhập email để test gửi (Enter để bỏ qua): ', async (testEmail) => {
        if (testEmail.trim()) {
          console.log(`📤 Đang gửi email test đến ${testEmail}...`);
          
          try {
            const result = await emailService.sendForgotPasswordEmail(testEmail, 'test-token-123');
            
            if (result.success) {
              console.log('✅ Gửi email thành công!');
              console.log(`📧 Message ID: ${result.messageId}`);
              console.log('🔍 Kiểm tra hộp thư đến và thư mục spam.');
            } else {
              console.log('❌ Gửi email thất bại:', result.error);
            }
          } catch (error) {
            console.log('❌ Lỗi gửi email:', error.message);
          }
        } else {
          console.log('⏭️  Bỏ qua test gửi email.');
        }
        
        rl.close();
        console.log('\n🎉 Test hoàn tất!');
      });
      
    } else {
      console.log('❌ Kết nối email thất bại:', connectionTest.error);
      console.log('\n💡 Hướng dẫn khắc phục:');
      console.log('   1. Kiểm tra SMTP_USER có đúng định dạng email');
      console.log('   2. Kiểm tra SMTP_PASS có đúng 16 ký tự app password');
      console.log('   3. Đảm bảo đã bật 2-Step Verification trên Gmail');
      console.log('   4. Tạo lại App Password nếu cần');
    }
    
  } catch (error) {
    console.log('❌ Lỗi test email:', error.message);
  }
}

// Chạy test
testEmail();
