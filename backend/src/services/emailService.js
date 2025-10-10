// FILE: src/services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@grubgate.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'GrubGate';
    
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter based on environment configuration
   */
  initializeTransporter() {
    try {
      // Use Gmail/Nodemailer if configured
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        console.log('📧 Email Service: Using configured SMTP (Gmail)');
      }
      // Use SendGrid if API key is provided
      else if (process.env.SENDGRID_API_KEY) {
        this.transporter = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
        console.log('📧 Email Service: Using SendGrid');
      }
      // Alternative: Use SMTP configuration
      else if (process.env.SMTP_HOST) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        console.log('📧 Email Service: Using custom SMTP');
      }
      // Development: Use Ethereal (test email service)
      else if (process.env.NODE_ENV === 'development') {
        // For development, we'll create a test account
        this.createTestAccount();
      }
    } catch (error) {
      console.error('Email Service Initialization Error:', error);
    }
  }

  /**
   * Create test account for development
   */
  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log('📧 Email Service: Using Ethereal (Development Mode)');
      console.log(`Test account created: ${testAccount.user}`);
      console.log('Preview URLs will be logged for sent emails');
      console.log('---');
    } catch (error) {
      console.error('Failed to create test email account:', error);
    }
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} options.html - HTML content
   * @returns {Promise<Object>} Result object
   */
  async sendEmail({ to, subject, text, html }) {
    try {
      // If no transporter is configured, log the email (for development)
      if (!this.transporter) {
        console.log('📧 Email Service (Development Mode):');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${text || html}`);
        console.log('---');
        
        return {
          success: true,
          messageId: `dev_${Date.now()}`,
          message: 'Email sent successfully (development mode)'
        };
      }

      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject,
        text,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);

      // For development with Ethereal, log preview URL
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email sent successfully!');
        console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
      }

      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      };

    } catch (error) {
      console.error('Email Service Error:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email'
      };
    }
  }

  /**
   * Send OTP via email
   * @param {string} email - Email address to send to
   * @param {string} otp - OTP code
   * @param {string} appName - Application name
   * @returns {Promise<Object>} Result object
   */
  async sendOTP(email, otp, appName = 'GrubGate') {
    const subject = `Your ${appName} Verification Code`;
    
    const text = `
Your ${appName} verification code is: ${otp}

This code will expire in 5 minutes.
Do not share this code with anyone.

If you didn't request this code, please ignore this email.

Best regards,
The ${appName} Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            text-align: center; 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            letter-spacing: 4px;
            color: #800020;
        }
        .footer { margin-top: 30px; font-size: 14px; color: #666; }
        .warning { color: #e74c3c; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${appName}</h1>
            <h2>Verification Code</h2>
        </div>
        
        <p>Your verification code is:</p>
        
        <div class="otp-code">${otp}</div>
        
        <p><strong>This code will expire in 5 minutes.</strong></p>
        
        <p class="warning">Do not share this code with anyone.</p>
        
        <div class="footer">
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Best regards,<br>The ${appName} Team</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    return await this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  /**
   * Check if email service is configured
   * @returns {boolean} True if configured
   */
  isConfigured() {
    return !!this.transporter;
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  validateEmail(email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
module.exports = new EmailService();
