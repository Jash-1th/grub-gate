// FILE: src/services/email.service.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your GrubGate Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #800020;">Welcome to GrubGate!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="background-color: #800020; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
            Verify Email
          </a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you didn't create an account with GrubGate, please ignore this email.
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Your GrubGate Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #800020;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" style="background-color: #800020; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
            Reset Password
          </a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 10 minutes.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(email, order) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #800020;">Order Confirmed!</h2>
          <p>Thank you for your order. Here are the details:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order #${order.orderNumber}</h3>
            <p><strong>Restaurant:</strong> ${order.restaurantId.name}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            <p><strong>Estimated Delivery:</strong> ${order.deliveryTime.estimated ? new Date(order.deliveryTime.estimated).toLocaleString() : 'TBD'}</p>
          </div>

          <h4>Items Ordered:</h4>
          <ul>
            ${order.items.map(item => `
              <li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
            `).join('')}
          </ul>

          <p>We'll send you updates as your order is prepared and delivered.</p>
          
          <hr>
          <p style="color: #666; font-size: 12px;">
            Questions? Contact us at support@grubgate.com
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  /**
   * Send order status update
   */
  async sendOrderStatusUpdate(email, order, newStatus) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      preparing: 'Your order is now being prepared by the restaurant.',
      ready: 'Your order is ready for pickup/delivery.',
      'out-for-delivery': 'Your order is out for delivery.',
      delivered: 'Your order has been delivered. Enjoy your meal!',
      cancelled: 'Your order has been cancelled.'
    };

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Order Update - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #800020;">Order Update</h2>
          <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order #${order.orderNumber}</h3>
            <p><strong>Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</p>
            <p><strong>Restaurant:</strong> ${order.restaurantId.name}</p>
          </div>

          <hr>
          <p style="color: #666; font-size: 12px;">
            Track your order at ${process.env.FRONTEND_URL}/orders/${order._id}
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  /**
   * Send contact form response
   */
  async sendContactResponse(email, name, response) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Response to Your GrubGate Inquiry',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #800020;">Thank you for contacting GrubGate</h2>
          <p>Hi ${name},</p>
          <p>Thank you for reaching out to us. Here's our response to your inquiry:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${response}
          </div>

          <p>If you have any additional questions, please don't hesitate to contact us.</p>
          
          <hr>
          <p style="color: #666; font-size: 12px;">
            Best regards,<br>
            The GrubGate Support Team<br>
            support@grubgate.com
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  /**
   * Send subscription meal plan reminder
   */
  async sendWeeklyPlanReminder(email, subscriptionMealPlan) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Weekly Meal Plan Starts Tomorrow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #800020;">Your Weekly Meal Plan Starts Tomorrow!</h2>
          <p>Just a friendly reminder that your weekly meal plan begins tomorrow.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Plan Details</h3>
            <p><strong>Restaurant:</strong> ${subscriptionMealPlan.restaurantId.name}</p>
            <p><strong>Start Date:</strong> ${new Date(subscriptionMealPlan.planStartDate).toLocaleDateString()}</p>
            <p><strong>Total Value:</strong> $${subscriptionMealPlan.totalPlanValue.toFixed(2)}</p>
          </div>

          <p>Your meals will be delivered according to the schedule you selected. We're excited to serve you!</p>
          
          <hr>
          <p style="color: #666; font-size: 12px;">
            Manage your weekly plan at ${process.env.FRONTEND_URL}/weekly-plans
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
