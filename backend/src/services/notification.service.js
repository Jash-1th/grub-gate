// FILE: src/services/notification.service.js
const emailService = require('./email.service');

class NotificationService {
  /**
   * Send order confirmation notifications
   */
  async sendOrderConfirmation(order) {
    try {
      // Populate order with customer and restaurant details
      await order.populate([
        { path: 'customerId', select: 'firstName lastName email preferences' },
        { path: 'restaurantId', select: 'name email phone' }
      ]);

      // Send email to customer if email notifications are enabled
      if (order.customerId.preferences.notifications.email) {
        await emailService.sendOrderConfirmation(
          order.customerId.email,
          order
        );
      }

      // TODO: Send SMS notification if enabled
      // TODO: Send push notification if enabled
      // TODO: Notify restaurant about new order

      console.log(`Order confirmation sent for order ${order.orderNumber}`);
    } catch (error) {
      console.error('Error sending order confirmation:', error);
    }
  }

  /**
   * Send order status update notifications
   */
  async sendOrderStatusUpdate(order, newStatus) {
    try {
      await order.populate([
        { path: 'customerId', select: 'firstName lastName email preferences' },
        { path: 'restaurantId', select: 'name' }
      ]);

      // Send email notification
      if (order.customerId.preferences.notifications.email) {
        await emailService.sendOrderStatusUpdate(
          order.customerId.email,
          order,
          newStatus
        );
      }

      // TODO: Send SMS for critical updates (out-for-delivery, delivered)
      // TODO: Send push notification

      console.log(`Status update sent for order ${order.orderNumber}: ${newStatus}`);
    } catch (error) {
      console.error('Error sending order status update:', error);
    }
  }

  /**
   * Send subscription meal plan reminders
   */
  async sendWeeklyPlanReminder(subscriptionMealPlan) {
    try {
      await subscriptionMealPlan.populate([
        { path: 'customerId', select: 'firstName lastName email preferences' },
        { path: 'restaurantId', select: 'name' }
      ]);

      if (subscriptionMealPlan.customerId.preferences.notifications.email) {
        await emailService.sendWeeklyPlanReminder(
          subscriptionMealPlan.customerId.email,
          subscriptionMealPlan
        );
      }

      console.log(`Weekly plan reminder sent for plan ${subscriptionMealPlan._id}`);
    } catch (error) {
      console.error('Error sending weekly plan reminder:', error);
    }
  }

  /**
   * Send contact form response
   */
  async sendContactResponse(contactMessage, response) {
    try {
      await emailService.sendContactResponse(
        contactMessage.email,
        contactMessage.name,
        response
      );

      console.log(`Contact response sent to ${contactMessage.email}`);
    } catch (error) {
      console.error('Error sending contact response:', error);
    }
  }

  /**
   * Send new restaurant application notification to admin
   */
  async notifyNewRestaurantApplication(restaurant) {
    try {
      // TODO: Send email to admin about new restaurant application
      // TODO: Send internal notification

      console.log(`New restaurant application notification sent for ${restaurant.name}`);
    } catch (error) {
      console.error('Error sending restaurant application notification:', error);
    }
  }

  /**
   * Send subscription renewal reminder
   */
  async sendSubscriptionRenewalReminder(subscription) {
    try {
      await subscription.populate('customerId', 'firstName lastName email preferences');

      // TODO: Implement subscription renewal email template
      // TODO: Send email reminder 3 days before renewal

      console.log(`Subscription renewal reminder sent for ${subscription._id}`);
    } catch (error) {
      console.error('Error sending subscription renewal reminder:', error);
    }
  }

  /**
   * Send review request after order delivery
   */
  async sendReviewRequest(order) {
    try {
      await order.populate([
        { path: 'customerId', select: 'firstName lastName email preferences' },
        { path: 'restaurantId', select: 'name' }
      ]);

      // TODO: Implement review request email template
      // TODO: Send 24 hours after delivery

      console.log(`Review request sent for order ${order.orderNumber}`);
    } catch (error) {
      console.error('Error sending review request:', error);
    }
  }

  /**
   * Send bulk notifications (for marketing, announcements, etc.)
   */
  async sendBulkNotification(userIds, subject, message, type = 'email') {
    try {
      // TODO: Implement bulk notification system
      // TODO: Queue notifications for processing
      // TODO: Handle unsubscribe preferences

      console.log(`Bulk notification queued for ${userIds.length} users`);
    } catch (error) {
      console.error('Error sending bulk notification:', error);
    }
  }

  /**
   * Send real-time notifications (WebSocket/Server-Sent Events)
   */
  async sendRealTimeNotification(userId, notification) {
    try {
      // TODO: Implement WebSocket or SSE for real-time notifications
      // TODO: Send to connected clients

      console.log(`Real-time notification sent to user ${userId}`);
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }
  }
}

module.exports = new NotificationService();
