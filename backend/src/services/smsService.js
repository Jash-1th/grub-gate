// FILE: src/services/smsService.js
const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Initialize Twilio client if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  /**
   * Send SMS message
   * @param {string} to - Phone number to send to (E.164 format)
   * @param {string} message - Message content
   * @returns {Promise<Object>} Result object
   */
  async sendSMS(to, message) {
    try {
      // If Twilio is not configured, log the message (for development)
      if (!this.client) {
        console.log('📱 SMS Service (Development Mode):');
        console.log(`To: ${to}`);
        console.log(`Message: ${message}`);
        console.log('---');
        
        return {
          success: true,
          messageId: `dev_${Date.now()}`,
          message: 'SMS sent successfully (development mode)'
        };
      }

      // Send SMS using Twilio
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });

      return {
        success: true,
        messageId: result.sid,
        message: 'SMS sent successfully'
      };

    } catch (error) {
      console.error('SMS Service Error:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to send SMS'
      };
    }
  }

  /**
   * Send OTP via SMS
   * @param {string} phoneNumber - Phone number to send to
   * @param {string} otp - OTP code
   * @param {string} appName - Application name
   * @returns {Promise<Object>} Result object
   */
  async sendOTP(phoneNumber, otp, appName = 'GrubGate') {
    const message = `Your ${appName} verification code is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`;
    
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Check if SMS service is configured
   * @returns {boolean} True if configured
   */
  isConfigured() {
    return !!(this.client && this.fromNumber);
  }

  /**
   * Validate phone number format (basic E.164 validation)
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} True if valid
   */
  validatePhoneNumber(phoneNumber) {
    const e164Regex = /^\+?[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Format phone number to E.164 format
   * @param {string} phoneNumber - Phone number to format
   * @param {string} defaultCountryCode - Default country code (e.g., '+1')
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phoneNumber, defaultCountryCode = '+1') {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If it starts with country code, add +
    if (digits.length > 10) {
      return `+${digits}`;
    }
    
    // If it's a 10-digit number, add default country code
    if (digits.length === 10) {
      return `${defaultCountryCode}${digits}`;
    }
    
    // Return as is if we can't determine format
    return phoneNumber;
  }
}

// Export singleton instance
module.exports = new SMSService();
