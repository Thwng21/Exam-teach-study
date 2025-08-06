const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Cấu hình cho Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verify connection
    this.transporter.verify(function (error, success) {
      if (error) {
        console.log('❌ Email service connection failed:', error.message);
      } else {
        console.log('✅ Email service ready');
      }
    });
  }

  async sendForgotPasswordEmail(email, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"EduExam System" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🔐 Yêu cầu đặt lại mật khẩu - EduExam System',
        html: this.getForgotPasswordTemplate(resetUrl, email)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  getForgotPasswordTemplate(resetUrl, email) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt lại mật khẩu</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Đặt lại mật khẩu</h1>
                <p>EduExam System - Hệ thống thi trực tuyến</p>
            </div>
            
            <div class="content">
                <h2>Xin chào!</h2>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${email}</strong>.</p>
                
                <p>Để đặt lại mật khẩu, vui lòng click vào nút bên dưới:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Lưu ý quan trọng:</strong>
                    <ul>
                        <li>Link này chỉ có hiệu lực trong <strong>15 phút</strong></li>
                        <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                        <li>Không chia sẻ link này với bất kỳ ai khác</li>
                    </ul>
                </div>
                
                <p>Nếu nút không hoạt động, bạn có thể copy và paste link sau vào trình duyệt:</p>
                <p style="background: #e9ecef; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace;">
                    ${resetUrl}
                </p>
            </div>
            
            <div class="footer">
                <p>Email này được gửi từ hệ thống EduExam tự động. Vui lòng không trả lời email này.</p>
                <p>© 2025 EduExam System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
